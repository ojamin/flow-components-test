<script setup lang="ts">
// Aggregate-list editor for SchemaForm.
//
// Renders an editable list of `{ sourceField, operation, outputField }` rows
// backed by the canonical config array shape (no converter step). Used by
// Group By's `aggregates` and any future component that exposes per-row
// aggregate authoring. Operations are declared on the descriptor so the
// control stays reusable for non-Group-By aggregate semantics.
//
// Source-field cells reuse the data-path picker pattern (Input + registered
// picker) so picking record fields stays consistent with the field-list
// editor and `recordFieldParam` controls. Newly-added blank rows stay local
// until their source field is non-empty so host schemas that reject empty
// source fields cannot turn the Add button into a silent no-op.

import { computed, ref, watch } from "vue";

import { getRegisteredDataPathPicker } from "./data-path-picker-adapter";
import {
  Badge,
  Button,
  Icon,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./component-ui-primitives";
import type { InputPortDefinition, ParamDescriptor, ParamSelectOption } from "./public-sdk";

interface AggregateRow {
  sourceField: string;
  operation: string;
  outputField: string;
}

interface DraftAggregateRow extends AggregateRow {
  id: number;
  touched: boolean;
}

interface DisplayAggregateRow extends AggregateRow {
  key: string;
  source: "persisted" | "draft";
  sourceIndex: number;
  touched: boolean;
}

const props = withDefaults(
  defineProps<{
    fieldKey: string;
    descriptor: ParamDescriptor;
    modelValue: readonly AggregateRow[];
    /**
     * Sibling config snapshot. When the descriptor declares
     * `sourcePickerRootPathKey`, the value of that key (e.g. `config.rowsPath`)
     * is forwarded to the registered data-path picker as `rootPath` so the
     * source-field browse tree only exposes fields inside the resolved
     * sub-tree.
     */
    config?: Record<string, unknown>;
    inputs?: readonly InputPortDefinition[];
    instanceId?: string;
    /** Hide the outer label/badge row (bindable wrappers reuse the parent). */
    hideLabel?: boolean;
    /**
     * Resolved disabled state from a sibling `disabledWhen` predicate. Persisted
     * rows stay visible/readable but every row input, picker, select trigger,
     * add/remove button is non-interactive, and every commit helper no-ops so
     * a stray child event cannot mutate config.
     */
    disabled?: boolean;
  }>(),
  {
    config: undefined,
    inputs: () => [],
    instanceId: undefined,
    hideLabel: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: AggregateRow[]): void;
}>();

const registeredDataPathPicker = computed(() => getRegisteredDataPathPicker());

const aggregateControl = computed(() =>
  props.descriptor.meta.control.kind === "aggregate-list" ? props.descriptor.meta.control : null,
);

const items = computed<readonly AggregateRow[]>(() => props.modelValue ?? []);

const draftRows = ref<DraftAggregateRow[]>([]);
let nextDraftId = 1;

const operations = computed<readonly ParamSelectOption[]>(
  () => aggregateControl.value?.operations ?? [],
);

// Resolve the source-field picker scope from the sibling config key
// declared on the descriptor. Blank/missing reads return undefined so the
// picker stays at the unscoped default rather than silently snapping to root.
const sourcePickerRootPath = computed<string | undefined>(() => {
  const key = aggregateControl.value?.sourcePickerRootPathKey;
  if (!key) return undefined;
  const value = props.config?.[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
});

const sourcePlaceholder = computed(() => aggregateControl.value?.sourcePlaceholder ?? "field path");
const outputPlaceholder = computed(
  () => aggregateControl.value?.outputPlaceholder ?? "result name",
);
const addLabel = computed(() => aggregateControl.value?.addLabel ?? "Add aggregate");

const defaultOperation = computed(() => operations.value[0]?.value ?? "");

const displayRows = computed<DisplayAggregateRow[]>(() => [
  ...items.value.map((row, index) => ({
    ...row,
    key: `persisted:${index}`,
    source: "persisted" as const,
    sourceIndex: index,
    touched: true,
  })),
  ...draftRows.value.map((row) => ({
    sourceField: row.sourceField,
    operation: row.operation,
    outputField: row.outputField,
    key: `draft:${row.id}`,
    source: "draft" as const,
    sourceIndex: row.id,
    touched: row.touched,
  })),
]);

const hasInvalidEmptySource = computed(() => displayRows.value.some(isInvalidEmptySource));

function rootTestId(): string {
  return aggregateControl.value?.testId ?? `${props.fieldKey}-aggregate-list`;
}

function rowTestId(index: number, suffix: string): string {
  return `${props.fieldKey}-aggregate-list-row-${index}-${suffix}`;
}

function isEmptySource(row: DisplayAggregateRow): boolean {
  return row.sourceField.trim().length === 0;
}

function isInvalidEmptySource(row: DisplayAggregateRow): boolean {
  return isEmptySource(row) && (row.source === "persisted" || row.touched);
}

function commitDraftRows(nextDraftRows: DraftAggregateRow[]) {
  if (props.disabled) return;
  const committedDraftRows = nextDraftRows.filter((row) => row.sourceField.trim().length > 0);
  if (committedDraftRows.length === 0) {
    draftRows.value = nextDraftRows;
    return;
  }
  draftRows.value = nextDraftRows.filter((row) => row.sourceField.trim().length === 0);
  emit(
    "update:modelValue",
    committedDraftRows.reduce<AggregateRow[]>(
      (next, row) => [
        ...next,
        {
          sourceField: row.sourceField,
          operation: row.operation || defaultOperation.value,
          outputField: row.outputField,
        },
      ],
      [...items.value],
    ),
  );
}

function patchPersistedRow(index: number, patch: Partial<AggregateRow>) {
  if (props.disabled) return;
  const next = items.value.map((row, rowIndex) =>
    rowIndex === index ? { ...row, ...patch } : row,
  );
  emit("update:modelValue", next);
}

function patchDraftRow(rowId: number, patch: Partial<AggregateRow>) {
  if (props.disabled) return;
  const nextDraftRows = draftRows.value.map((row) =>
    row.id === rowId ? { ...row, ...patch, touched: row.touched || patch.sourceField === "" } : row,
  );
  commitDraftRows(nextDraftRows);
}

function patchRow(row: DisplayAggregateRow, patch: Partial<AggregateRow>) {
  if (props.disabled) return;
  if (row.source === "draft") {
    patchDraftRow(row.sourceIndex, patch);
    return;
  }
  patchPersistedRow(row.sourceIndex, patch);
}

function removeRow(row: DisplayAggregateRow) {
  if (props.disabled) return;
  if (row.source === "draft") {
    draftRows.value = draftRows.value.filter((entry) => entry.id !== row.sourceIndex);
    return;
  }
  emit(
    "update:modelValue",
    items.value.filter((_, rowIndex) => rowIndex !== row.sourceIndex),
  );
}

function markRowTouched(row: DisplayAggregateRow) {
  if (props.disabled) return;
  if (row.source !== "draft") return;
  draftRows.value = draftRows.value.map((entry) =>
    entry.id === row.sourceIndex ? { ...entry, touched: true } : entry,
  );
}

function addRow() {
  if (props.disabled) return;
  const created: DraftAggregateRow = {
    id: nextDraftId++,
    sourceField: "",
    operation: defaultOperation.value,
    outputField: "",
    touched: false,
  };
  draftRows.value = [...draftRows.value, created];
}

watch(
  () => JSON.stringify(items.value),
  () => {
    draftRows.value = [];
  },
);
</script>

<template>
  <fieldset class="flex flex-col gap-2" :data-field="fieldKey" :data-testid="rootTestId()">
    <div v-if="!hideLabel" class="flex items-center justify-between gap-2">
      <Label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {{ descriptor.meta.label }}
      </Label>
      <Badge variant="outline" class="text-[10px]">
        {{ displayRows.length }} {{ displayRows.length === 1 ? "row" : "rows" }}
      </Badge>
    </div>

    <p v-if="!hideLabel && descriptor.meta.helpText" class="text-xs text-muted-foreground/70">
      {{ descriptor.meta.helpText }}
    </p>

    <p
      v-if="displayRows.length === 0"
      class="rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground/70"
      :data-testid="`${fieldKey}-aggregate-list-empty`"
    >
      No aggregates yet. Add one to compute a per-group summary value.
    </p>

    <div
      v-for="(row, index) in displayRows"
      :key="row.key"
      class="flex flex-col gap-1.5 rounded-md border border-border/40 bg-muted/20 p-2"
      :data-testid="rowTestId(index, 'row')"
      :data-row-index="index"
      :data-row-invalid="isInvalidEmptySource(row) ? 'true' : undefined"
    >
      <div class="flex items-start gap-2">
        <div class="flex flex-1 flex-col gap-1.5">
          <Label
            class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            :for="`${fieldKey}-aggregate-list-row-${index}-source`"
          >
            Source field
          </Label>
          <div class="flex items-center gap-1">
            <Input
              :id="`${fieldKey}-aggregate-list-row-${index}-source`"
              :model-value="row.sourceField"
              :placeholder="sourcePlaceholder"
              :aria-label="`Source field for aggregate row ${index + 1}`"
              :aria-invalid="isInvalidEmptySource(row) || undefined"
              class="h-8 flex-1 font-code text-xs"
              :data-testid="rowTestId(index, 'source')"
              :disabled="disabled"
              @update:model-value="
                (value: string | number) => patchRow(row, { sourceField: String(value) })
              "
              @blur="markRowTouched(row)"
            />
            <component
              :is="registeredDataPathPicker"
              v-if="registeredDataPathPicker"
              :model-value="row.sourceField"
              :field-label="`Source field row ${index + 1}`"
              mode="literal"
              output-format="relative"
              :instance-id="instanceId"
              :inputs="inputs"
              :root-path="sourcePickerRootPath"
              :data-testid="rowTestId(index, 'source-picker')"
              :disabled="disabled"
              :aria-disabled="disabled || undefined"
              @update:model-value="(value: string) => patchRow(row, { sourceField: value })"
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          type="button"
          class="mt-5"
          :aria-label="`Remove aggregate row ${index + 1}`"
          :data-testid="rowTestId(index, 'remove')"
          :disabled="disabled"
          @click="removeRow(row)"
        >
          <Icon icon="lucide:x" class="size-3" />
        </Button>
      </div>

      <div class="flex items-end gap-2">
        <div class="flex w-32 flex-col gap-1.5">
          <Label
            class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            :for="`${fieldKey}-aggregate-list-row-${index}-operation`"
          >
            Operation
          </Label>
          <Select
            :model-value="row.operation"
            :disabled="disabled"
            @update:model-value="
              (value: unknown) => patchRow(row, { operation: String(value ?? '') })
            "
          >
            <SelectTrigger
              :id="`${fieldKey}-aggregate-list-row-${index}-operation`"
              class="h-8 w-full text-xs"
              :aria-label="`Operation for aggregate row ${index + 1}`"
              :data-testid="rowTestId(index, 'operation')"
              :disabled="disabled"
            >
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="option in operations" :key="option.value" :value="option.value">{{
                option.label
              }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex flex-1 flex-col gap-1.5">
          <Label
            class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            :for="`${fieldKey}-aggregate-list-row-${index}-output`"
          >
            Output field
          </Label>
          <Input
            :id="`${fieldKey}-aggregate-list-row-${index}-output`"
            :model-value="row.outputField"
            :placeholder="outputPlaceholder"
            :aria-label="`Output field for aggregate row ${index + 1}`"
            class="h-8 flex-1 font-code text-xs"
            :data-testid="rowTestId(index, 'output')"
            :disabled="disabled"
            @update:model-value="
              (value: string | number) => patchRow(row, { outputField: String(value) })
            "
          />
        </div>
      </div>
    </div>

    <Button
      variant="outline"
      size="sm"
      type="button"
      class="w-full"
      :data-testid="`${fieldKey}-aggregate-list-add`"
      :disabled="disabled"
      @click="addRow"
    >
      <Icon icon="lucide:plus" class="size-3.5" data-icon="inline-start" />
      {{ addLabel }}
    </Button>

    <p
      v-if="hasInvalidEmptySource"
      class="text-xs text-destructive"
      role="alert"
      :data-testid="`${fieldKey}-aggregate-list-validation-empty`"
    >
      Aggregate rows must have a source field.
    </p>
  </fieldset>
</template>

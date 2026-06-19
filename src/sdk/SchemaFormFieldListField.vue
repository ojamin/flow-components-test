<script setup lang="ts">
// Field-list editor for SchemaForm.
//
// Renders an editable list of record-field paths backed by a plain
// `string[]` config value. Each row uses a record-field control so the data
// path picker (when registered) and the input fallback stay consistent with
// other path-flavoured fields. Used by Group By's `groupByFields` and any
// future "select N field paths" config.
//
// Empty newly-added rows stay local until the user enters a non-empty field so
// host schemas that reject blank list entries do not prevent the draft row and
// scoped picker from rendering.

import { computed, ref, watch } from "vue";

import { getRegisteredDataPathPicker } from "./data-path-picker-adapter";
import { Badge, Button, Icon, Input, Label } from "./component-ui-primitives";
import type { InputPortDefinition, ParamDescriptor } from "./public-sdk";

const props = withDefaults(
  defineProps<{
    fieldKey: string;
    descriptor: ParamDescriptor;
    modelValue: readonly string[];
    /**
     * Sibling config snapshot. When the descriptor declares
     * `pickerRootPathKey`, the value of that key (e.g. `config.rowsPath`) is
     * forwarded to the registered data-path picker as `rootPath` so the
     * browse tree only exposes fields inside the resolved sub-tree.
     */
    config?: Record<string, unknown>;
    inputs?: readonly InputPortDefinition[];
    instanceId?: string;
    /** Hide the outer label/badge row (bindable wrappers reuse the parent). */
    hideLabel?: boolean;
    /**
     * Resolved disabled state from a sibling `disabledWhen` predicate. Persisted
     * rows stay visible/readable but every row input, picker, add/remove
     * button is switched to a non-interactive state, and every commit/emit
     * helper no-ops so a stray child event cannot mutate config.
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
  (e: "update:modelValue", value: string[]): void;
}>();

const registeredDataPathPicker = computed(() => getRegisteredDataPathPicker());

interface DraftRow {
  id: number;
  value: string;
  touched: boolean;
}

interface DisplayRow {
  key: string;
  value: string;
  source: "persisted" | "draft";
  sourceIndex: number;
  touched: boolean;
}

const draftRows = ref<DraftRow[]>([]);
let nextDraftId = 1;

const fieldListControl = computed(() =>
  props.descriptor.meta.control.kind === "field-list" ? props.descriptor.meta.control : null,
);

const items = computed<readonly string[]>(() => props.modelValue ?? []);

const displayRows = computed<DisplayRow[]>(() => [
  ...items.value.map((entry, index) => ({
    key: `persisted:${index}`,
    value: entry,
    source: "persisted" as const,
    sourceIndex: index,
    touched: true,
  })),
  ...draftRows.value.map((entry, index) => ({
    key: `draft:${entry.id}`,
    value: entry.value,
    source: "draft" as const,
    sourceIndex: index,
    touched: entry.touched,
  })),
]);

function isEmptyRow(row: DisplayRow): boolean {
  return row.value.trim().length === 0;
}

function isInvalidEmptyRow(row: DisplayRow): boolean {
  return isEmptyRow(row) && (row.source === "persisted" || row.touched);
}

const hasInvalidEmptyRow = computed(() => displayRows.value.some(isInvalidEmptyRow));

const placeholder = computed(() => fieldListControl.value?.itemPlaceholder ?? "field path");
const addLabel = computed(() => fieldListControl.value?.addLabel ?? "Add field");

// Resolve the picker scope from the sibling config key declared on the
// descriptor. Blank/missing reads return undefined so the picker stays at
// the unscoped default rather than silently snapping to root.
const pickerRootPath = computed<string | undefined>(() => {
  const key = fieldListControl.value?.pickerRootPathKey;
  if (!key) return undefined;
  const value = props.config?.[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
});

function rootTestId(): string {
  return fieldListControl.value?.testId ?? `${props.fieldKey}-field-list`;
}

function rowTestId(index: number, suffix: string): string {
  return `${props.fieldKey}-field-list-row-${index}-${suffix}`;
}

function commitDraftRows(nextDraftRows: DraftRow[]) {
  if (props.disabled) return;
  const committedDraftValues = nextDraftRows
    .map((entry) => entry.value)
    .filter((entry) => entry.trim().length > 0);
  if (committedDraftValues.length === 0) {
    draftRows.value = nextDraftRows;
    return;
  }
  draftRows.value = nextDraftRows.filter((entry) => entry.value.trim().length === 0);
  emit("update:modelValue", [...items.value, ...committedDraftValues]);
}

function patchRow(row: DisplayRow, value: string) {
  if (props.disabled) return;
  if (row.source === "draft") {
    const nextDraftRows = draftRows.value.map((entry, entryIndex) =>
      entryIndex === row.sourceIndex
        ? { ...entry, value, touched: entry.touched || value.trim().length === 0 }
        : entry,
    );
    commitDraftRows(nextDraftRows);
    return;
  }
  const next = items.value.map((entry, entryIndex) =>
    entryIndex === row.sourceIndex ? value : entry,
  );
  emit("update:modelValue", next);
}

function removeRow(row: DisplayRow) {
  if (props.disabled) return;
  if (row.source === "draft") {
    draftRows.value = draftRows.value.filter((_, entryIndex) => entryIndex !== row.sourceIndex);
    return;
  }
  emit(
    "update:modelValue",
    items.value.filter((_, entryIndex) => entryIndex !== row.sourceIndex),
  );
}

function markRowTouched(row: DisplayRow) {
  if (props.disabled) return;
  if (row.source !== "draft") return;
  draftRows.value = draftRows.value.map((entry, entryIndex) =>
    entryIndex === row.sourceIndex ? { ...entry, touched: true } : entry,
  );
}

function addRow() {
  if (props.disabled) return;
  draftRows.value = [...draftRows.value, { id: nextDraftId++, value: "", touched: false }];
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
        {{ displayRows.length }} {{ displayRows.length === 1 ? "field" : "fields" }}
      </Badge>
    </div>

    <p v-if="!hideLabel && descriptor.meta.helpText" class="text-xs text-muted-foreground/70">
      {{ descriptor.meta.helpText }}
    </p>

    <p
      v-if="displayRows.length === 0"
      class="rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground/70"
      :data-testid="`${fieldKey}-field-list-empty`"
    >
      No fields yet. Add at least one field to include.
    </p>

    <div
      v-for="(row, index) in displayRows"
      :key="row.key"
      class="flex items-center gap-1"
      :data-testid="rowTestId(index, 'row')"
      :data-row-index="index"
      :data-row-invalid="isInvalidEmptyRow(row) ? 'true' : undefined"
    >
      <Input
        :model-value="row.value"
        :placeholder="placeholder"
        :aria-label="`${descriptor.meta.label} row ${index + 1}`"
        :aria-invalid="isInvalidEmptyRow(row) || undefined"
        class="h-8 flex-1 font-code text-xs"
        :data-testid="rowTestId(index, 'input')"
        :disabled="disabled"
        @update:model-value="(value: string | number) => patchRow(row, String(value))"
        @blur="markRowTouched(row)"
      />
      <component
        :is="registeredDataPathPicker"
        v-if="registeredDataPathPicker"
        :model-value="row.value"
        :field-label="descriptor.meta.label"
        mode="literal"
        output-format="relative"
        :instance-id="instanceId"
        :inputs="inputs"
        :root-path="pickerRootPath"
        :data-testid="rowTestId(index, 'picker')"
        :disabled="disabled"
        :aria-disabled="disabled || undefined"
        @update:model-value="(value: string) => patchRow(row, value)"
      />
      <Button
        variant="ghost"
        size="icon-xs"
        type="button"
        :aria-label="`Remove ${descriptor.meta.label} row ${index + 1}`"
        :data-testid="rowTestId(index, 'remove')"
        :disabled="disabled"
        @click="removeRow(row)"
      >
        <Icon icon="lucide:x" class="size-3" />
      </Button>
    </div>

    <Button
      variant="outline"
      size="sm"
      type="button"
      class="w-full"
      :data-testid="`${fieldKey}-field-list-add`"
      :disabled="disabled"
      @click="addRow"
    >
      <Icon icon="lucide:plus" class="size-3.5" data-icon="inline-start" />
      {{ addLabel }}
    </Button>

    <p
      v-if="hasInvalidEmptyRow"
      class="text-xs text-destructive"
      role="alert"
      :data-testid="`${fieldKey}-field-list-validation-empty`"
    >
      Field path must not be empty.
    </p>
  </fieldset>
</template>

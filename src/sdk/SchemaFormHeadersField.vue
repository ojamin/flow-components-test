<script setup lang="ts">
// Headers control implementation for SchemaForm (Phase 2.3 / Task 44.7).
//
// Renders an editable list of `{ id, key, value, enabled }` rows. Used by
// HTTP-request style components to author header pairs without a bespoke
// per-component panel. The shape matches the canonical `KeyValueField`
// schema so `data.http-request` can adopt this control without a converter.
//
// Validation surfaces empty/duplicate keys for enabled rows but does NOT
// gate `update:modelValue` — keeping emits permissive lets parents see the
// in-flight authoring state, which matches the rest of SchemaForm where
// validation is signalled inline rather than swallowing user input.

import { computed } from "vue";

import { Badge, Button, Icon, Input, Label, Switch } from "./component-ui-primitives";
import { createUuid } from "./create-uuid";
import type { ParamHeaderRow } from "./public-sdk";

const props = withDefaults(
  defineProps<{
    fieldKey: string;
    label: string;
    helpText?: string;
    modelValue: readonly ParamHeaderRow[];
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    addLabel?: string;
    testId?: string;
    /**
     * When true, the label/badge header row is hidden. Used by SchemaForm
     * for bindable headers fields where the parent's binding header (label
     * + Literal/From data toggle) already labels the control.
     */
    hideLabel?: boolean;
    /**
     * Resolved disabled state from a sibling `disabledWhen` predicate. Persisted
     * rows stay visible/readable but every row input, enabled toggle, and
     * add/remove button is switched to non-interactive, and every patch/add/
     * remove helper no-ops so a stray child event cannot mutate config.
     */
    disabled?: boolean;
  }>(),
  {
    keyPlaceholder: "Header name",
    valuePlaceholder: "Header value",
    addLabel: "Add header",
    hideLabel: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: ParamHeaderRow[]): void;
}>();

interface RowDiagnostic {
  emptyKey: boolean;
  duplicateKey: boolean;
}

const rows = computed<readonly ParamHeaderRow[]>(() => props.modelValue ?? []);

const rowDiagnostics = computed<Map<string, RowDiagnostic>>(() => {
  const map = new Map<string, RowDiagnostic>();
  const seen = new Map<string, number>();

  for (const row of rows.value) {
    if (!row.enabled) continue;
    const trimmed = row.key.trim();
    if (trimmed.length === 0) continue;
    // Header names are case-insensitive per RFC 7230; collapse to lowercase
    // when detecting duplicates so `Accept` and `accept` collide.
    const normalized = trimmed.toLowerCase();
    seen.set(normalized, (seen.get(normalized) ?? 0) + 1);
  }

  for (const row of rows.value) {
    const trimmed = row.key.trim();
    const normalized = trimmed.toLowerCase();
    map.set(row.id, {
      emptyKey: row.enabled && trimmed.length === 0,
      duplicateKey: row.enabled && trimmed.length > 0 && (seen.get(normalized) ?? 0) > 1,
    });
  }

  return map;
});

const hasEmptyKey = computed(() =>
  Array.from(rowDiagnostics.value.values()).some((entry) => entry.emptyKey),
);

const hasDuplicateKey = computed(() =>
  Array.from(rowDiagnostics.value.values()).some((entry) => entry.duplicateKey),
);

// `kind: "headers"` is reused for query-parameter authoring, so the empty
// state must read sensibly when the parent is editing query params rather
// than HTTP headers. We can't accept a custom string through SchemaFormField
// today, so derive copy from the descriptor's `addLabel` — which already
// encodes the noun ("Add query parameter" vs the default "Add header").
const emptyStateText = computed(() => {
  const lower = props.addLabel?.toLowerCase() ?? "";
  if (lower.includes("query parameter")) {
    return "No query parameters yet. Add one to append a custom URL parameter.";
  }
  return "No headers yet. Add one to send a custom request header.";
});

function diagnosticFor(rowId: string): RowDiagnostic {
  return rowDiagnostics.value.get(rowId) ?? { emptyKey: false, duplicateKey: false };
}

function patchRow(rowId: string, patch: Partial<Omit<ParamHeaderRow, "id">>) {
  if (props.disabled) return;
  const next = rows.value.map((row) => (row.id === rowId ? { ...row, ...patch } : row));
  emit("update:modelValue", next);
}

function removeRow(rowId: string) {
  if (props.disabled) return;
  emit(
    "update:modelValue",
    rows.value.filter((row) => row.id !== rowId),
  );
}

function addRow() {
  if (props.disabled) return;
  const newRow: ParamHeaderRow = {
    id: createUuid(),
    key: "",
    value: "",
    enabled: true,
  };
  emit("update:modelValue", [...rows.value, newRow]);
}

function rowTestId(suffix: string): (rowId: string) => string {
  return (rowId) => `${props.fieldKey}-headers-row-${rowId}-${suffix}`;
}

const keyInputTestId = rowTestId("key");
const valueInputTestId = rowTestId("value");
const enabledToggleTestId = rowTestId("enabled");
const removeButtonTestId = rowTestId("remove");
const rowContainerTestId = rowTestId("row");

function rootTestId(): string | undefined {
  return props.testId ?? `${props.fieldKey}-headers`;
}

function emptyTestId(): string {
  return `${props.fieldKey}-headers-empty`;
}

function addTestId(): string {
  return `${props.fieldKey}-headers-add`;
}

function emptyHintTestId(): string {
  return `${props.fieldKey}-headers-validation-empty`;
}

function duplicateHintTestId(): string {
  return `${props.fieldKey}-headers-validation-duplicate`;
}
</script>

<template>
  <fieldset class="flex flex-col gap-2" :data-field="fieldKey" :data-testid="rootTestId()">
    <div v-if="!hideLabel" class="flex items-center justify-between gap-2">
      <Label
        :for="`${fieldKey}-headers`"
        class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >{{ label }}</Label
      >
      <Badge variant="outline" class="text-[10px]">
        {{ rows.length }} {{ rows.length === 1 ? "row" : "rows" }}
      </Badge>
    </div>

    <p v-if="helpText" class="text-xs text-muted-foreground/70">{{ helpText }}</p>

    <p
      v-if="rows.length === 0"
      class="rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground/70"
      :data-testid="emptyTestId()"
    >
      {{ emptyStateText }}
    </p>

    <div
      v-for="row in rows"
      :key="row.id"
      class="flex items-start gap-2 rounded-md border border-border/40 bg-muted/20 p-2"
      :class="{ 'opacity-60': !row.enabled }"
      :data-testid="rowContainerTestId(row.id)"
      :data-row-id="row.id"
      :data-row-enabled="row.enabled ? 'true' : 'false'"
      :data-row-invalid="
        diagnosticFor(row.id).emptyKey || diagnosticFor(row.id).duplicateKey ? 'true' : undefined
      "
    >
      <div class="flex flex-1 flex-col gap-1.5 sm:flex-row">
        <Input
          :model-value="row.key"
          :disabled="disabled || !row.enabled"
          :placeholder="keyPlaceholder"
          :aria-label="`Header name for row ${row.id}`"
          :aria-invalid="
            diagnosticFor(row.id).emptyKey || diagnosticFor(row.id).duplicateKey || undefined
          "
          class="h-8 flex-1 font-code text-xs"
          :data-testid="keyInputTestId(row.id)"
          @update:model-value="(value: string | number) => patchRow(row.id, { key: String(value) })"
        />
        <Input
          :model-value="row.value"
          :disabled="disabled || !row.enabled"
          :placeholder="valuePlaceholder"
          :aria-label="`Header value for row ${row.id}`"
          class="h-8 flex-1 font-code text-xs"
          :data-testid="valueInputTestId(row.id)"
          @update:model-value="
            (value: string | number) => patchRow(row.id, { value: String(value) })
          "
        />
      </div>

      <div class="flex shrink-0 items-center gap-1 pt-0.5">
        <Switch
          :model-value="row.enabled"
          :disabled="disabled"
          :aria-label="`Toggle row ${row.id}`"
          :data-testid="enabledToggleTestId(row.id)"
          @update:model-value="(value: boolean) => patchRow(row.id, { enabled: value })"
        />
        <Button
          variant="ghost"
          size="icon-xs"
          type="button"
          :aria-label="`Remove header row ${row.id}`"
          :data-testid="removeButtonTestId(row.id)"
          :disabled="disabled"
          @click="removeRow(row.id)"
        >
          <Icon icon="lucide:x" class="size-3" />
        </Button>
      </div>
    </div>

    <Button
      variant="outline"
      size="sm"
      type="button"
      class="w-full"
      :data-testid="addTestId()"
      :disabled="disabled"
      @click="addRow"
    >
      <Icon icon="lucide:plus" class="size-3.5" data-icon="inline-start" />
      {{ addLabel }}
    </Button>

    <p
      v-if="hasEmptyKey"
      class="text-xs text-destructive"
      role="alert"
      :data-testid="emptyHintTestId()"
    >
      Enabled headers must have a name.
    </p>
    <p
      v-if="hasDuplicateKey"
      class="text-xs text-destructive"
      role="alert"
      :data-testid="duplicateHintTestId()"
    >
      Enabled headers must have unique names.
    </p>
  </fieldset>
</template>

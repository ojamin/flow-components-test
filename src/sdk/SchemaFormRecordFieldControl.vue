<script setup lang="ts">
// Record-field control implementation for SchemaForm.
//
// Used by `recordFieldParam(...)` and shared list editors. Renders a plain
// input plus the registered data-path picker (when available) so users can
// browse upstream data instead of typing field paths blind. Stores a single
// string value — the field path inside a record row — so the descriptor's
// schema stays a plain `z.string()`.
//
// Imports come from `./component-ui-primitives` (not the `./component-ui`
// barrel) so the SchemaForm facade can re-export through the barrel without a
// self-cycle.

import { computed } from "vue";

import { getRegisteredDataPathPicker } from "./data-path-picker-adapter";
import { Input, Label } from "./component-ui-primitives";
import type { InputPortDefinition, ParamDescriptor } from "./public-sdk";

const props = withDefaults(
  defineProps<{
    fieldKey: string;
    descriptor: ParamDescriptor;
    value: unknown;
    /**
     * Sibling config snapshot. When the descriptor declares
     * `pickerRootPathKey`, the value of that key (e.g. `config.rowsPath`) is
     * forwarded to the registered data-path picker as `rootPath` so the
     * browse tree only exposes fields inside the resolved sub-tree.
     * `pickerRootPathSuffixKey` extends that contract for nested array
     * roots: the suffix sibling value joins onto the base via `[*]` so
     * pickers browse the inner per-row array (see
     * `composeRecordFieldPickerRootPath`).
     */
    config?: Record<string, unknown>;
    hideLabel?: boolean;
    instanceId?: string;
    inputs?: readonly InputPortDefinition[];
    /** Stable HTML id for the underlying input element (label association). */
    inputId?: string;
    /**
     * Resolved disabled state from a sibling `disabledWhen` predicate on the
     * owning SchemaForm field. The stored field path stays readable so authors
     * can still see what is configured, but the native input is HTML-disabled
     * and the registered picker root receives `disabled` plus `tabindex=-1`
     * so adapters whose root is a `<button>` (the documented contract) go
     * non-interactive. Emit helpers also defensively no-op so a stray adapter
     * `update:modelValue` cannot mutate config while the field is disabled.
     */
    disabled?: boolean;
  }>(),
  {
    config: undefined,
    hideLabel: false,
    instanceId: undefined,
    inputs: () => [],
    inputId: undefined,
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:value", value: string): void;
}>();

const registeredDataPathPicker = computed(() => getRegisteredDataPathPicker());
const resolvedInputId = computed(() => props.inputId ?? `schema-field-${props.fieldKey}`);
const recordControl = computed(() =>
  props.descriptor.meta.control.kind === "record-field" ? props.descriptor.meta.control : null,
);

// Resolve the picker scope from the sibling config keys declared on the
// descriptor. `pickerRootPathKey` provides the base path (e.g. `series`);
// `pickerRootPathSuffixKey` (when set) provides a per-row child path joined
// onto the base via `[*]` so nested array roots like multi-line `points` can
// be browsed directly. Blank/missing reads keep the picker unscoped (or fall
// back to the base) rather than silently snapping to root.
const pickerRootPath = computed<string | undefined>(() => {
  const control = recordControl.value;
  if (!control) return undefined;
  const base = readSiblingPath(control.pickerRootPathKey);
  if (!base) return undefined;
  const suffix = readSiblingPath(control.pickerRootPathSuffixKey);
  return suffix ? composeRecordFieldPickerRootPath(base, suffix) : base;
});

function readSiblingPath(key: string | undefined): string | undefined {
  if (!key) return undefined;
  const value = props.config?.[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

// Joins a base path and a per-row suffix via `[*]`. Bracket-led suffixes
// (e.g. `[0].x`) append directly so callers can target indexed children;
// bare property suffixes get a `.` separator. Leading `.` on the suffix is
// stripped so callers can write either `points` or `.points` without
// double-dots. When the base already terminates in a bracket expression
// (e.g. `series[*]`, `series[0]`) the row scope is already established, so
// the implicit `[*]` is skipped to avoid producing `series[*][*].points`,
// which collapses pickers that browse the inner array to empty.
function composeRecordFieldPickerRootPath(base: string, suffix: string): string {
  const cleaned = suffix.startsWith(".") ? suffix.slice(1) : suffix;
  if (cleaned.length === 0) return base;
  const wildcard = base.endsWith("]") ? "" : "[*]";
  if (cleaned.startsWith("[")) return `${base}${wildcard}${cleaned}`;
  return `${base}${wildcard}.${cleaned}`;
}

function readString(): string {
  const value = props.value;
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

function toRawString(value: string | number): string {
  return typeof value === "string" ? value : String(value);
}

function emitGuard(): boolean {
  return props.disabled === true;
}

function onTextChange(value: string | number) {
  if (emitGuard()) return;
  emit("update:value", toRawString(value));
}

function onPickerChange(value: string) {
  if (emitGuard()) return;
  emit("update:value", value);
}
</script>

<template>
  <div class="flex flex-col gap-1.5" :data-field="fieldKey">
    <Label
      v-if="!hideLabel"
      :for="resolvedInputId"
      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      {{ descriptor.meta.label }}
    </Label>
    <div class="flex items-center gap-1">
      <Input
        :id="resolvedInputId"
        class="min-w-0 flex-1"
        :model-value="readString()"
        :placeholder="recordControl?.placeholder"
        :aria-label="hideLabel ? descriptor.meta.label : undefined"
        :data-testid="recordControl?.testId"
        :disabled="disabled"
        @update:model-value="(value: string | number) => onTextChange(value)"
      />
      <component
        :is="registeredDataPathPicker"
        v-if="registeredDataPathPicker"
        :model-value="readString()"
        :field-label="descriptor.meta.label"
        mode="literal"
        output-format="relative"
        :instance-id="instanceId"
        :inputs="inputs"
        :root-path="pickerRootPath"
        :data-testid="`${fieldKey}-record-field-picker`"
        :disabled="disabled"
        :aria-disabled="disabled || undefined"
        :tabindex="disabled ? -1 : undefined"
        @update:model-value="(value: string) => onPickerChange(value)"
      />
    </div>
    <p v-if="!hideLabel && descriptor.meta.helpText" class="text-xs text-muted-foreground/70">
      {{ descriptor.meta.helpText }}
    </p>
  </div>
</template>

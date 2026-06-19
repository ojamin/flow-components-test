<script setup lang="ts">
// Shared per-kind literal control body for SchemaForm fields (Task 59 / Slice E).
//
// Renders only the bare control element for one descriptor — no Label, no
// outer wrapper, no help text. Both the bindable and non-bindable parents in
// `SchemaFormField.vue` reuse this so the per-kind dispatch lives in one
// place. The parent owns the surrounding chrome (label/help text) and uses
// the emitted `update:invalid` flag to suppress help text while a number or
// code draft is in an invalid state.
//
// Owns its own number- and code-input draft state so partial JSON / non-finite
// numeric input keeps the user's text visible without emitting a corrupted
// parsed value. Validation tone matches the previous in-place implementation
// to avoid behavior drift across parents.
//
// Imports come from `./component-ui-primitives` (not the `./component-ui`
// barrel) so the SchemaForm facade can re-export through the barrel without a
// self-cycle.

import { computed, reactive, toRaw, watch } from "vue";

import SchemaFormAggregateListField from "./SchemaFormAggregateListField.vue";
import SchemaFormDataPathField from "./SchemaFormDataPathField.vue";
import SchemaFormFieldListField from "./SchemaFormFieldListField.vue";
import SchemaFormHeadersField from "./SchemaFormHeadersField.vue";
import SchemaFormRecordFieldControl from "./SchemaFormRecordFieldControl.vue";
import SchemaFormThemeRoleControl from "./SchemaFormThemeRoleControl.vue";
import SchemaFormViewListField from "./SchemaFormViewListField.vue";
import SchemaFormViewSelectField from "./SchemaFormViewSelectField.vue";
import type { ViewContainerItem } from "../shared/view-container";
import { getRegisteredCodeEditor } from "./code-editor-adapter";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "./component-ui-primitives";
import type {
  ComponentThemeContext,
  InputPortDefinition,
  ParamDescriptor,
  ParamHeaderRow,
} from "./public-sdk";

const props = withDefaults(
  defineProps<{
    fieldKey: string;
    descriptor: ParamDescriptor;
    value: unknown;
    /**
     * Sibling config snapshot forwarded to controls whose picker scope reads
     * a peer key (record-field `pickerRootPathKey`, field-list
     * `pickerRootPathKey`, aggregate-list `sourcePickerRootPathKey`). Other
     * kinds ignore it.
     */
    config?: Record<string, unknown>;
    inputs: readonly InputPortDefinition[];
    instanceId?: string;
    // Forwarded to data-path / headers child components only. Other kinds
    // never render an internal label, so the flag is a no-op for them.
    hideLabel?: boolean;
    // Stable HTML id for the underlying control element so that a parent
    // `<Label :for="inputId">` can be programmatically associated. Follow the
    // `schema-field-${fieldKey}` convention from SchemaFormDataPathField.
    inputId?: string;
    // Forwarded to the theme-role control so color-role swatches can render
    // when the surrounding host has a resolved theme context. Optional so
    // standalone harnesses (preview-app sandbox, vitest mounts) keep working
    // without a swatch instead of painting transparently.
    themeContext?: ComponentThemeContext;
    /**
     * Resolved disabled state from a sibling `disabledWhen` predicate. The
     * value stays visible so authors can still see what the field holds, but
     * native controls are switched to a non-interactive state (HTML `disabled`
     * where available, or `readonly` + `tabindex=-1` for adapters that lack
     * native disabled support). Every emit helper defensively no-ops while
     * disabled so a stray adapter event can never mutate config.
     */
    disabled?: boolean;
  }>(),
  {
    config: undefined,
    instanceId: undefined,
    hideLabel: false,
    inputId: undefined,
    themeContext: undefined,
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:value", value: unknown): void;
  (e: "update:invalid", invalid: boolean): void;
}>();

// In-flight number draft. Stored as a small reactive object so we can preserve
// the previous "is the draft set?" semantics without paying for ref
// comparisons in templates.
const numberState = reactive<{ draft: string; invalid: boolean }>({ draft: "", invalid: false });

// In-flight code draft. Used only when `kind: "code"` with `language: "json"`
// is editing a JSON-object value (array/object) — the textarea reads the
// canonical `JSON.stringify(value, null, 2)` for display while invalid edits
// retain the user's raw text without emitting a corrupted parsed value.
const codeState = reactive<{ draft: string; invalid: boolean }>({ draft: "", invalid: false });

// Mirror invalid state from the theme-role control so the parent (which owns
// the help-text row) can suppress help text behind the inline alert just
// like number/code drafts do.
const themeRoleState = reactive<{ invalid: boolean }>({ invalid: false });

// Tracks the host-registered code editor adapter (if any) reactively so
// `kind: "code"` swaps between adapter and textarea fallback when
// `registerCodeEditor(...)` is called at runtime — typically once at host boot,
// but tests register/clear inside a single mount.
const registeredCodeEditor = computed(() => getRegisteredCodeEditor());

// Mirror invalid draft state to the parent so it can hide help text while
// the user is recovering from a typo. Watch (not immediate) avoids spurious
// initial emits — initial state is always valid.
const isInvalid = computed(() => {
  const kind = props.descriptor.meta.control.kind;
  if (kind === "number" && numberState.invalid) return true;
  if (kind === "code" && codeState.invalid) return true;
  if (kind === "theme-role" && themeRoleState.invalid) return true;
  return false;
});
watch(isInvalid, (next) => emit("update:invalid", next));

function readString(): string {
  const value = props.value;
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

// True when this is a JSON-language code control whose current value is a
// non-string JSON value (array/object/number/boolean/null). In that mode the
// textarea reads the formatted JSON and edits round-trip through `JSON.parse`.
// Plain string code values (transform.javascript bodies, markdown, http body
// text) stay in string-mode.
function isJsonObjectCode(): boolean {
  if (props.descriptor.meta.control.kind !== "code") return false;
  if (props.descriptor.meta.control.language !== "json") return false;
  const value = props.value;
  return value !== undefined && typeof value !== "string";
}

function readCodeInput(): string {
  // Retain the raw draft on invalid input so partial JSON typed by the user
  // is not silently snapped back to the previous parsed value's canonical
  // formatting. Mirrors the number-field invalid-draft pattern.
  if (codeState.invalid) return codeState.draft;
  if (isJsonObjectCode()) {
    try {
      return JSON.stringify(props.value, null, 2);
    } catch {
      return "";
    }
  }
  return readString();
}

function readNumberInput(): string {
  if (numberState.invalid) return numberState.draft;
  const value = props.value;
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function isOptionalNumberDescriptor(): boolean {
  // Zod v4 exposes optional wrappers through `def.type`; older bundled builds
  // used `_def.type`. Keep this structural so the package does not rely on a
  // concrete Zod class instance when consumers provide descriptors.
  const schema = toRaw(props.descriptor.schema) as {
    def?: { type?: unknown };
    _def?: { type?: unknown };
  };
  return schema.def?.type === "optional" || schema._def?.type === "optional";
}

function readBoolean(): boolean {
  return Boolean(props.value);
}

function readHeaders(): readonly ParamHeaderRow[] {
  const value = props.value;
  if (!Array.isArray(value)) return [];
  // The array shape is enforced by the descriptor schema upstream; we
  // defensively coerce primitive types so a partially-typed legacy config
  // can't crash the editor on first render.
  return value
    .filter(
      (entry): entry is Record<string, unknown> =>
        typeof entry === "object" && entry !== null && !Array.isArray(entry),
    )
    .map((entry) => ({
      id: typeof entry.id === "string" ? entry.id : "",
      key: typeof entry.key === "string" ? entry.key : "",
      value: typeof entry.value === "string" ? entry.value : "",
      enabled: entry.enabled !== false,
    }))
    .filter((entry) => entry.id.length > 0);
}

function toRawString(value: string | number): string {
  return typeof value === "string" ? value : String(value);
}

// Defensive guard so that any registered adapter (code editor, picker, etc.)
// or compound child component cannot mutate config while the field is
// disabled. Native HTML controls already suppress events when `disabled` is
// set; this protects the adapter and compound paths too.
function emitGuard(): boolean {
  return props.disabled === true;
}

function onTextChange(value: string | number) {
  if (emitGuard()) return;
  emit("update:value", toRawString(value));
}

function onCodeChange(value: string | number) {
  if (emitGuard()) return;
  const raw = toRawString(value);
  if (!isJsonObjectCode()) {
    // String-mode code (JS, Markdown, plain JSON body text): pass through.
    codeState.draft = "";
    codeState.invalid = false;
    emit("update:value", raw);
    return;
  }
  // JSON-object mode: parse before emitting so non-string values stay
  // structurally correct. Empty input or syntactically invalid JSON keeps the
  // draft visible and surfaces an inline alert without emitting.
  codeState.draft = raw;
  if (raw.trim().length === 0) {
    codeState.invalid = true;
    return;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    codeState.invalid = false;
    codeState.draft = "";
    emit("update:value", parsed);
  } catch {
    codeState.invalid = true;
  }
}

function onNumberChange(value: string | number) {
  if (emitGuard()) return;
  const rawValue = toRawString(value);
  numberState.draft = rawValue;
  if (rawValue.trim().length === 0) {
    if (isOptionalNumberDescriptor()) {
      numberState.invalid = false;
      numberState.draft = "";
      emit("update:value", undefined);
      return;
    }
    numberState.invalid = true;
    return;
  }
  const parsed = Number(rawValue);
  if (Number.isFinite(parsed)) {
    numberState.invalid = false;
    emit("update:value", parsed);
    return;
  }
  numberState.invalid = true;
}

function onSelectChange(value: string) {
  if (emitGuard()) return;
  emit("update:value", value);
}

function onBooleanChange(value: boolean) {
  if (emitGuard()) return;
  emit("update:value", value);
}

function onHeadersChange(value: ParamHeaderRow[]) {
  if (emitGuard()) return;
  emit("update:value", value);
}

function readStringArray(): readonly string[] {
  const value = props.value;
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

interface AggregateListRow {
  sourceField: string;
  operation: string;
  outputField: string;
}

function readAggregateList(): readonly AggregateListRow[] {
  const value = props.value;
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is Record<string, unknown> =>
        typeof entry === "object" && entry !== null && !Array.isArray(entry),
    )
    .map((entry) => ({
      sourceField: typeof entry.sourceField === "string" ? entry.sourceField : "",
      operation: typeof entry.operation === "string" ? entry.operation : "",
      outputField: typeof entry.outputField === "string" ? entry.outputField : "",
    }));
}

function onStringArrayChange(value: string[]) {
  if (emitGuard()) return;
  emit("update:value", value);
}

function onAggregateListChange(value: AggregateListRow[]) {
  if (emitGuard()) return;
  emit("update:value", value);
}

function readViewList(): readonly ViewContainerItem[] {
  // The descriptor schema enforces shape upstream; defensively coerce so a
  // legacy/partial config can't crash the inspector on first render.
  const value = props.value;
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is Record<string, unknown> =>
        typeof entry === "object" && entry !== null && !Array.isArray(entry),
    )
    .map((entry) => {
      const id = typeof entry.id === "string" ? entry.id : "";
      const label = typeof entry.label === "string" ? entry.label : "";
      const hashSlug = typeof entry.hashSlug === "string" ? entry.hashSlug : undefined;
      const disabled = typeof entry.disabled === "boolean" ? entry.disabled : undefined;
      return {
        id,
        label,
        ...(hashSlug ? { hashSlug } : {}),
        ...(disabled !== undefined ? { disabled } : {}),
      } satisfies ViewContainerItem;
    })
    .filter((entry) => entry.id.length > 0 && entry.label.length > 0);
}

function onViewListChange(value: ViewContainerItem[]) {
  if (emitGuard()) return;
  emit("update:value", value);
}

function onThemeRoleChange(value: string) {
  if (emitGuard()) return;
  emit("update:value", value);
}

function onThemeRoleInvalid(invalid: boolean) {
  themeRoleState.invalid = invalid;
}

// Pass-through relay for compound child components that emit a fully formed
// `update:value` payload (data-path, record-field, view-select). Guarded so a
// stray child emit cannot mutate config while the field is disabled.
function onRelayValueChange(value: unknown) {
  if (emitGuard()) return;
  emit("update:value", value);
}
</script>

<template>
  <Input
    v-if="descriptor.meta.control.kind === 'input'"
    :id="inputId"
    :model-value="readString()"
    :placeholder="descriptor.meta.control.placeholder"
    :data-testid="descriptor.meta.control.testId"
    :disabled="disabled"
    @update:model-value="(value: string | number) => onTextChange(value)"
  />
  <SchemaFormDataPathField
    v-else-if="descriptor.meta.control.kind === 'data-path'"
    :field-key="fieldKey"
    :descriptor="descriptor"
    :value="value"
    :hide-label="hideLabel"
    :instance-id="instanceId"
    :inputs="inputs"
    :disabled="disabled"
    @update:value="(nextValue: string) => onRelayValueChange(nextValue)"
  />
  <SchemaFormRecordFieldControl
    v-else-if="descriptor.meta.control.kind === 'record-field'"
    :field-key="fieldKey"
    :descriptor="descriptor"
    :value="value"
    :config="config"
    :hide-label="hideLabel"
    :instance-id="instanceId"
    :inputs="inputs"
    :input-id="inputId"
    :disabled="disabled"
    @update:value="(nextValue: string) => onRelayValueChange(nextValue)"
  />
  <SchemaFormFieldListField
    v-else-if="descriptor.meta.control.kind === 'field-list'"
    :field-key="fieldKey"
    :descriptor="descriptor"
    :model-value="readStringArray()"
    :config="config"
    :hide-label="hideLabel"
    :instance-id="instanceId"
    :inputs="inputs"
    :disabled="disabled"
    @update:model-value="(value: string[]) => onStringArrayChange(value)"
  />
  <SchemaFormAggregateListField
    v-else-if="descriptor.meta.control.kind === 'aggregate-list'"
    :field-key="fieldKey"
    :descriptor="descriptor"
    :model-value="readAggregateList()"
    :config="config"
    :hide-label="hideLabel"
    :instance-id="instanceId"
    :inputs="inputs"
    :disabled="disabled"
    @update:model-value="(value: AggregateListRow[]) => onAggregateListChange(value)"
  />
  <Textarea
    v-else-if="descriptor.meta.control.kind === 'textarea'"
    :id="inputId"
    :model-value="readString()"
    :placeholder="descriptor.meta.control.placeholder"
    :rows="descriptor.meta.control.rows ?? 3"
    :data-testid="descriptor.meta.control.testId"
    :disabled="disabled"
    @update:model-value="(value: string | number) => onTextChange(value)"
  />
  <template v-else-if="descriptor.meta.control.kind === 'number'">
    <Input
      :id="inputId"
      type="number"
      :model-value="readNumberInput()"
      :min="descriptor.meta.control.min"
      :max="descriptor.meta.control.max"
      :step="descriptor.meta.control.step"
      :data-testid="descriptor.meta.control.testId"
      :aria-invalid="numberState.invalid || undefined"
      :disabled="disabled"
      @update:model-value="(value: string | number) => onNumberChange(value)"
    />
    <p
      v-if="numberState.invalid"
      class="text-xs text-destructive"
      role="alert"
      :data-testid="`${fieldKey}-number-validation-hint`"
    >
      Enter a finite number.
    </p>
  </template>
  <Select
    v-else-if="descriptor.meta.control.kind === 'select'"
    :model-value="readString()"
    :disabled="disabled"
    @update:model-value="(value: unknown) => onSelectChange(String(value ?? ''))"
  >
    <SelectTrigger
      :id="inputId"
      class="h-8 w-full min-w-0 max-w-full text-sm"
      :aria-label="descriptor.meta.label"
      :data-testid="descriptor.meta.control.testId"
      :disabled="disabled"
    >
      <SelectValue placeholder="Select…" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="option in descriptor.meta.control.options"
        :key="option.value"
        :value="option.value"
        >{{ option.label }}</SelectItem
      >
    </SelectContent>
  </Select>
  <Switch
    v-else-if="descriptor.meta.control.kind === 'boolean'"
    :id="inputId"
    :model-value="readBoolean()"
    :aria-label="descriptor.meta.label"
    :data-testid="descriptor.meta.control.testId"
    :disabled="disabled"
    @update:model-value="(value: boolean) => onBooleanChange(value)"
  />
  <Input
    v-else-if="descriptor.meta.control.kind === 'color'"
    :id="inputId"
    type="color"
    :model-value="readString()"
    :data-testid="descriptor.meta.control.testId"
    class="h-9 w-16 cursor-pointer p-1"
    :disabled="disabled"
    @update:model-value="(value: string | number) => onTextChange(value)"
  />
  <template v-else-if="descriptor.meta.control.kind === 'code'">
    <component
      v-if="registeredCodeEditor"
      :is="registeredCodeEditor"
      :id="inputId"
      :model-value="readCodeInput()"
      :language="descriptor.meta.control.language"
      :rows="6"
      :data-testid="descriptor.meta.control.testId"
      :aria-invalid="codeState.invalid || undefined"
      class="font-mono text-xs"
      :disabled="disabled"
      :readonly="disabled || undefined"
      :aria-readonly="disabled || undefined"
      :tabindex="disabled ? -1 : undefined"
      @update:model-value="(value: string | number) => onCodeChange(value)"
    />
    <Textarea
      v-else
      :id="inputId"
      :model-value="readCodeInput()"
      :rows="6"
      :data-testid="descriptor.meta.control.testId"
      :aria-invalid="codeState.invalid || undefined"
      class="font-mono text-xs"
      :disabled="disabled"
      @update:model-value="(value: string | number) => onCodeChange(value)"
    />
    <p
      v-if="codeState.invalid"
      class="text-xs text-destructive"
      role="alert"
      :data-testid="`${fieldKey}-code-validation-hint`"
    >
      Enter valid JSON.
    </p>
  </template>
  <SchemaFormHeadersField
    v-else-if="descriptor.meta.control.kind === 'headers'"
    :field-key="fieldKey"
    :label="descriptor.meta.label"
    :help-text="descriptor.meta.helpText"
    :model-value="readHeaders()"
    :key-placeholder="descriptor.meta.control.keyPlaceholder"
    :value-placeholder="descriptor.meta.control.valuePlaceholder"
    :add-label="descriptor.meta.control.addLabel"
    :test-id="descriptor.meta.control.testId"
    :hide-label="hideLabel"
    :disabled="disabled"
    @update:model-value="(value: ParamHeaderRow[]) => onHeadersChange(value)"
  />
  <SchemaFormViewListField
    v-else-if="descriptor.meta.control.kind === 'view-list'"
    :field-key="fieldKey"
    :label="descriptor.meta.label"
    :help-text="descriptor.meta.helpText"
    :model-value="readViewList()"
    :add-label="descriptor.meta.control.addLabel"
    :hash-slug-placeholder="descriptor.meta.control.hashSlugPlaceholder"
    :test-id="descriptor.meta.control.testId"
    :hide-label="hideLabel"
    :disabled="disabled"
    @update:model-value="(value: ViewContainerItem[]) => onViewListChange(value)"
  />
  <SchemaFormViewSelectField
    v-else-if="descriptor.meta.control.kind === 'view-select'"
    :field-key="fieldKey"
    :input-id="inputId"
    :descriptor="descriptor"
    :value="value"
    :config="config"
    :hide-label="hideLabel"
    :disabled="disabled"
    @update:value="(next: string | undefined) => onRelayValueChange(next)"
  />
  <SchemaFormThemeRoleControl
    v-else-if="descriptor.meta.control.kind === 'theme-role'"
    :field-key="fieldKey"
    :input-id="inputId"
    :descriptor="descriptor"
    :value="value"
    :theme-context="themeContext"
    :hide-label="hideLabel"
    :disabled="disabled"
    @update:value="(next: string) => onThemeRoleChange(next)"
    @update:invalid="(invalid: boolean) => onThemeRoleInvalid(invalid)"
  />
</template>

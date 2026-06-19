<script setup lang="ts">
// Single-field renderer for SchemaForm (Phase 2.3 / Task 44.2 + 44.3 + 44.4 +
// Task 59 / Slice E).
//
// Each branch wraps the shared `SchemaFormLiteralControl` with the chrome the
// branch needs:
//
//   * bindable: shared `Literal | From data` toggle from
//     `SchemaFormFieldBindingUI` plus the literal control body.
//   * non-bindable input/textarea/number/color/code: a `<Label>` row above
//     the shared control with help text below.
//   * non-bindable select: `ConfigSelector` keeps its bundled label/hint
//     (different visual contract than the bindable raw select primitives).
//   * non-bindable boolean: a label-row layout next to a bare `<Switch>`.
//   * non-bindable data-path / headers: the control owns its label, so the
//     parent renders no chrome.
//
// Imports come from `./component-ui-primitives` (not the `./component-ui`
// barrel) so the SchemaForm facade can re-export this through the barrel
// without a self-cycle.

import { computed, ref } from "vue";

import SchemaFormFieldBindingUI from "./SchemaFormFieldBindingUI.vue";
import SchemaFormLiteralControl from "./SchemaFormLiteralControl.vue";
import { ConfigSelector, Label, Switch } from "./component-ui-primitives";
import type {
  ComponentThemeContext,
  InputPortDefinition,
  ParamDescriptor,
  ParamSelectOption,
  ParamValueState,
} from "./public-sdk";

const props = defineProps<{
  fieldKey: string;
  descriptor: ParamDescriptor;
  value: unknown;
  /**
   * Sibling config snapshot forwarded to controls whose picker scope reads
   * a peer key (e.g. field-list / aggregate-list `pickerRootPathKey`).
   * Optional so non-picker fields ignore it without ceremony.
   */
  config?: Record<string, unknown>;
  paramValueState?: ParamValueState;
  inputs: readonly InputPortDefinition[];
  instanceId?: string;
  /**
   * Optional resolved theme context forwarded to the theme-role control so
   * it can paint color-role swatches from the host theme bridge instead of
   * rendering a label-only fallback. Other control kinds ignore it.
   */
  themeContext?: ComponentThemeContext;
  /**
   * Resolved disabled state from a sibling `disabledWhen` predicate. When
   * true the field container exposes `aria-disabled` / `data-disabled`, the
   * inline disabled explanation is shown, and emit wrappers are guarded so
   * any control that still tries to fire an update is ignored.
   */
  disabled?: boolean;
  /** Explanation paired with disabled state. Falls back to helpText then a generic copy. */
  disabledHelpText?: string;
}>();

const emit = defineEmits<{
  (e: "update:value", value: unknown): void;
  (e: "update:paramValueState", state: ParamValueState): void;
}>();

// Mirrors invalid draft state from the shared literal control so this parent
// can suppress help text while a number/code field is being recovered.
const isLiteralInvalid = ref(false);

// Stable id forwarded to the literal control so parent `<Label :for>` and the
// native form element are programmatically associated. Follows the same
// `schema-field-${fieldKey}` convention used by SchemaFormDataPathField.
const inputId = computed(() => `schema-field-${props.fieldKey}`);

const isBindable = computed(
  () => props.descriptor.meta.bindable === true && props.inputs.length > 0,
);

const mode = computed<"literal" | "bind">(() =>
  props.paramValueState?.mode === "bind" ? "bind" : "literal",
);

// Help text is shown by every branch that owns its own chrome (input,
// textarea, number, color, code, and bindable-mode literal). Suppressed when
// an inline validation alert is showing, and skipped entirely for kinds
// whose control component renders its own help text or label (data-path,
// headers, view-list, theme-role).
const showHelpText = computed(() => {
  if (disabledExplanation.value) return false;
  if (!props.descriptor.meta.helpText) return false;
  if (isLiteralInvalid.value) return false;
  const kind = props.descriptor.meta.control.kind;
  if (kind === "data-path" || kind === "headers" || kind === "view-list") return false;
  if (kind === "record-field" || kind === "field-list" || kind === "aggregate-list") return false;
  if (kind === "theme-role" || kind === "view-select") return false;
  return true;
});

// Inline disabled explanation. Order matches the SDK contract:
// disabledHelpText > descriptor.meta.helpText > generic fallback. Rendered
// inline (not hover-only) so the reason is always discoverable.
const disabledExplanation = computed<string | null>(() => {
  if (!props.disabled) return null;
  return (
    props.disabledHelpText ?? props.descriptor.meta.helpText ?? "Controlled by another setting."
  );
});

// Variant used by control kinds whose child component renders
// `descriptor.meta.helpText` itself (data-path, record-field, field-list,
// aggregate-list, headers, view-list, view-select, theme-role). Falling back
// to helpText in those branches would print the same copy twice, so we skip
// the helpText fallback and let the child's existing help text carry the
// message. Explicit `disabledHelpText` still surfaces, and the generic
// fallback still kicks in when neither helpText source exists.
const disabledExplanationForChildOwned = computed<string | null>(() => {
  if (!props.disabled) return null;
  if (props.disabledHelpText != null) return props.disabledHelpText;
  if (props.descriptor.meta.helpText != null) return null;
  return "Controlled by another setting.";
});

// In the bindable branch the binding UI renders helpText itself while in
// `bind` mode, so the parent's disabled explanation must skip the helpText
// fallback there. In `literal` mode the parent owns helpText (already
// suppressed via `showHelpText` when disabled), so the full fallback chain
// applies as usual.
const bindableDisabledExplanation = computed<string | null>(() =>
  mode.value === "bind" ? disabledExplanationForChildOwned.value : disabledExplanation.value,
);

const disabledAriaAttrs = computed<Record<string, string> | undefined>(() => {
  if (!props.disabled) return undefined;
  return { "aria-disabled": "true", "data-disabled": "true" };
});

function emitGuard(): boolean {
  return props.disabled === true;
}

function readString(): string {
  const value = props.value;
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

function readBoolean(): boolean {
  return Boolean(props.value);
}

function selectOptions(options: ParamSelectOption[]) {
  return options.map((option) => ({ value: option.value, label: option.label }));
}

function onSelectChange(value: string) {
  if (emitGuard()) return;
  emit("update:value", value);
}

function onBooleanChange(value: boolean) {
  if (emitGuard()) return;
  emit("update:value", value);
}

function onLiteralValueChange(value: unknown) {
  if (emitGuard()) return;
  emit("update:value", value);
}

function onLiteralInvalidChange(invalid: boolean) {
  isLiteralInvalid.value = invalid;
}

function onParamValueStateChange(state: ParamValueState) {
  if (emitGuard()) return;
  emit("update:paramValueState", state);
}
</script>

<template>
  <!-- Bindable: shared binding header (sibling) + literal-mode body. -->
  <div
    v-if="isBindable"
    class="flex flex-col gap-1.5"
    :data-field="fieldKey"
    :data-binding-mode="mode"
    v-bind="disabledAriaAttrs"
  >
    <SchemaFormFieldBindingUI
      :field-key="fieldKey"
      :input-id="inputId"
      :descriptor="descriptor"
      :value="value"
      :param-value-state="paramValueState"
      :inputs="inputs"
      :instance-id="instanceId"
      :disabled="disabled"
      @update:param-value-state="(state: ParamValueState) => onParamValueStateChange(state)"
    />

    <div v-show="mode === 'literal'" class="contents">
      <SchemaFormLiteralControl
        :field-key="fieldKey"
        :input-id="inputId"
        :descriptor="descriptor"
        :value="value"
        :config="config"
        :inputs="inputs"
        :instance-id="instanceId"
        :theme-context="themeContext"
        :hide-label="true"
        :disabled="disabled"
        @update:value="(value: unknown) => onLiteralValueChange(value)"
        @update:invalid="(invalid: boolean) => onLiteralInvalidChange(invalid)"
      />
      <p v-if="showHelpText" class="text-xs text-muted-foreground/80">
        {{ descriptor.meta.helpText }}
      </p>
    </div>
    <p
      v-if="bindableDisabledExplanation"
      class="text-xs text-muted-foreground/80"
      :data-testid="`schema-field-${fieldKey}-disabled-help`"
    >
      {{ bindableDisabledExplanation }}
    </p>
  </div>

  <!-- Non-bindable select: ConfigSelector keeps its bundled label/hint. -->
  <div
    v-else-if="descriptor.meta.control.kind === 'select'"
    :data-field="fieldKey"
    v-bind="disabledAriaAttrs"
  >
    <ConfigSelector
      :model-value="readString()"
      :options="selectOptions(descriptor.meta.control.options)"
      :label="descriptor.meta.label"
      :hint="disabled ? undefined : descriptor.meta.helpText"
      :data-testid="descriptor.meta.control.testId"
      :disabled="disabled"
      @update:model-value="(value: string) => onSelectChange(value)"
    />
    <p
      v-if="disabledExplanation"
      class="mt-1.5 text-xs text-muted-foreground/80"
      :data-testid="`schema-field-${fieldKey}-disabled-help`"
    >
      {{ disabledExplanation }}
    </p>
  </div>

  <!-- Non-bindable boolean: label-row layout with help text under the label. -->
  <div
    v-else-if="descriptor.meta.control.kind === 'boolean'"
    class="flex items-start justify-between gap-3"
    :data-field="fieldKey"
    v-bind="disabledAriaAttrs"
  >
    <div class="flex min-w-0 flex-col gap-0.5">
      <Label
        :for="inputId"
        class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >{{ descriptor.meta.label }}</Label
      >
      <p
        v-if="descriptor.meta.helpText && !disabledExplanation"
        class="text-xs leading-relaxed text-muted-foreground/80"
      >
        {{ descriptor.meta.helpText }}
      </p>
      <p
        v-if="disabledExplanation"
        class="text-xs leading-relaxed text-muted-foreground/80"
        :data-testid="`schema-field-${fieldKey}-disabled-help`"
      >
        {{ disabledExplanation }}
      </p>
    </div>
    <Switch
      :id="inputId"
      :model-value="readBoolean()"
      :aria-label="descriptor.meta.label"
      :data-testid="descriptor.meta.control.testId"
      :disabled="disabled"
      @update:model-value="(value: boolean) => onBooleanChange(value)"
    />
  </div>

  <!-- Non-bindable data-path: child component owns its label/help text. -->
  <div
    v-else-if="descriptor.meta.control.kind === 'data-path'"
    :data-field="fieldKey"
    v-bind="disabledAriaAttrs"
  >
    <SchemaFormLiteralControl
      :field-key="fieldKey"
      :descriptor="descriptor"
      :value="value"
      :inputs="inputs"
      :instance-id="instanceId"
      :disabled="disabled"
      @update:value="(value: unknown) => onLiteralValueChange(value)"
    />
    <p
      v-if="disabledExplanationForChildOwned"
      class="mt-1.5 text-xs text-muted-foreground/80"
      :data-testid="`schema-field-${fieldKey}-disabled-help`"
    >
      {{ disabledExplanationForChildOwned }}
    </p>
  </div>

  <!-- Non-bindable record-field: child component owns its label/help text. -->
  <div
    v-else-if="descriptor.meta.control.kind === 'record-field'"
    :data-field="fieldKey"
    v-bind="disabledAriaAttrs"
  >
    <SchemaFormLiteralControl
      :field-key="fieldKey"
      :input-id="inputId"
      :descriptor="descriptor"
      :value="value"
      :config="config"
      :inputs="inputs"
      :instance-id="instanceId"
      :disabled="disabled"
      @update:value="(value: unknown) => onLiteralValueChange(value)"
    />
    <p
      v-if="disabledExplanationForChildOwned"
      class="mt-1.5 text-xs text-muted-foreground/80"
      :data-testid="`schema-field-${fieldKey}-disabled-help`"
    >
      {{ disabledExplanationForChildOwned }}
    </p>
  </div>

  <!-- Non-bindable field-list: child component owns its label/help text. -->
  <div
    v-else-if="descriptor.meta.control.kind === 'field-list'"
    :data-field="fieldKey"
    v-bind="disabledAriaAttrs"
  >
    <SchemaFormLiteralControl
      :field-key="fieldKey"
      :descriptor="descriptor"
      :value="value"
      :config="config"
      :inputs="inputs"
      :instance-id="instanceId"
      :disabled="disabled"
      @update:value="(value: unknown) => onLiteralValueChange(value)"
    />
    <p
      v-if="disabledExplanationForChildOwned"
      class="mt-1.5 text-xs text-muted-foreground/80"
      :data-testid="`schema-field-${fieldKey}-disabled-help`"
    >
      {{ disabledExplanationForChildOwned }}
    </p>
  </div>

  <!-- Non-bindable aggregate-list: child component owns its label/help text. -->
  <div
    v-else-if="descriptor.meta.control.kind === 'aggregate-list'"
    :data-field="fieldKey"
    v-bind="disabledAriaAttrs"
  >
    <SchemaFormLiteralControl
      :field-key="fieldKey"
      :descriptor="descriptor"
      :value="value"
      :config="config"
      :inputs="inputs"
      :instance-id="instanceId"
      :disabled="disabled"
      @update:value="(value: unknown) => onLiteralValueChange(value)"
    />
    <p
      v-if="disabledExplanationForChildOwned"
      class="mt-1.5 text-xs text-muted-foreground/80"
      :data-testid="`schema-field-${fieldKey}-disabled-help`"
    >
      {{ disabledExplanationForChildOwned }}
    </p>
  </div>

  <!-- Non-bindable headers: child component owns its label/help text. -->
  <div
    v-else-if="descriptor.meta.control.kind === 'headers'"
    :data-field="fieldKey"
    v-bind="disabledAriaAttrs"
  >
    <SchemaFormLiteralControl
      :field-key="fieldKey"
      :descriptor="descriptor"
      :value="value"
      :inputs="inputs"
      :instance-id="instanceId"
      :disabled="disabled"
      @update:value="(value: unknown) => onLiteralValueChange(value)"
    />
    <p
      v-if="disabledExplanationForChildOwned"
      class="mt-1.5 text-xs text-muted-foreground/80"
      :data-testid="`schema-field-${fieldKey}-disabled-help`"
    >
      {{ disabledExplanationForChildOwned }}
    </p>
  </div>

  <!-- Non-bindable view-list: child component owns its label/help text. -->
  <div
    v-else-if="descriptor.meta.control.kind === 'view-list'"
    :data-field="fieldKey"
    v-bind="disabledAriaAttrs"
  >
    <SchemaFormLiteralControl
      :field-key="fieldKey"
      :descriptor="descriptor"
      :value="value"
      :inputs="inputs"
      :instance-id="instanceId"
      :disabled="disabled"
      @update:value="(value: unknown) => onLiteralValueChange(value)"
    />
    <p
      v-if="disabledExplanationForChildOwned"
      class="mt-1.5 text-xs text-muted-foreground/80"
      :data-testid="`schema-field-${fieldKey}-disabled-help`"
    >
      {{ disabledExplanationForChildOwned }}
    </p>
  </div>

  <!-- Non-bindable view-select: child component owns its label/help text. -->
  <div
    v-else-if="descriptor.meta.control.kind === 'view-select'"
    :data-field="fieldKey"
    v-bind="disabledAriaAttrs"
  >
    <SchemaFormLiteralControl
      :field-key="fieldKey"
      :input-id="inputId"
      :descriptor="descriptor"
      :value="value"
      :config="config"
      :inputs="inputs"
      :instance-id="instanceId"
      :disabled="disabled"
      @update:value="(value: unknown) => onLiteralValueChange(value)"
    />
    <p
      v-if="disabledExplanationForChildOwned"
      class="mt-1.5 text-xs text-muted-foreground/80"
      :data-testid="`schema-field-${fieldKey}-disabled-help`"
    >
      {{ disabledExplanationForChildOwned }}
    </p>
  </div>

  <!-- Non-bindable theme-role: child component owns its label, help text, and inline alerts. -->
  <div
    v-else-if="descriptor.meta.control.kind === 'theme-role'"
    :data-field="fieldKey"
    v-bind="disabledAriaAttrs"
  >
    <SchemaFormLiteralControl
      :field-key="fieldKey"
      :input-id="inputId"
      :descriptor="descriptor"
      :value="value"
      :inputs="inputs"
      :instance-id="instanceId"
      :theme-context="themeContext"
      :disabled="disabled"
      @update:value="(value: unknown) => onLiteralValueChange(value)"
      @update:invalid="(invalid: boolean) => onLiteralInvalidChange(invalid)"
    />
    <p
      v-if="disabledExplanationForChildOwned"
      class="mt-1.5 text-xs text-muted-foreground/80"
      :data-testid="`schema-field-${fieldKey}-disabled-help`"
    >
      {{ disabledExplanationForChildOwned }}
    </p>
  </div>

  <!-- Non-bindable rest: input/textarea/number/color/code with label + help text. -->
  <div v-else class="flex flex-col gap-1.5" :data-field="fieldKey" v-bind="disabledAriaAttrs">
    <Label
      :for="inputId"
      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      {{ descriptor.meta.label }}
    </Label>
    <SchemaFormLiteralControl
      :field-key="fieldKey"
      :input-id="inputId"
      :descriptor="descriptor"
      :value="value"
      :inputs="inputs"
      :instance-id="instanceId"
      :theme-context="themeContext"
      :hide-label="true"
      :disabled="disabled"
      @update:value="(value: unknown) => onLiteralValueChange(value)"
      @update:invalid="(invalid: boolean) => onLiteralInvalidChange(invalid)"
    />
    <p v-if="showHelpText" class="text-xs text-muted-foreground/80">
      {{ descriptor.meta.helpText }}
    </p>
    <p
      v-if="disabledExplanation"
      class="text-xs text-muted-foreground/80"
      :data-testid="`schema-field-${fieldKey}-disabled-help`"
    >
      {{ disabledExplanation }}
    </p>
  </div>
</template>

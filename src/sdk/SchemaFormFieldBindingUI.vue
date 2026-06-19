<script setup lang="ts">
// Binding-mode UI for a single SchemaForm field (Phase 2.3 / Task 44.3).
//
// Owns the `Literal | From data` toggle row plus the bind-mode body
// (source selector, JSONPath input, validation hint). The parent
// `SchemaFormField.vue` keeps the literal-mode body and the non-bindable
// fallbacks; this sibling exists so the parent stays under the per-package
// 600-line cap while the binding UI keeps a single-file home.
//
// Renders the toggle row plus, when in bind mode, an indented bind-body
// container so the source/path/hint sub-fields read as children of the
// `Literal | From data` toggle. The toggle row and the bind-body container
// are direct flex children of the parent's `flex flex-col gap-1.5` wrapper,
// which also hosts the parent's literal body rows.

import { reactive, computed } from "vue";

import { getRegisteredDataPathPicker } from "./data-path-picker-adapter";
import {
  ConfigSelector,
  Input,
  Label,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./component-ui-primitives";
import { isValidJsonPath, resolveAllowedParamBindSources } from "./public-sdk";
import type {
  InputPortDefinition,
  ParamBindSource,
  ParamDescriptor,
  ParamValueState,
} from "./public-sdk";

const props = defineProps<{
  fieldKey: string;
  descriptor: ParamDescriptor;
  value: unknown;
  paramValueState?: ParamValueState;
  inputs: readonly InputPortDefinition[];
  instanceId?: string;
  // When provided, the field label `<Label :for>` is associated with the
  // literal control element so screen readers announce the label on focus.
  // Supplied by the parent `SchemaFormField` using the same
  // `schema-field-${fieldKey}` convention as SchemaFormDataPathField.
  inputId?: string;
  // Resolved disabled state forwarded from the parent field wrapper. When
  // true the mode toggle, source selector, path input, and picker are made
  // non-interactive and every handler defensively no-ops so a stray emit
  // can never mutate `paramValueState`. The bound source/path summary stays
  // visible so authors can still read what the field is bound to.
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:paramValueState", state: ParamValueState): void;
}>();

// In-flight JSONPath draft. Stored as a small reactive object so we can
// preserve the previous "is the draft set?" semantics without paying for
// ref comparisons in templates.
const pathState = reactive<{ draft: string | null; invalid: boolean }>({
  draft: null,
  invalid: false,
});

const allowedSources = computed<readonly ParamBindSource[]>(() =>
  resolveAllowedParamBindSources(props.descriptor, props.inputs),
);

const canBind = computed(() => allowedSources.value.length > 0);
const registeredDataPathPicker = computed(() => getRegisteredDataPathPicker());
const bindPathInputId = computed(() => `schema-field-${props.fieldKey}-bind-path`);

const mode = computed<"literal" | "bind">(() =>
  props.paramValueState?.mode === "bind" ? "bind" : "literal",
);

const bindSourceOptions = computed(() =>
  allowedSources.value.map((source) => ({
    value: source.input,
    label: labelForInput(source.input),
  })),
);

function labelForInput(inputId: string): string {
  return props.inputs.find((input) => input.id === inputId)?.label ?? inputId;
}

function readBindInput(): string {
  const state = props.paramValueState;
  return state?.mode === "bind" ? state.input : "";
}

function readBindPath(): string {
  if (pathState.draft !== null) return pathState.draft;
  const state = props.paramValueState;
  return state?.mode === "bind" ? state.path : "$";
}

function toRawString(value: string | number): string {
  return typeof value === "string" ? value : String(value);
}

function setMode(next: "literal" | "bind") {
  if (props.disabled) return;
  if (next === mode.value) return;

  if (next === "literal") {
    pathState.draft = null;
    pathState.invalid = false;
    emit("update:paramValueState", { mode: "literal", value: props.value });
    return;
  }

  // next === "bind" — only emit when at least one compatible source exists.
  const allowed = allowedSources.value;
  if (allowed.length === 0) return;
  const first = allowed[0]!;
  pathState.draft = "$";
  pathState.invalid = false;
  emit("update:paramValueState", { mode: "bind", input: first.input, path: "$" });
}

function onBindSourceChange(value: string) {
  if (props.disabled) return;
  const allowed = allowedSources.value;
  if (!allowed.some((source) => source.input === value)) return;
  const previous = props.paramValueState;
  const path = readBindPath();
  if (!isValidJsonPath(path)) {
    pathState.invalid = true;
    return;
  }
  pathState.invalid = false;
  const fallback = previous?.mode === "bind" ? previous.fallback : undefined;
  emit("update:paramValueState", {
    mode: "bind",
    input: value,
    path,
    ...(fallback !== undefined ? { fallback } : {}),
  });
}

function onBindPathInput(value: string | number) {
  if (props.disabled) return;
  pathState.draft = toRawString(value);
  pathState.invalid = false;
}

function onBindPathBlur() {
  if (props.disabled) return;
  const draft = pathState.draft ?? readBindPath();
  if (!isValidJsonPath(draft)) {
    pathState.invalid = true;
    return;
  }
  pathState.invalid = false;
  const previous = props.paramValueState;
  if (!previous || previous.mode !== "bind") return;
  if (previous.path === draft) return;
  emit("update:paramValueState", {
    mode: "bind",
    input: previous.input,
    path: draft,
    ...(previous.fallback !== undefined ? { fallback: previous.fallback } : {}),
  });
}

function onBindPathPickerUpdate(path: string) {
  if (props.disabled) return;
  pathState.draft = path;
  pathState.invalid = false;
  const previous = props.paramValueState;
  if (!previous || previous.mode !== "bind") return;
  emit("update:paramValueState", {
    mode: "bind",
    input: previous.input,
    path,
    ...(previous.fallback !== undefined ? { fallback: previous.fallback } : {}),
  });
}

function bindToggleTestId(): string {
  return `${props.fieldKey}-bind-toggle`;
}

function bindModeButtonTestId(buttonMode: "literal" | "bind"): string {
  return `${props.fieldKey}-bind-mode-${buttonMode === "bind" ? "from-data" : "literal"}`;
}

function onToggleGroupChange(next: string | undefined) {
  if (next !== "literal" && next !== "bind") return;
  setMode(next);
}

function onToggleGroupUpdate(value: unknown) {
  onToggleGroupChange(typeof value === "string" ? value : undefined);
}
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <Label
      :for="inputId"
      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      {{ descriptor.meta.label }}
    </Label>
    <TooltipProvider :delay-duration="200">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        :model-value="mode"
        :aria-label="`${descriptor.meta.label} binding mode`"
        :data-testid="bindToggleTestId()"
        @update:model-value="onToggleGroupUpdate"
      >
        <ToggleGroupItem
          value="literal"
          class="text-xs"
          :disabled="disabled"
          :data-testid="bindModeButtonTestId('literal')"
        >
          Literal
        </ToggleGroupItem>
        <Tooltip v-if="!canBind">
          <TooltipTrigger as-child>
            <ToggleGroupItem
              value="bind"
              class="text-xs aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
              aria-disabled="true"
              :disabled="disabled"
              :data-testid="bindModeButtonTestId('bind')"
            >
              From data
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom">Connect an input port to enable binding.</TooltipContent>
        </Tooltip>
        <ToggleGroupItem
          v-else
          value="bind"
          class="text-xs"
          :disabled="disabled"
          :data-testid="bindModeButtonTestId('bind')"
        >
          From data
        </ToggleGroupItem>
      </ToggleGroup>
    </TooltipProvider>
  </div>

  <div v-if="mode === 'bind'" class="flex flex-col gap-1.5 pl-2">
    <template v-if="canBind">
      <ConfigSelector
        :model-value="readBindInput()"
        :options="bindSourceOptions"
        label="Source"
        :disabled="disabled"
        :data-testid="`${fieldKey}-bind-source`"
        @update:model-value="(value: string) => onBindSourceChange(value)"
      />
      <div class="flex items-center gap-1">
        <Input
          :id="bindPathInputId"
          class="min-w-0 flex-1"
          :model-value="readBindPath()"
          placeholder="$.path.to.value"
          :aria-label="`JSONPath expression for ${descriptor.meta.label}`"
          :data-testid="`${fieldKey}-bind-path`"
          :aria-invalid="pathState.invalid || undefined"
          :readonly="disabled || undefined"
          :aria-readonly="disabled || undefined"
          :tabindex="disabled ? -1 : undefined"
          @update:model-value="(value: string | number) => onBindPathInput(value)"
          @blur="onBindPathBlur()"
        />
        <component
          :is="registeredDataPathPicker"
          v-if="registeredDataPathPicker"
          :model-value="readBindPath()"
          :field-label="descriptor.meta.label"
          mode="binding"
          output-format="jsonpath"
          :instance-id="instanceId"
          :source-input-id="readBindInput()"
          :inputs="inputs"
          :disabled="disabled"
          :aria-disabled="disabled || undefined"
          :tabindex="disabled ? -1 : undefined"
          :data-testid="`${fieldKey}-bind-data-path-picker`"
          @update:model-value="(value: string) => onBindPathPickerUpdate(value)"
        />
      </div>
      <p
        v-if="pathState.invalid"
        class="text-xs text-destructive"
        role="alert"
        :data-testid="`${fieldKey}-bind-path-validation-hint`"
      >
        Enter a JSONPath like $, $.foo, or $.items[0].
      </p>
      <p v-else-if="descriptor.meta.helpText" class="text-xs text-muted-foreground/80">
        {{ descriptor.meta.helpText }}
      </p>
    </template>
    <p v-else class="text-xs text-muted-foreground/80" :data-testid="`${fieldKey}-bind-no-source`">
      No compatible inputs are connected for this param.
    </p>
  </div>
</template>

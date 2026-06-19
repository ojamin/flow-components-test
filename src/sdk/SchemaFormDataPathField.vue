<script setup lang="ts">
import { computed } from "vue";

import { getRegisteredDataPathPicker } from "./data-path-picker-adapter";
import { Input, Label } from "./component-ui-primitives";
import type { InputPortDefinition, ParamDescriptor } from "./public-sdk";

const props = withDefaults(
  defineProps<{
    fieldKey: string;
    descriptor: ParamDescriptor;
    value: unknown;
    hideLabel?: boolean;
    instanceId?: string;
    inputs?: readonly InputPortDefinition[];
    /**
     * Resolved disabled state from a sibling `disabledWhen` predicate on the
     * owning SchemaForm field. The path stays readable so authors can still
     * see what is stored, but the native input is HTML-disabled and the
     * registered picker root receives `disabled` plus `tabindex=-1` so adapters
     * whose root is a `<button>` (the documented contract) go non-interactive.
     * Emit helpers also defensively no-op so a stray adapter `update:modelValue`
     * cannot mutate config while the field is disabled.
     */
    disabled?: boolean;
  }>(),
  {
    hideLabel: false,
    instanceId: undefined,
    inputs: () => [],
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:value", value: string): void;
}>();

const registeredDataPathPicker = computed(() => getRegisteredDataPathPicker());
const inputId = computed(() => `schema-field-${props.fieldKey}`);
const pathControl = computed(() =>
  props.descriptor.meta.control.kind === "data-path" ? props.descriptor.meta.control : null,
);

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
      :for="inputId"
      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      {{ descriptor.meta.label }}
    </Label>
    <div class="flex items-center gap-1">
      <Input
        :id="inputId"
        class="min-w-0 flex-1"
        :model-value="readString()"
        :placeholder="pathControl?.placeholder"
        :aria-label="hideLabel ? descriptor.meta.label : undefined"
        :data-testid="pathControl?.testId"
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
        :data-testid="`${fieldKey}-data-path-picker`"
        :disabled="disabled"
        :aria-disabled="disabled || undefined"
        :tabindex="disabled ? -1 : undefined"
        @update:model-value="(value: string) => onPickerChange(value)"
      />
    </div>
    <p v-if="descriptor.meta.helpText" class="text-xs text-muted-foreground/70">
      {{ descriptor.meta.helpText }}
    </p>
  </div>
</template>

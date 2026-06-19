<script setup lang="ts">
/**
 * ConfigSelector — select-based config primitive.
 *
 * Wraps shadcn-vue Select with a consistent config-panel label,
 * hint, and validation-ready layout. Emits the selected value string.
 */
import type { ConfigSelectorOption } from "./types";
import { Label } from "../label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";

withDefaults(
  defineProps<{
    /** Currently selected value. */
    modelValue: string;
    /** Available options to choose from. */
    options: readonly ConfigSelectorOption[];
    /** Field label shown above the select. */
    label: string;
    /** Optional hint text. */
    hint?: string;
    /** Placeholder when no value is selected. */
    placeholder?: string;
    /** Disable all interactions. */
    disabled?: boolean;
  }>(),
  {
    disabled: false,
    placeholder: "Select…",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

// reka-ui's Select emits the broader AcceptableValue (string | null | …).
// Narrow to string before forwarding so the outward emit stays typed string.
function onSelect(next: unknown) {
  if (typeof next === "string") {
    emit("update:modelValue", next);
  }
}
</script>

<template>
  <fieldset
    class="flex min-w-0 flex-col gap-1.5"
    :disabled="disabled"
    data-testid="config-selector"
  >
    <Label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {{ label }}
    </Label>

    <p v-if="hint" class="text-xs text-muted-foreground/70">{{ hint }}</p>

    <Select :model-value="modelValue" :disabled="disabled" @update:model-value="onSelect">
      <SelectTrigger class="h-8 w-full min-w-0 max-w-full text-sm" data-testid="selector-trigger">
        <SelectValue :placeholder="placeholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </fieldset>
</template>

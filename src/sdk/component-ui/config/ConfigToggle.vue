<script setup lang="ts">
/**
 * ConfigToggle — labeled boolean toggle for config panels.
 *
 * Wraps shadcn-vue Switch with a consistent label + description
 * layout used by inspector config sections.
 */
import { Label } from "../label";
import { Switch } from "../switch";

withDefaults(
  defineProps<{
    /** Current boolean state. */
    modelValue: boolean;
    /** Short label displayed next to the toggle. */
    label: string;
    /** Optional description shown below the label. */
    description?: string;
    /** Disable interaction. */
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

function onChecked(next: boolean) {
  emit("update:modelValue", next);
}
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
    data-testid="config-toggle"
  >
    <div class="flex flex-col gap-0.5">
      <Label class="text-sm font-medium leading-tight">{{ label }}</Label>
      <p v-if="description" class="text-xs leading-relaxed text-muted-foreground/70">
        {{ description }}
      </p>
    </div>

    <Switch
      :model-value="modelValue"
      :disabled="disabled"
      :aria-label="label"
      data-testid="toggle-switch"
      @update:model-value="onChecked"
    />
  </div>
</template>

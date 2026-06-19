<script lang="ts">
// Module intent: matrix-route header bar. Exposes shared option/picker types
// so the route view can build picker payloads without re-declaring shape.

export interface MatrixPickerComponentOption {
  id: string;
  title: string;
}

export interface MatrixPickerGroupOption {
  groupId: string;
  groupLabel: string;
  components: MatrixPickerComponentOption[];
}

/** Sentinel that represents "no specific fixture variant selected". */
export const DEFAULT_VARIANT_SENTINEL = "__default__";
</script>

<script setup lang="ts">
// Presentational header used by ComponentMatrixView. Owns the component,
// fixture-variant, and viewport pickers plus the back-to-browser link. All
// state lives in the route query — this component is pure inputs/outputs and
// emits change events the route view turns into query updates.

import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@flow-builder/components/component-ui";
import type { FixtureVariantMeta } from "@flow-builder/components/sdk";

import { VIEWPORTS, type Viewport } from "../composables/useMatrixQueryState";

defineProps<{
  selectedComponentId: string;
  variantSelectValue: string;
  viewport: Viewport;
  pickerOptions: readonly MatrixPickerGroupOption[];
  fixtureVariants: readonly FixtureVariantMeta[];
}>();

const emit = defineEmits<{
  (e: "component-change", value: unknown): void;
  (e: "variant-change", value: unknown): void;
  (e: "viewport-change", value: Viewport): void;
}>();

// Inline capitalise helper for viewport button labels — kept local so the
// template can call it without pulling a utility module just for this.
function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
</script>

<template>
  <header
    class="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 border-b border-border bg-background"
    data-testid="matrix-header"
  >
    <div class="flex flex-col mr-2">
      <p
        class="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest leading-none"
      >
        @flow-builder
      </p>
      <p class="text-sm font-semibold text-foreground mt-1">Component matrix</p>
    </div>

    <!-- Component picker -->
    <div class="flex items-center gap-2 min-w-0">
      <Label for="matrix-component" class="text-[11px] text-muted-foreground">Component</Label>
      <Select
        :model-value="selectedComponentId"
        @update:model-value="emit('component-change', $event)"
      >
        <SelectTrigger
          id="matrix-component"
          class="h-8 min-w-[14rem] text-xs"
          data-testid="matrix-component-select"
        >
          <SelectValue placeholder="Select a component…" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup v-for="group in pickerOptions" :key="group.groupId">
            <SelectLabel>{{ group.groupLabel }}</SelectLabel>
            <SelectItem v-for="comp in group.components" :key="comp.id" :value="comp.id">
              {{ comp.title }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <!-- Variant picker (visible when the active component has 2+ variants) -->
    <div
      v-if="fixtureVariants.length >= 2"
      class="flex items-center gap-2"
      data-testid="matrix-variant-group"
    >
      <Label for="matrix-variant" class="text-[11px] text-muted-foreground">Fixture</Label>
      <Select
        :model-value="variantSelectValue"
        @update:model-value="emit('variant-change', $event)"
      >
        <SelectTrigger
          id="matrix-variant"
          class="h-8 min-w-[10rem] text-xs"
          data-testid="matrix-variant-select"
        >
          <SelectValue placeholder="Default fixture" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="DEFAULT_VARIANT_SENTINEL">Default fixture</SelectItem>
          <SelectItem v-for="variant in fixtureVariants" :key="variant.id" :value="variant.id">
            {{ variant.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Viewport toggle -->
    <div
      class="flex items-center gap-2"
      role="group"
      aria-label="Viewport"
      data-testid="matrix-viewport-group"
    >
      <span class="text-[11px] text-muted-foreground">Viewport</span>
      <button
        v-for="vp in VIEWPORTS"
        :key="vp"
        type="button"
        :aria-pressed="viewport === vp"
        :data-testid="`matrix-viewport-${vp}`"
        class="px-2.5 py-1.5 text-[11px] rounded min-h-8 inline-flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="
          viewport === vp
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        "
        @click="emit('viewport-change', vp)"
      >
        {{ capitalize(vp) }}
      </button>
    </div>

    <div class="ml-auto flex items-center gap-2">
      <RouterLink
        to="/"
        class="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
        data-testid="matrix-browser-link"
      >
        ← Browser
      </RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { StaticComponentRenderProps } from "@flow-builder/components/sdk";

import { StatusBadgeConfigDefaults, type StatusBadgeConfig, type StatusBadgeFixtureData } from "./types";

const props = defineProps<StaticComponentRenderProps<StatusBadgeConfig, StatusBadgeFixtureData>>();

const config = computed(() => ({
  ...StatusBadgeConfigDefaults,
  ...props.config,
}));

const label = computed(() => config.value.label.trim());
const value = computed(() => config.value.value.trim());
const hasContent = computed(() => Boolean(label.value || value.value));

const badgeClass = computed(() => {
  const sizeClass =
    config.value.size === "sm"
      ? "gap-1.5 rounded-md px-2 py-1 text-xs"
      : "gap-2 rounded-lg px-3 py-2 text-sm";

  if (config.value.tone === "danger") {
    return `${sizeClass} border-ct-destructive/35 bg-ct-destructive/10 text-ct-foreground`;
  }

  if (config.value.tone === "warning") {
    return `${sizeClass} border-amber-500/35 bg-amber-500/10 text-ct-foreground`;
  }

  if (config.value.tone === "neutral") {
    return `${sizeClass} border-ct-border bg-ct-surface-muted text-ct-foreground`;
  }

  return `${sizeClass} border-ct-accent/35 bg-ct-accent/10 text-ct-foreground`;
});

const dotClass = computed(() => {
  if (config.value.tone === "danger") return "bg-ct-destructive";
  if (config.value.tone === "warning") return "bg-amber-500";
  if (config.value.tone === "neutral") return "bg-ct-foreground-muted";
  return "bg-ct-accent";
});
</script>

<template>
  <section class="w-full">
    <div
      v-if="hasContent"
      :class="['inline-flex max-w-full items-center border font-medium shadow-sm', badgeClass]"
      :aria-label="[label, value].filter(Boolean).join(': ')"
      data-testid="status-badge"
    >
      <span :class="['size-2 shrink-0 rounded-full', dotClass]" aria-hidden="true" />
      <span v-if="label" class="truncate text-ct-foreground-muted" data-testid="status-badge-label">
        {{ label }}
      </span>
      <span v-if="label && value" class="text-ct-foreground-muted" aria-hidden="true">/</span>
      <span v-if="value" class="truncate text-ct-foreground" data-testid="status-badge-value">
        {{ value }}
      </span>
    </div>

    <div
      v-else
      class="inline-flex items-center rounded-lg border border-dashed border-ct-border px-3 py-2 text-sm text-ct-foreground-muted"
      data-testid="status-badge-empty-state"
    >
      {{ props.fixtureData?.emptyStateTitle ?? "Add a status label or value." }}
    </div>
  </section>
</template>

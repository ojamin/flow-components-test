<script setup lang="ts">
import { computed } from "vue";

import { Icon } from "@iconify/vue";

import type { StaticComponentRenderProps } from "@flow-builder/components/sdk";

import {
  resolveClampLinesClass,
  resolveContentTextAlignClass,
} from "../../../sdk/content-primitives";

import { textConfigDefaults, type TextConfig, type TextFixtureData } from "./types";

// internal interaction: no component events declared. Text is purely
// presentational — typography, alignment, and optional prose/clamp styling.
// No user-driven affordance surfaces to the graph.

const props = defineProps<StaticComponentRenderProps<TextConfig, TextFixtureData>>();

const config = computed(() => ({
  ...textConfigDefaults,
  ...props.config,
}));

const bodyText = computed(() => config.value.text.trim());

// Prose wrapper: typography + alignment. Component-theme colors flow into the
// typography plugin via the `[data-ct-scope] .prose` override block in
// `src/styles/library-overrides.css`, so this renderer deliberately avoids
// host dark-mode inversion. No cn import needed — no
// conflicting Tailwind utilities at this combination.
const proseClass = computed(() =>
  ["prose max-w-none", resolveContentTextAlignClass(config.value.align)].filter(Boolean).join(" "),
);

// Paragraph: base styles, optional alignment when prose is off, optional clamp.
// Foreground paint flows through the canonical `text-ct-foreground` alias so
// themed descendants (Tabs/ViewStack/Card/Section slot content) read against
// the active component-theme surface instead of the unscoped host token.
const paragraphClass = computed(() => {
  const parts: string[] = ["whitespace-pre-line text-base leading-7 text-ct-foreground"];
  if (!config.value.prose) {
    parts.push(resolveContentTextAlignClass(config.value.align));
  }
  const clamp = resolveClampLinesClass(config.value.clampLines);
  if (clamp) {
    parts.push(clamp);
  }
  return parts.filter(Boolean).join(" ");
});
</script>

<template>
  <section class="w-full">
    <div v-if="bodyText" :class="config.prose ? proseClass : undefined" data-testid="text-content">
      <p :class="paragraphClass" data-testid="text-body">
        {{ bodyText }}
      </p>
    </div>

    <div v-else class="flex items-center gap-2" data-testid="text-empty-state">
      <Icon class="size-4 shrink-0 text-ct-foreground-muted" icon="lucide:text" />
      <p class="text-sm text-ct-foreground-muted">
        {{ props.fixtureData?.emptyStateTitle ?? "No text content — add copy or bind from data." }}
      </p>
    </div>
  </section>
</template>

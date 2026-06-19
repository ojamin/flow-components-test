<script lang="ts">
// Module intent: deterministic presentational cell for the Matrix route.
// Exports shared types so the matrix route view stays type-safe when it
// composes a grid of cells without re-declaring the state/theme contract.

/** Light/dark theme treatment applied to the cell wrapper. */
export type MatrixCellTheme = "light" | "dark";

/** State the cell simulates. Matches the StateMode contract from PreviewControlsBar. */
export type MatrixCellState = "default" | "empty" | "loading" | "error" | "disabled";
</script>

<script setup lang="ts">
// Cell module body — types above are intentionally in a separate script block
// so they can be imported by `ComponentMatrixView.vue` alongside the default
// component export.
// Renders one (theme × state) combination of a single component for design
// review and contributor coverage. Stays presentational — no async fetches,
// no fixture loading, no runtime evaluation. The route view loads the
// renderer + fixture data once and reuses them across all cells.
//
// State semantics mirror RendererPreviewFrame's contract so cells stay
// consistent with the single-component detail view:
//   - default:  renderer with fixture data
//   - empty:    renderer with `fixtureData = null`
//   - loading:  simulated loading chrome (renderer not mounted)
//   - error:    simulated error chrome (renderer not mounted)
//   - disabled: renderer wrapped in pointer-events-none + opacity-60
//
// Applicability metadata: when the active definition declares a state
// `notApplicable` via stateSupport, the cell renders a muted N/A panel with
// the reason instead of mounting the renderer or a simulated frame. Missing
// metadata (the parent passes `applicability === undefined`) renders a
// non-blocking warning so authors notice unannotated coverage gaps.

import { computed } from "vue";
import type { Component, Directive } from "vue";

import type { ComponentThemeContext, StateApplicability } from "@flow-builder/components/sdk";

import {
  applyPreviewThemeStyleBridge,
  cleanupPreviewThemeStyleBridge,
  type PreviewThemeStyleBridgeInput,
} from "./preview-theme-style-bridge";

/**
 * Local directive: applies the scoped `--ct-*` CSS-variable bridge to the
 * renderer-loaded wrapper through the package-local managed style helper.
 * Each cell uses its own bridge handle so removing one cell does not strip
 * the scope from siblings.
 */
const vThemeContextStyle: Directive<HTMLElement, PreviewThemeStyleBridgeInput | undefined> = {
  mounted(el, binding) {
    if (binding.value) applyPreviewThemeStyleBridge(el, binding.value);
  },
  updated(el, binding) {
    if (binding.value) applyPreviewThemeStyleBridge(el, binding.value);
    else cleanupPreviewThemeStyleBridge(el);
  },
  unmounted(el) {
    cleanupPreviewThemeStyleBridge(el);
  },
};

const props = defineProps<{
  /** Component id for deterministic Playwright/test discoverability. */
  componentId: string;
  /** Active variant id. Empty string when no variant override (default fixture). */
  variantId: string;
  /** Light or dark theme treatment. */
  theme: MatrixCellTheme;
  /** State this cell simulates. */
  state: MatrixCellState;
  /** Active viewport — bubbled into a data attribute for matrix observability. */
  viewport: "desktop" | "tablet" | "mobile";
  /**
   * State applicability metadata for this cell's state. `true` means fully
   * applicable; an object carries the `notApplicable` reason; `undefined`
   * means the active definition supplied no metadata for this state.
   */
  applicability: StateApplicability | undefined;
  /** Resolved renderer component, or null when the renderer is unavailable. */
  rendererComponent: Component | null;
  /** Resolved literal config to pass to the renderer. */
  resolvedConfig: Record<string, unknown>;
  /** Resolved fixture payload (variant or default). null is treated as the empty payload. */
  fixtureData: unknown;
  /** Optional component-theme context the renderer can read. */
  themeContext?: ComponentThemeContext;
  /** Scoped CSS-variable bridge input for this cell. */
  themeContextStyle?: PreviewThemeStyleBridgeInput;
}>();

// Read-only matrix: runtime outputs/events are not surfaced. Provide no-op
// callbacks so renderers that wire to `update-runtime-outputs` / `emit-event`
// don't crash on undefined props.
function noopMergeOutputs(_next: Record<string, unknown>): void {
  // no-op: matrix cells do not collect runtime output mutations
}

function noopEmitEvent(_eventId: string, _payload: unknown): void {
  // no-op: matrix cells do not collect emitted events
}

// Derived values stay reactive: matrix cells are keyed by state/theme but
// fixture data, applicability metadata, and renderer/config props change on
// the same cell instance whenever the route's component/variant/viewport
// selection changes. Reading `props.x` at setup time would freeze these to
// the first selection's values and leak stale state across selections.

/** Applicability reason when the active definition marked this state as not applicable. */
const notApplicableReason = computed((): string | undefined =>
  props.applicability && props.applicability !== true
    ? props.applicability.notApplicable
    : undefined,
);

/** True when applicability metadata is missing (definition did not declare). */
const missingApplicability = computed((): boolean => props.applicability === undefined);

/** Fixture data shown to the renderer — null for the empty state. */
const effectiveFixtureData = computed((): unknown =>
  props.state === "empty" ? null : props.fixtureData,
);

/** Tailwind treatment for the renderer content wrapper per-state. */
const rendererContentClass = computed((): string =>
  props.state === "disabled" ? "pointer-events-none opacity-60" : "",
);
</script>

<template>
  <!--
    Cell shell. `dark` class scopes the package's dark CSS variable block
    (`.dark { ... }`) to this subtree only — mirroring RendererHostPane's
    isDark wiring so light + dark can render side-by-side in the same DOM.
    Test/data attributes give Playwright a deterministic selector model for
    Task 4.4 without needing to scrape the rendered subtree.
  -->
  <div
    class="rounded-md border border-border/60 bg-background overflow-hidden flex flex-col min-h-[10rem]"
    :class="theme === 'dark' ? 'dark' : ''"
    :data-testid="`matrix-cell-${componentId}-${theme}-${state}`"
    :data-component-id="componentId"
    :data-variant-id="variantId"
    :data-theme="theme"
    :data-state="state"
    :data-viewport="viewport"
    :data-state-applicability="
      notApplicableReason
        ? 'not-applicable'
        : missingApplicability
          ? 'missing-metadata'
          : 'applicable'
    "
    role="figure"
    :aria-label="`${componentId} — ${theme} theme, ${state} state`"
  >
    <!-- Cell header with theme + state labels -->
    <div
      class="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-border/40 bg-muted/40 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
    >
      <span>{{ state }}</span>
      <span>{{ theme }}</span>
    </div>

    <!--
      N/A treatment. Definition explicitly marked this state as not applicable —
      surface the reason so authors don't waste time wondering why the cell is
      empty. The reason text is included in the DOM (not just title) so it's
      readable without hovering and observable from Playwright.
    -->
    <div
      v-if="notApplicableReason"
      class="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-6 text-center bg-muted/20"
      role="status"
      data-testid="matrix-cell-not-applicable"
    >
      <span
        class="text-[10px] font-semibold uppercase tracking-widest rounded px-1.5 py-0.5 bg-muted text-muted-foreground"
      >
        N/A
      </span>
      <p class="text-[11px] text-muted-foreground leading-snug max-w-[16rem]">
        {{ notApplicableReason }}
      </p>
    </div>

    <!--
      Missing applicability metadata: amber warning so the gap is discoverable
      but the cell still attempts to render the simulated/real state below. The
      mounted renderer/state simulation is intentionally still shown so authors
      can validate coverage before declaring the state non-applicable.
    -->
    <template v-else>
      <div
        v-if="missingApplicability"
        class="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-warning bg-warning/10 border-b border-warning/40"
        role="status"
        data-testid="matrix-cell-missing-metadata"
      >
        No coverage metadata
      </div>

      <!--
        Simulated loading state — mirror RendererPreviewFrame's chrome so the
        matrix view stays consistent with the single-component detail view.
      -->
      <div
        v-if="state === 'loading'"
        class="flex-1 flex items-center justify-center px-4 py-6 bg-muted/40"
        role="status"
        data-testid="matrix-cell-loading-preview"
      >
        <span
          class="w-4 h-4 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin"
          aria-hidden="true"
        />
        <span class="ml-2 text-[11px] text-foreground">Simulated loading</span>
      </div>

      <!-- Simulated error state -->
      <div
        v-else-if="state === 'error'"
        class="flex-1 px-3 py-3 bg-destructive/5 border-t border-destructive/20"
        role="alert"
        data-testid="matrix-cell-error-preview"
      >
        <p class="text-[11px] font-semibold text-destructive mb-0.5">Simulated error state</p>
        <p class="text-[10px] text-foreground/80 leading-snug">
          Host-driven simulation — not real component error logic.
        </p>
      </div>

      <!--
        Renderer-backed states (default / empty / disabled). When the renderer
        is unavailable (resolution error, non-renderable) we fall back to a
        soft "no renderer" panel so the matrix never silently renders nothing.
      -->
      <div
        v-else-if="rendererComponent"
        v-theme-context-style="themeContextStyle"
        class="relative flex-1 p-3 flex flex-col overflow-auto"
        data-testid="matrix-cell-renderer"
      >
        <div :class="['flex-1 min-h-0', rendererContentClass]">
          <component
            :is="rendererComponent"
            :config="resolvedConfig"
            :fixture-data="effectiveFixtureData"
            :runtime-outputs="{}"
            :update-runtime-outputs="noopMergeOutputs"
            :emit-event="noopEmitEvent"
            :theme-context="themeContext"
            render-mode="authoring"
          />
        </div>
      </div>

      <div
        v-else
        class="flex-1 flex items-center justify-center px-4 py-6 text-[11px] text-muted-foreground bg-muted/20"
        role="status"
        data-testid="matrix-cell-no-renderer"
      >
        No renderer available
      </div>
    </template>
  </div>
</template>

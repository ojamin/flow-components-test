<script setup lang="ts">
// Module intent: presentational preview-frame for the renderer host. Owns the
// device/viewport/state-mode chrome plus the renderer/fixture state-machine
// branches (idle / non-renderable / loading / error / fixture-loading /
// fixture-error / simulated-loading / simulated-error / loaded). All state
// flows in via props; no fetching, lifecycle, or store access here.

import type { Component, Directive } from "vue";

import type { ComponentThemeContext } from "@flow-builder/components/sdk";
import type { DatasetDerivationService } from "@flow-builder/components/runtime-services";

import type { DeviceMode, StateMode } from "./PreviewControlsBar.vue";
import {
  applyPreviewThemeStyleBridge,
  cleanupPreviewThemeStyleBridge,
  type PreviewThemeStyleBridgeInput,
} from "./preview-theme-style-bridge";

/**
 * Local directive: applies the scoped `--ct-*` CSS-variable bridge to the
 * renderer-loaded wrapper through the package-local managed style helper.
 * The helper owns the `data-ct-scope` attribute on this element plus a
 * managed `data-component-theme-style-bridge` style element in the owning
 * document head, mirroring the host bridge contract documented in
 * `packages/components/docs/component-theme-contract.md`. Inline `style`
 * mutation on the renderer wrapper is intentionally avoided so descendant
 * Tailwind utilities consume `--ct-*` slots from the scoped style block.
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

defineProps<{
  /** Lifecycle status for the renderer module load. */
  hostStatus: "non-renderable" | "loading" | "loaded" | "error";
  /** Optional renderer-error message; only meaningful when hostStatus === "error". */
  hostErrorMessage?: string;
  /** Lifecycle status for definition.loadFixtureData(). */
  fixtureStatus: "idle" | "loading" | "loaded" | "error";
  /** Optional fixture-error message; only meaningful when fixtureStatus === "error". */
  fixtureErrorMessage?: string;
  /** Active simulated-state preview mode (default/empty/loading/error/disabled). */
  stateMode: StateMode;
  /** Banner copy shown above the renderer for non-default state modes. */
  stateBannerLabel: string;
  /** Whether the simulated-state banner should be rendered. */
  showStateBanner: boolean;
  /** Tailwind classes for the frame wrapper (viewport width + dark + device ring). */
  frameClass: readonly string[];
  /** Device context for the data-device attribute. */
  device: DeviceMode;
  /** Tailwind class string for the renderer content wrapper. */
  rendererContentClass: string;
  /** Resolved Vue component to render in the loaded state. */
  rendererComponent: Component | null;
  /** Resolved literal config passed to the renderer's `:config` prop. */
  resolvedConfig: Record<string, unknown>;
  /** Fixture data passed to the renderer (null for empty stateMode, undefined while pending). */
  effectiveFixtureData: unknown;
  /** Runtime outputs map shared with the renderer via the `:runtime-outputs` prop. */
  runtimeOutputs: Record<string, unknown>;
  /** Callback the renderer uses to merge new runtime outputs (interactive components). */
  updateRuntimeOutputs: (next: Record<string, unknown>) => void;
  /** Callback the renderer uses to fire declared events (validated by the host). */
  emitEvent: (eventId: string, payload: unknown) => void;
  /**
   * Optional component-theme context for the renderer. The harness supplies a
   * frozen default context derived from the built-in default theme; renderers
   * may read role values from `themeContext.properties` without consulting the
   * host inheritance resolver.
   */
  themeContext?: ComponentThemeContext;
  /** Package-safe service used by table/chart renderers for preview derivations. */
  datasetDerivationService?: DatasetDerivationService;
  /**
   * Scoped CSS-variable bridge input for the renderer-loaded wrapper. The
   * local `v-theme-context-style` directive applies a managed head style
   * element (selector `[data-ct-scope="<scopeId>"]`) and the matching
   * `data-ct-scope` attribute on this element so renderers consume canonical
   * `--ct-*` slots from descendant Tailwind utilities without inline style
   * mutation.
   */
  themeContextStyle?: PreviewThemeStyleBridgeInput;
}>();
</script>

<template>
  <div :class="frameClass" :data-device="device" data-testid="preview-frame">
    <!--
      State preview banner: visible for all non-default state modes.
      Informs the developer which simulated state is active.
    -->
    <div
      v-if="showStateBanner"
      class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30 px-3 py-1 mb-2 rounded"
      role="status"
      data-testid="state-preview-banner"
      :data-state-mode="stateMode"
    >
      {{ stateBannerLabel }}
    </div>

    <!-- Non-renderable: component runs logic/data, not visible layout -->
    <div
      v-if="hostStatus === 'non-renderable'"
      class="flex flex-col items-center justify-center py-8 rounded-md bg-muted/40 text-center gap-2"
      role="status"
      data-testid="renderer-non-renderable"
    >
      <svg
        class="w-5 h-5 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        aria-hidden="true"
      >
        <!--
          Lucide "package" outline — conveys "this exists but has no visual surface",
          which is precisely the non-renderable semantic.
        -->
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m7.875 14.25 1.214 1.942a2.25 2.25 0 001.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h19.18a1.5 1.5 0 011.497 1.63l-1.16 9.124A2.25 2.25 0 0119.68 21.75H4.32a2.25 2.25 0 01-2.247-2.026L.91 10.63A1.5 1.5 0 012.41 9zM6 9V4.875a1.125 1.125 0 011.125-1.125h9.75C17.496 3.75 18 4.254 18 4.875V9"
        />
      </svg>
      <p class="text-xs font-medium text-foreground">No visual renderer</p>
      <p class="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
        This component produces data or runs logic — it has no visible output in preview.
      </p>
    </div>

    <!-- Loading: renderer module is resolving -->
    <div
      v-else-if="hostStatus === 'loading'"
      class="flex items-center justify-center py-8 rounded-md bg-muted/60 border border-border/60"
      role="status"
      aria-label="Loading preview"
      data-testid="renderer-loading"
    >
      <span
        class="w-5 h-5 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin"
        aria-hidden="true"
      />
      <span class="ml-2 text-xs text-foreground">Loading preview…</span>
    </div>

    <!-- Error: renderer load failed or render threw -->
    <div
      v-else-if="hostStatus === 'error'"
      class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
      role="alert"
      data-testid="renderer-error"
    >
      <p class="text-xs font-semibold text-destructive mb-0.5">Preview unavailable</p>
      <p class="text-[11px] text-foreground leading-relaxed font-code break-all">
        {{ hostErrorMessage }}
      </p>
    </div>

    <!--
      Fixture loading: renderer module resolved, but the async fixture data
      is still pending. Distinct from renderer-loading so component authors
      can tell which side of the load is slow.
    -->
    <div
      v-else-if="hostStatus === 'loaded' && fixtureStatus === 'loading'"
      class="flex items-center justify-center py-8 rounded-md bg-muted/60 border border-border/60"
      role="status"
      aria-label="Loading fixture data"
      data-testid="fixture-loading"
    >
      <span
        class="w-5 h-5 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin"
        aria-hidden="true"
      />
      <span class="ml-2 text-xs text-foreground">Loading fixture data…</span>
    </div>

    <!--
      Fixture error: definition.loadFixtureData rejected. Surfaced as a
      contract failure so component authors notice missing or broken loaders
      instead of seeing the renderer mount with undefined fixture data.
    -->
    <div
      v-else-if="hostStatus === 'loaded' && fixtureStatus === 'error'"
      class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
      role="alert"
      data-testid="fixture-error"
    >
      <p class="text-xs font-semibold text-destructive mb-0.5">Fixture data unavailable</p>
      <p class="text-[11px] text-foreground leading-relaxed font-code break-all">
        {{ fixtureErrorMessage }}
      </p>
    </div>

    <!--
      State: loading preview — replaces renderer output when stateMode=loading.
      Labelled "Simulated" so authors know this is a host-driven simulation,
      not the component's own loading logic. Only shown after fixture data has
      resolved so the user sees fixture-loading/fixture-error first when those
      states are active.
    -->
    <div
      v-else-if="hostStatus === 'loaded' && fixtureStatus === 'loaded' && stateMode === 'loading'"
      class="flex items-center justify-center py-8 rounded-md bg-muted/60 border border-border/60"
      role="status"
      aria-label="Simulated loading state"
      data-testid="state-loading-preview"
    >
      <span
        class="w-5 h-5 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin"
        aria-hidden="true"
      />
      <span class="ml-2 text-xs text-foreground">Simulated loading state</span>
    </div>

    <!--
      State: error preview — replaces renderer output when stateMode=error.
      Labelled "Simulated" so authors know this is a host-driven simulation,
      not real component error-handling logic.
    -->
    <div
      v-else-if="hostStatus === 'loaded' && fixtureStatus === 'loaded' && stateMode === 'error'"
      class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
      role="alert"
      data-testid="state-error-preview"
    >
      <p class="text-xs font-semibold text-destructive mb-0.5">Simulated error state</p>
      <p class="text-[11px] text-foreground leading-relaxed">
        Simulated component error state — preview how your component renders when its host reports
        an error. This is not real component error logic.
      </p>
    </div>

    <!--
      Loaded: renderer resolved AND fixture data resolved.
      Both gates are required so the renderer never mounts with undefined fixture data.

      Sizing/positioning contract: the wrapper provides a definite 480px
      viewport (`h-[480px] flex flex-col`) and a positioned containing block
      (`relative`) so authoring-mode fixed/overlay renderers can scope their
      absolute surfaces to the preview frame. The inner `flex-1 min-h-0`
      content wrapper turns that definite height into a definite flex-item size
      for renderers that fill their parent, while `overflow-auto` keeps content
      that exceeds 480px scrollable within the preview frame.
    -->
    <div
      v-else-if="hostStatus === 'loaded' && fixtureStatus === 'loaded' && rendererComponent"
      v-theme-context-style="themeContextStyle"
      class="relative rounded-md border border-border/50 bg-muted/20 p-4 h-[480px] flex flex-col overflow-auto"
      data-testid="renderer-loaded"
    >
      <!--
        Disabled state wrapper: adds pointer-events-none + reduced opacity to simulate
        an interactive component in a disabled/inactive state.
        `flex-1 min-h-0` propagates the wrapper's definite height down to the
        rendered component so `h-full` resolves correctly inside MapLibre/chart
        renderers.
      -->
      <div :class="['flex-1 min-h-0', rendererContentClass]">
        <component
          :is="rendererComponent"
          :config="resolvedConfig"
          :fixture-data="effectiveFixtureData"
          :runtime-outputs="runtimeOutputs"
          :update-runtime-outputs="updateRuntimeOutputs"
          :emit-event="emitEvent"
          :theme-context="themeContext"
          :dataset-derivation-service="datasetDerivationService"
          render-mode="authoring"
        />
      </div>
    </div>
  </div>
</template>

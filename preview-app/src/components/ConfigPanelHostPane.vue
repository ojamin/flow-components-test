<script setup lang="ts">
// Module intent: ConfigPanel host for the package preview app detail pane.
// Loads definition.configPanel() lazily, passes controlled config to the panel,
// validates update:config events through the definition configSchema, and surfaces
// actionable diagnostics for missing / loading / error / invalid-config states.
//
// Stale-load protection: a monotonic loadToken is incremented at the top of every
// watcher invocation — including early-return paths — so any in-flight configPanel()
// load from a prior definition is always discarded before processing the new one.
//
// Render-time errors from the config panel subtree are caught by onErrorCaptured
// and transition the host into the error state without crashing the app.

import { computed, markRaw, onErrorCaptured, ref, shallowRef, watch } from "vue";
import type { Component } from "vue";

import {
  resolveFixtureData,
  type ComponentDefinition,
  type ParamValuesState,
} from "@flow-builder/components/sdk";
import type { DatasetDerivationService } from "@flow-builder/components/runtime-services";

const props = defineProps<{
  /** The selected component definition, or undefined when nothing is selected. */
  definition: ComponentDefinition | undefined;
  /**
   * Current controlled config to pass to the ConfigPanel.
   * Falls back to definition.configDefaults when undefined.
   */
  config?: Record<string, unknown>;
  /**
   * Persisted literal/bind state for params. Forwarded to the loaded ConfigPanel
   * so the SchemaForm-based bind toggle reflects parent state. Updates flow back
   * through `update:paramValues`; the host does not interpret bind state itself.
   */
  paramValues?: ParamValuesState;
  /**
   * Optional component-specific picker options (e.g. `vmap1.map-layer-raster`'s
   * `sourceRefOptions`). Forwarded transparently so package preview specs and
   * fixtures can exercise the connected-source picker UI without the preview
   * shell needing to understand individual component contracts.
   */
  sourceRefOptions?: ReadonlyArray<{
    value: string;
    label?: string;
    kind?: string;
    detail?: string;
  }>;
  /** Package-safe preview metadata service for SchemaForm chart-adapter suggestions. */
  datasetDerivationService?: DatasetDerivationService;
}>();

const emit = defineEmits<{
  (e: "update:config", value: Record<string, unknown>): void;
  (e: "update:paramValues", value: ParamValuesState): void;
}>();

/** Discriminated state machine for the ConfigPanel host lifecycle. */
type PanelState =
  | { status: "idle" }
  | { status: "missing" }
  | { status: "loading" }
  | { status: "loaded" }
  | { status: "error"; message: string };

const panelState = ref<PanelState>({ status: "idle" });

// shallowRef + markRaw: config-panel Vue components must not be wrapped in Vue's
// reactive proxy. Same reasoning as RendererHostPane renderer handling.
const panelComponent = shallowRef<Component | null>(null);

// Diagnostic for invalid config update attempts from the loaded ConfigPanel.
// Set when safeParse() rejects a proposed update; cleared on the next valid
// update or whenever the definition changes.
const invalidConfigMessage = ref<string | null>(null);

type FixtureState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; value: unknown }
  | { status: "error"; message: string };

const fixtureState = ref<FixtureState>({ status: "idle" });
const fixtureData = computed(() =>
  fixtureState.value.status === "loaded" ? fixtureState.value.value : undefined,
);

// Monotonic token for stale-load detection.
// Incremented at the start of every watcher invocation — including idle and
// missing early-return paths — so any previously in-flight async load is
// always invalidated before we inspect the new definition.
let loadToken = 0;
let fixtureToken = 0;

/**
 * Reload the config panel whenever the selected definition changes.
 * Immediate so the host reacts to the initial definition on mount.
 */
watch(
  () => props.definition,
  async (def) => {
    // Invalidate any in-flight configPanel load immediately — including when the
    // new definition is undefined or lacks a configPanel. Without this a slow
    // pending load from a prior selection could resolve after an early-return
    // path (idle / missing) and overwrite that state.
    const token = ++loadToken;

    // Always reset: prevents stale panel flash when navigating between components.
    panelComponent.value = null;
    invalidConfigMessage.value = null;

    if (!def) {
      panelState.value = { status: "idle" };
      return;
    }

    if (!def.configPanel) {
      panelState.value = { status: "missing" };
      return;
    }

    panelState.value = { status: "loading" };

    try {
      const resolved = await def.configPanel();
      // Stale-load guard: a newer definition was selected while we were awaiting.
      if (token !== loadToken) return;
      panelComponent.value = markRaw(resolved as Component);
      panelState.value = { status: "loaded" };
    } catch (err) {
      if (token !== loadToken) return;
      panelState.value = {
        status: "error",
        message: err instanceof Error ? err.message : "ConfigPanel could not be loaded.",
      };
    }
  },
  { immediate: true },
);

watch(
  () => props.definition,
  async (def) => {
    const token = ++fixtureToken;

    if (!def) {
      fixtureState.value = { status: "idle" };
      return;
    }

    fixtureState.value = { status: "loading" };
    try {
      const value = await resolveFixtureData(def);
      if (token !== fixtureToken) return;
      fixtureState.value = { status: "loaded", value };
    } catch (err) {
      if (token !== fixtureToken) return;
      fixtureState.value = {
        status: "error",
        message: err instanceof Error ? err.message : "Fixture data could not be loaded.",
      };
    }
  },
  { immediate: true },
);

// Error boundary: catch render-time errors inside the config panel subtree.
// Returns false to prevent further propagation while surfacing the message.
onErrorCaptured((err) => {
  const message = err instanceof Error ? err.message : "ConfigPanel threw an error during render.";
  panelState.value = { status: "error", message };
  panelComponent.value = null;
  return false;
});

/**
 * Handle update:config events from the loaded ConfigPanel component.
 * Validates the proposed update through definition.configSchema.safeParse.
 * Invalid updates show a diagnostic message but do not mutate or emit state.
 */
function handleConfigUpdate(next: Record<string, unknown>): void {
  if (!props.definition) return;
  const result = props.definition.configSchema.safeParse(next);
  if (!result.success) {
    invalidConfigMessage.value =
      "Config update was invalid and was not applied. Check that all required fields are present and have the correct types.";
    return;
  }
  invalidConfigMessage.value = null;
  emit("update:config", result.data as Record<string, unknown>);
}

/**
 * Forward bind-state updates from the loaded ConfigPanel back to the parent.
 * The host does not validate bind shape — `ParamValuesState` is enforced upstream
 * via the SchemaForm contract and downstream by `resolveParamValues`. Treating
 * this as a transparent passthrough keeps the host's responsibility limited to
 * config-schema validation, mirroring the renderer pane's own bind plumbing.
 */
function handleParamValuesUpdate(next: ParamValuesState): void {
  emit("update:paramValues", next);
}
</script>

<template>
  <!--
    Config panel host section. Hidden when no component is selected (idle).
    Visible for all other states — including missing and error — so the developer
    always gets actionable feedback about config panel availability.
  -->
  <section
    v-if="panelState.status !== 'idle'"
    class="mb-8"
    aria-label="Component configuration"
    data-testid="config-panel-host-pane"
  >
    <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
      Configuration
    </h3>

    <!-- Missing: component has no configPanel module -->
    <div
      v-if="panelState.status === 'missing'"
      class="flex flex-col items-center justify-center py-6 rounded-md bg-muted/40 text-center gap-2"
      role="status"
      data-testid="config-panel-missing"
    >
      <p class="text-xs text-muted-foreground">No config panel</p>
    </div>

    <!-- Loading: configPanel module is resolving -->
    <div
      v-else-if="panelState.status === 'loading'"
      class="flex items-center justify-center py-6 rounded-md bg-muted/40"
      role="status"
      aria-label="Loading configuration"
      data-testid="config-panel-loading"
    >
      <span
        class="w-5 h-5 rounded-full border-2 border-border border-t-primary animate-spin"
        aria-hidden="true"
      />
      <span class="ml-2 text-xs text-muted-foreground">Loading config panel…</span>
    </div>

    <!-- Error: configPanel load failed or render threw -->
    <div
      v-else-if="panelState.status === 'error'"
      class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
      role="alert"
      data-testid="config-panel-error"
    >
      <p class="text-xs font-semibold text-destructive mb-0.5">Config panel unavailable</p>
      <p class="text-xs text-muted-foreground leading-relaxed font-code break-all">
        {{ panelState.message }}
      </p>
    </div>

    <!-- Loaded: configPanel resolved and renders -->
    <div
      v-else-if="panelState.status === 'loaded' && panelComponent"
      class="rounded-md border border-border/50 bg-background p-4"
      data-testid="config-panel-loaded"
    >
      <component
        :is="panelComponent"
        :config="config ?? definition?.configDefaults"
        :param-values="paramValues"
        :source-ref-options="sourceRefOptions"
        :fixture-data="fixtureData"
        :dataset-derivation-service="datasetDerivationService"
        @update:config="handleConfigUpdate"
        @update:param-values="handleParamValuesUpdate"
      />

      <!-- Invalid config diagnostic: shown when a ConfigPanel update fails schema validation.
           Does not obscure the panel itself — the user can continue editing to fix the issue. -->
      <div
        v-if="invalidConfigMessage"
        class="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
        role="alert"
        data-testid="config-panel-invalid-config"
      >
        <p class="text-[11px] text-destructive leading-relaxed">
          {{ invalidConfigMessage }}
        </p>
      </div>
    </div>
  </section>
</template>

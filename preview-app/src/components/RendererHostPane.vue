<script setup lang="ts">
// Module intent: fixture renderer host for the preview app detail pane.
// Loads the component renderer lazily via the package SDK definition loader (definition.renderer).
// Supplies configDefaults, fixtureData, and an isolated runtimeOutputs callback.
// Handles loading / error / non-renderable / idle states without crashing the app.
//
// Preview controls (theme / viewport / state-mode) are hosted here so the frame
// wrapper can react to them directly without lifting state to ComponentBrowserView.
//
// Subsystems live in dedicated composables and presentational children so this
// file stays focused on the renderer/fixture lifecycle and the preview-frame
// orchestration:
//   - useCapturedEvents + RendererCapturedEventsPanel — event buffer + panel UI
//   - useReplayDiagnostic + RendererReplayDiagnostic   — replay action + banner UI
//   - useBindingInputStubs + RendererBindingInputStubs — bind stub state + UI
//   - useParamResolution                                — resolver + diagnostics
//   - useRuntimeExecution                               — evaluate() lifecycle + outputs
//   - RendererPreviewFrame                              — frame chrome + state UI
//
// Non-renderable semantics: a component is non-renderable when its definition lacks a renderer
// module entirely. The `renderable` flag is NOT used to gate renderer loading — components like
// data.http-request and transform.javascript set renderable:false but still ship meaningful
// diagnostic Renderer.vue files that should display in the preview app.

import { computed, markRaw, onErrorCaptured, ref, shallowRef, toRef, watch } from "vue";
import type { Component } from "vue";

import { createThemeCssVariableMap, getBuiltInComponentTheme } from "@flow-builder/components/sdk";
import type {
  ComponentDefinition,
  ComponentThemeContext,
  ParamValuesState,
} from "@flow-builder/components/sdk";

import PreviewControlsBar from "./PreviewControlsBar.vue";
import type { PreviewTheme, DeviceMode, ViewportPreset, StateMode } from "./PreviewControlsBar.vue";
import RendererBindingInputStubs from "./RendererBindingInputStubs.vue";
import RendererCapturedEventsPanel from "./RendererCapturedEventsPanel.vue";
import RendererPreviewFrame from "./RendererPreviewFrame.vue";
import RendererReplayDiagnostic from "./RendererReplayDiagnostic.vue";
import { useCapturedEvents, type CapturedRendererEvent } from "../composables/useCapturedEvents";
import { useReplayDiagnostic } from "../composables/useReplayDiagnostic";
import { useBindingInputStubs } from "../composables/useBindingInputStubs";
import {
  resolveSelectedFixturePayload,
  useFixtureConfigPreset,
} from "../composables/useFixtureConfigPreset";
import { useParamResolution } from "../composables/useParamResolution";
import { useRuntimeExecution } from "../composables/useRuntimeExecution";
import { createPreviewDatasetDerivationService } from "../runtime/preview-dataset-derivation-service";

const props = defineProps<{
  /** The selected component definition, or undefined when nothing is selected. */
  definition: ComponentDefinition | undefined;
  /**
   * Controlled config to pass to the renderer.
   * Overrides definition.configDefaults when provided.
   * Supplied by ComponentBrowserView so the renderer stays in sync with ConfigPanel edits.
   */
  config?: Record<string, unknown>;
  /**
   * Controlled literal/bind state for params, shared with ConfigPanelHostPane.
   * When undefined, the host derives bind defaults from the definition and emits
   * them via `update:paramValues` so the parent can persist a single source of truth.
   */
  paramValues?: ParamValuesState;
}>();

const emit = defineEmits<{
  (e: "update:paramValues", value: ParamValuesState): void;
  (e: "update:latestCapturedEvent", value: CapturedRendererEvent | null): void;
}>();

// ── Renderer host state machine ────────────────────────────────────────────────

/** Discriminated state machine for the renderer host lifecycle. */
type HostState =
  | { status: "idle" }
  | { status: "non-renderable" }
  | { status: "loading" }
  | { status: "loaded" }
  | { status: "error"; message: string };

const hostState = ref<HostState>({ status: "idle" });

// shallowRef + markRaw: renderer Vue components must not be wrapped in Vue's reactive proxy.
// Per repo guidance, lazy-loaded renderer components use shallowRef to avoid cold-run warnings.
const rendererComponent = shallowRef<Component | null>(null);

const definitionRef = toRef(props, "definition");
const configRef = toRef(props, "config");
const paramValuesRef = toRef(props, "paramValues");

// ── Captured renderer events + replay diagnostic ──────────────────────────────
// State machines live in dedicated composables; this file forwards the latest
// captured event to the parent so cross-pane consumers (drift validation,
// preview controls) stay in sync without subscribing to internal buffers.

const {
  capturedEvents,
  emitRendererEvent,
  clearCapturedEvents,
  latestCapturedEvent,
  canReplayLastEvent,
  hasDeclaredEvents,
} = useCapturedEvents({
  definitionRef,
  onLatestChange: (latest) => emit("update:latestCapturedEvent", latest),
});

// Forward declaration: useRuntimeExecution owns runtimeOutputs and exposes
// mergeOutputs; replay projects through that merge so projected outputs
// land in the same surface the renderer reads.
let mergeRuntimeOutputs: (next: Record<string, unknown>) => void = () => undefined;

const { replayDiagnostic, runReplay, clearDiagnostic } = useReplayDiagnostic({
  definitionRef,
  latestCapturedEventRef: latestCapturedEvent,
  applyRuntimeOutputs: (next) => mergeRuntimeOutputs(next),
});

const showCapturedEventsPanel = computed(
  (): boolean =>
    hostState.value.status === "loaded" &&
    (hasDeclaredEvents.value || capturedEvents.value.length > 0),
);

// Monotonic token for stale-load detection.
// Incremented at the start of every watcher invocation — including idle and
// non-renderable early-return paths — so any previously in-flight async load
// is always invalidated before we inspect the new definition.
let loadToken = 0;

/**
 * Reload the renderer whenever the selected definition changes.
 * Immediate so the host reacts to the initial definition on mount.
 */
watch(
  () => props.definition,
  async (def) => {
    // Invalidate any in-flight renderer load immediately — including when the new
    // definition is undefined or lacks a renderer. Without this, a slow renderer
    // pending from a previous selection could resolve after we enter an early-return
    // path (idle / non-renderable) and then overwrite that state because the token
    // was never incremented before the early return.
    const token = ++loadToken;

    // Always reset: prevents stale component flash when navigating between components.
    // runtimeOutputs are reset by useRuntimeExecution on the same definition change.
    rendererComponent.value = null;

    if (!def) {
      hostState.value = { status: "idle" };
      return;
    }

    // Non-renderable: no renderer module present.
    // The `renderable` flag is intentionally NOT used here — components such as
    // data.http-request and transform.javascript declare renderable:false (meaning
    // they produce no visual placement in the builder canvas) but still provide a
    // meaningful diagnostic Renderer.vue for the preview app.
    if (!def.renderer) {
      hostState.value = { status: "non-renderable" };
      return;
    }

    hostState.value = { status: "loading" };
    // Token was captured at the top of the watcher before any early returns,
    // so in-flight loads from prior definitions are always discarded here.
    try {
      const resolved = await def.renderer();
      // Stale-load guard: a newer definition was selected while we were awaiting.
      if (token !== loadToken) return;
      // markRaw prevents Vue from making the component constructor reactive.
      rendererComponent.value = markRaw(resolved as Component);
      hostState.value = { status: "loaded" };
    } catch (err) {
      if (token !== loadToken) return;
      hostState.value = {
        status: "error",
        message: err instanceof Error ? err.message : "Renderer could not be loaded.",
      };
    }
  },
  { immediate: true },
);

// Error boundary: catch render-time errors inside the renderer subtree.
// Returns false to prevent further propagation but surfaces the message in diagnostics.
onErrorCaptured((err) => {
  const message = err instanceof Error ? err.message : "Renderer threw an error during render.";
  hostState.value = { status: "error", message };
  rendererComponent.value = null;
  return false;
});

// ── Fixture data state machine ─────────────────────────────────────────────────
// Fixture data is now resolved asynchronously through resolveFixtureData(), which
// invokes definition.loadFixtureData() and memoizes the result per-definition.
// We track its lifecycle independently from the renderer-load lifecycle so a slow
// or failing fixture loader produces a deterministic loading/error state in the host
// without blocking renderer module resolution.
//
// When a definition declares `fixtureVariants` + `loadFixtureVariants()`, an
// optional `selectedFixtureVariantId` overrides the default fixture payload
// (resolveFixtureData) with the variant entry. An empty / unknown id falls
// back to the default fixture so the picker never wedges authors in a broken
// variant.

type FixtureState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; value: unknown }
  | { status: "error"; message: string };

const fixtureState = ref<FixtureState>({ status: "idle" });

/**
 * Active fixture-variant id. Empty string = default fixture (loadFixtureData).
 * Reset whenever the selected definition changes so a variant id from a prior
 * component never bleeds into a freshly selected one.
 */
const selectedFixtureVariantId = ref<string>("");

// Monotonic token mirrors the renderer-load pattern: any in-flight fixture
// promise from a previous definition is invalidated when the selection changes,
// so a late resolution cannot overwrite the active state.
let fixtureToken = 0;

watch(
  [() => props.definition, selectedFixtureVariantId] as const,
  async ([def, variantId], previous) => {
    const token = ++fixtureToken;

    // Definition swap: reset the variant id so a stale selection from a prior
    // component never reads against the new definition's variant map.
    const previousDef = previous?.[0];
    if (previousDef !== def && variantId !== "") {
      selectedFixtureVariantId.value = "";
      return; // The reset above re-triggers this watcher with variantId = "".
    }

    if (!def) {
      fixtureState.value = { status: "idle" };
      return;
    }

    fixtureState.value = { status: "loading" };
    try {
      const value = await resolveSelectedFixturePayload(def, variantId);
      if (token !== fixtureToken) return;
      fixtureState.value = { status: "loaded", value };
    } catch (err) {
      if (token !== fixtureToken) return;
      const message = err instanceof Error ? err.message : "Fixture data could not be loaded.";
      fixtureState.value = { status: "error", message };
    }
  },
  { immediate: true },
);

// ── Param resolution + binding stub state ──────────────────────────────────────
// Renderers must receive resolved literal config only (per docs/component-system-improvements-v1.md
// §619-622). The package preview-app provides minimal input stubs so component authors can
// exercise bound-param resolution without standing up the host project shell.
//
// Bind state lives in the parent (ComponentBrowserView) so the ConfigPanel and the renderer
// share a single source of truth. When `paramValues` is undefined the host derives sensible
// defaults via useParamResolution and emits them upward so the parent can persist them.

const { inputStubs, bindableInputIds, inputStubParsing } = useBindingInputStubs({ definitionRef });

const previewConfigRef = useFixtureConfigPreset({
  definitionRef,
  configRef,
  selectedFixtureVariantIdRef: selectedFixtureVariantId,
  fixtureStateRef: fixtureState,
});

const {
  derivedDefaultParamValues,
  resolvedConfig,
  paramResolveIssues,
  stubParseErrors,
  schemaError,
  blockingError,
  hasParamDiagnostics,
} = useParamResolution({
  definitionRef,
  configRef: previewConfigRef,
  paramValuesRef,
  inputStubParsingRef: inputStubParsing,
});

// Initialize parent bind state with derived defaults whenever a definition is selected
// without controlled `paramValues`. Re-runs on definition or prop changes so navigating
// between components also seeds defaults for the freshly selected definition.
watch(
  [() => props.definition, () => props.paramValues],
  ([def, current]) => {
    if (def && current === undefined) {
      emit("update:paramValues", derivedDefaultParamValues.value);
    }
  },
  { immediate: true },
);

// ── Runtime execution state ────────────────────────────────────────────────────
// Components that ship a runtime() module (vmap1 dataset components, future
// data nodes, etc.) have evaluate() driven by useRuntimeExecution so renderer
// summaries reflect actual runtime state. The composable owns runtimeOutputs,
// the stale-token guard, and the schema-valid {state:"loading", startedAt}
// seed. Inputs flow through from useBindingInputStubs and configValid mirrors
// schema validity from useParamResolution so dataset runtimes can short-circuit
// safely instead of running side effects against unparseable config.

const configValid = computed(() => schemaError.value === null);
const inputValues = computed(() => inputStubParsing.value.values);

const { runtimeOutputs, mergeOutputs } = useRuntimeExecution({
  definitionRef,
  resolvedConfigRef: resolvedConfig,
  fixtureStateRef: fixtureState,
  inputValuesRef: inputValues,
  configValidRef: configValid,
});

// Wire forward-declared mergeRuntimeOutputs so useReplayDiagnostic can project
// captured events into the runtime-outputs surface owned by the composable.
mergeRuntimeOutputs = mergeOutputs;

// Renderer prop wiring keeps the existing `updateRuntimeOutputs` name so
// interactive renderers (for example demo.demo-button) continue to merge
// their internal state into the host-owned runtime-outputs surface.
const updateRuntimeOutputs = mergeOutputs;
const datasetDerivationService = createPreviewDatasetDerivationService();

// ── Preview controls state ─────────────────────────────────────────────────────

const previewTheme = ref<PreviewTheme>("system");
const deviceMode = ref<DeviceMode>("responsive");
const viewportPreset = ref<ViewportPreset>("desktop");
const stateMode = ref<StateMode>("default");

// ── Reset bind state + replay last event (Task 50.6) ──────────────────────────
// "Reset bind state" clears `paramValues` so the host falls back to fully literal
// config — the contract per docs/component-system-improvements-v1.md:1525 is to
// *clear* bind state, not to re-seed derived defaults. The button stays gated on
// the presence of bindable params, since clearing without any bindable surface is
// a no-op the user can't observe.
//
// "Replay last event" projects the *actual* most recent valid captured event
// through the definition's `eventOutputs` bindings into runtimeOutputs. Replay
// eligibility tracks the latest entry — not a stale valid emit shadowed by a
// later invalid/undeclared one — so the projected outputs always match what the
// renderer most recently asserted.

const canResetBindState = computed(
  (): boolean => Object.keys(derivedDefaultParamValues.value).length > 0,
);

function handleResetBindState(): void {
  if (!canResetBindState.value) return;
  // Emit a fresh empty state so the parent's `currentParamValues` becomes {} —
  // bindable params then fall back to configDefaults via the resolver.
  emit("update:paramValues", {});
  clearDiagnostic();
}

function handleReplayLastEvent(): void {
  if (!canReplayLastEvent.value) return;
  runReplay();
}

/**
 * Detect OS dark mode preference.
 * Guarded for jsdom safety: matchMedia is absent in the test environment.
 */
function getSystemDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** True when the preview frame should use the dark CSS variable set. */
const isDark = computed((): boolean => {
  if (previewTheme.value === "dark") return true;
  if (previewTheme.value === "light") return false;
  return getSystemDark();
});

/**
 * Tailwind max-width class for the preview frame.
 * String literals appear here so the Tailwind scanner can include them.
 */
function viewportClass(vp: ViewportPreset): string {
  if (vp === "mobile") return "max-w-sm";
  if (vp === "tablet") return "max-w-3xl";
  return "w-full";
}

/**
 * Additional Tailwind classes for the device context.
 * Phone/tablet add a ring to visually simulate a device shell.
 * String literals appear here so the Tailwind scanner can include them.
 */
function deviceClasses(device: DeviceMode): string[] {
  // ring-1 ring-border rounded-xl  (phone)
  // ring-1 ring-border rounded-lg  (tablet)
  if (device === "phone") return ["ring-1", "ring-border", "rounded-xl"];
  if (device === "tablet") return ["ring-1", "ring-border", "rounded-lg"];
  return [];
}

// ── Default component-theme context for the renderer harness ─────────────────
// Renderers may opt into reading theme roles via the `themeContext` prop. The
// preview harness supplies a frozen default context derived from the built-in
// `default` theme so authors can preview against canonical role values without
// standing up the host inheritance resolver. The matching CSS-variable map is
// applied to the renderer-loaded wrapper through the package-local managed
// style bridge (scoped `data-ct-scope` + managed head style element) instead
// of an inline style mutation, mirroring the host scoped-bridge contract.
const PREVIEW_THEME_SCOPE_ID = "package-preview-renderer";
const defaultBuiltInTheme = getBuiltInComponentTheme("default");
const previewThemeContext: ComponentThemeContext | undefined = defaultBuiltInTheme
  ? Object.freeze({
      themeId: defaultBuiltInTheme.id,
      properties: defaultBuiltInTheme.properties,
    })
  : undefined;
const previewThemeContextStyle = previewThemeContext
  ? Object.freeze({
      scopeId: PREVIEW_THEME_SCOPE_ID,
      cssVariables: createThemeCssVariableMap(previewThemeContext),
    })
  : undefined;

/** Classes applied to the preview frame wrapper: .dark context + viewport + device ring. */
const previewFrameClass = computed((): string[] => {
  const classes: string[] = [
    viewportClass(viewportPreset.value),
    ...deviceClasses(deviceMode.value),
  ];
  // "dark" string literal required here for Tailwind scanner.
  if (isDark.value) classes.push("dark");
  return classes;
});

/** True when the state-preview banner should be visible. */
const showStateBanner = computed(() => stateMode.value !== "default");

/**
 * Human-readable label for the active state preview mode.
 * Loading and error labels say "Simulated …" so component authors understand
 * these are host-driven simulations, not real component loading/error logic.
 */
const stateBannerLabel = computed((): string => {
  const labels: Record<StateMode, string> = {
    default: "",
    empty: "Empty fixture state",
    loading: "Simulated loading state",
    error: "Simulated error state",
    disabled: "Disabled interaction state",
  };
  return labels[stateMode.value];
});

/**
 * Fixture data passed to the renderer.
 * Returns null when stateMode is "empty" to simulate a no-data state.
 * Otherwise sources from the asynchronously resolved fixture state — the renderer
 * is only rendered when fixtureState.status === "loaded", so this should always
 * carry the resolved value in that branch.
 */
const effectiveFixtureData = computed(() => {
  if (stateMode.value === "empty") return null;
  return fixtureState.value.status === "loaded" ? fixtureState.value.value : undefined;
});

/**
 * Classes for the renderer content wrapper div.
 * "pointer-events-none opacity-60" string literal required for Tailwind scanner.
 */
const rendererContentClass = computed((): string =>
  stateMode.value === "disabled" ? "pointer-events-none opacity-60" : "",
);
</script>

<template>
  <!--
    Renderer host section. Shown in the detail pane when a component is selected.
    Idle state renders nothing (host is invisible until a component is chosen).
  -->
  <section
    v-if="hostState.status !== 'idle'"
    class="mb-8"
    aria-label="Component preview"
    data-testid="renderer-host-pane"
  >
    <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
      Preview
    </h3>

    <!-- Preview controls: theme / device / viewport / state toggles + bind/event actions -->
    <PreviewControlsBar
      :theme="previewTheme"
      :device="deviceMode"
      :viewport="viewportPreset"
      :state-mode="stateMode"
      :can-reset="canResetBindState"
      :can-replay="canReplayLastEvent"
      :fixture-variants="props.definition?.fixtureVariants"
      :fixture-variant-id="selectedFixtureVariantId"
      :state-support="props.definition?.stateSupport"
      @update:theme="previewTheme = $event"
      @update:device="deviceMode = $event"
      @update:viewport="viewportPreset = $event"
      @update:state-mode="stateMode = $event"
      @update:fixture-variant-id="selectedFixtureVariantId = $event"
      @reset-param-values="handleResetBindState"
      @replay-last-event="handleReplayLastEvent"
    />

    <!--
      Replay diagnostic banner: stays visible until the next replay or definition
      change so authors have time to read it on slow renderers. Tone-coded styling
      and the projected-output list are owned by the child component; this host
      only decides when to mount it.
    -->
    <RendererReplayDiagnostic v-if="replayDiagnostic" :diagnostic="replayDiagnostic" />

    <!--
      Binding input stubs (visible when the selected component declares bindable
      params with at least one compatible input source). The textarea state and
      JSON-vs-raw-text classification live in useBindingInputStubs; the resolver
      and diagnostic surfaces in useParamResolution.
    -->
    <RendererBindingInputStubs
      v-if="bindableInputIds.length > 0 || hasParamDiagnostics"
      :bindable-input-ids="bindableInputIds"
      :stubs="inputStubs"
      :param-resolve-issues="paramResolveIssues"
      :stub-parse-errors="stubParseErrors"
      :schema-error="schemaError"
      :blocking-error="blockingError"
      :has-param-diagnostics="hasParamDiagnostics"
    />

    <!--
      Preview frame.
      Hosts the device/viewport/state-mode chrome + the renderer/fixture state
      machine branches. Adding "dark" to the frame class list scopes the dark
      CSS variable block (tailwind.css:155) to this subtree only; viewport
      classes constrain its width to simulate device breakpoints.
    -->
    <RendererPreviewFrame
      :host-status="blockingError ? 'error' : hostState.status"
      :host-error-message="
        blockingError ?? (hostState.status === 'error' ? hostState.message : undefined)
      "
      :fixture-status="fixtureState.status"
      :fixture-error-message="fixtureState.status === 'error' ? fixtureState.message : undefined"
      :state-mode="stateMode"
      :state-banner-label="stateBannerLabel"
      :show-state-banner="showStateBanner"
      :frame-class="previewFrameClass"
      :device="deviceMode"
      :renderer-content-class="rendererContentClass"
      :renderer-component="rendererComponent"
      :resolved-config="resolvedConfig"
      :effective-fixture-data="effectiveFixtureData"
      :runtime-outputs="runtimeOutputs"
      :update-runtime-outputs="updateRuntimeOutputs"
      :emit-event="emitRendererEvent"
      :theme-context="previewThemeContext"
      :dataset-derivation-service="datasetDerivationService"
      :theme-context-style="previewThemeContextStyle"
    />

    <!--
      Captured events panel.
      Appears once a component is loaded and either declares events or has produced
      any emitted events (so undeclared emits from non-event components stay visible).
      The host never throws on bad emits — all surfacing happens through the panel
      so authors can iterate on renderer code without crashing the preview.
    -->
    <RendererCapturedEventsPanel
      v-if="showCapturedEventsPanel"
      :events="capturedEvents"
      @clear="clearCapturedEvents"
    />
  </section>
</template>

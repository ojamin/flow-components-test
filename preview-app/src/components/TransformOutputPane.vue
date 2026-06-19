<script setup lang="ts">
// Module intent: loads a component's transform() module lazily, resolves the
// definition's fixture data via the async SDK helper, builds synthetic
// fixture-derived inputs, executes the transform, and displays the raw JSON
// output. Covers missing / loading / ready / error states without crashing the
// preview app — including failures from the fixture loader, which are surfaced
// in the same error pane (resolveFixtureData wraps the rejection with the
// component id).
//
// Passthrough mode: definitions whose transform reference is the SDK
// createPassthroughTransform helper are synthesized in-place — the pane calls
// the helper directly to materialize the canonical passthrough module instead
// of routing through the definition's lazy import. This keeps passthrough
// components working when the dev-component scaffold omits a transform.ts file
// and points the manifest at the shared SDK helper.
//
// Synthetic inputs: maps the first input port to the resolved fixture data.
// Returns {} when the component declares no inputs, which is safe for transforms
// that produce output from config alone; the resolved fixture data is still
// passed through to the transform context regardless.
//
// Stale-load protection: a monotonic loadToken is incremented at the top of every
// watcher invocation so in-flight loads from prior definitions never overwrite a
// newer state.

import { ref, watch } from "vue";
import {
  createPassthroughTransform,
  resolveFixtureData,
  resolveParamValues,
} from "@flow-builder/components/sdk";
import type { ComponentDefinition, ParamValuesState } from "@flow-builder/components/sdk";

const props = defineProps<{
  /** The selected component definition, or undefined when nothing is selected. */
  definition: ComponentDefinition | undefined;
  /** Current controlled config passed to the transform. Falls back to definition.configDefaults. */
  config?: Record<string, unknown>;
  /** Shared literal/bind param state from the preview app config/renderer loop. */
  paramValues?: ParamValuesState;
}>();

type TransformMode = "transform" | "passthrough";

type TransformState =
  | { status: "idle" }
  | { status: "missing" }
  | { status: "loading" }
  | { status: "ready"; mode: TransformMode; output: unknown }
  | { status: "error"; message: string };

const transformState = ref<TransformState>({ status: "idle" });
const copiedOutput = ref(false);

// Monotonic token for stale-load detection.
let loadToken = 0;

/**
 * Build synthetic inputs by mapping the first input port to the resolved fixture
 * data. Returns {} when the component declares no inputs, which is safe for
 * transforms that produce output from config alone.
 */
function buildSyntheticInputs(
  def: ComponentDefinition,
  fixtureData: unknown,
): Record<string, unknown> {
  const firstInput = def.inputs[0];
  if (!firstInput) return {};
  return { [firstInput.id]: fixtureData };
}

function formatOutput(output: unknown): string {
  try {
    return JSON.stringify(output, null, 2);
  } catch {
    return String(output);
  }
}

function resolveTransformConfig(
  def: ComponentDefinition,
  config: Record<string, unknown> | undefined,
  paramValues: ParamValuesState | undefined,
  inputs: Record<string, unknown>,
): Record<string, unknown> {
  if (!def.params) {
    throw new Error(
      "Component definition is missing params; package preview cannot resolve transform config from params-only state.",
    );
  }

  const defaults = { ...(def.configDefaults as Record<string, unknown>), ...config };
  const resolution = resolveParamValues({
    params: def.params,
    state: paramValues,
    inputValues: inputs,
    inputPorts: def.inputs,
    defaults,
  });
  const parsed = def.configSchema.safeParse(resolution.values);
  if (!parsed.success) {
    throw new Error("Resolved transform config failed schema validation; transform was not run.");
  }
  return parsed.data as Record<string, unknown>;
}

function copyOutput(): void {
  if (transformState.value.status !== "ready") return;
  // Guard: navigator.clipboard is unavailable on insecure / file: origins.
  if (!navigator.clipboard) return;
  const text = formatOutput(transformState.value.output);
  // Set the copied flag only on success; silently ignore rejected writes.
  navigator.clipboard
    .writeText(text)
    .then(() => {
      copiedOutput.value = true;
      setTimeout(() => {
        copiedOutput.value = false;
      }, 1500);
    })
    .catch(() => {});
}

// Watch definition, config, and paramValues so the transform re-runs when the
// shared params-only preview state changes.
// transform() is a lazy import() and is cached by the browser; resolveFixtureData
// is memoized by definition object identity so re-runs on config change reuse the
// cached fixture promise without reloading.
watch(
  [() => props.definition, () => props.config, () => props.paramValues] as const,
  async ([def, config, paramValues]) => {
    const token = ++loadToken;
    copiedOutput.value = false;

    if (!def) {
      transformState.value = { status: "idle" };
      return;
    }

    if (!def.transform) {
      transformState.value = { status: "missing" };
      return;
    }

    if (!def.params) {
      transformState.value = {
        status: "error",
        message:
          "Component definition is missing params; package preview cannot resolve transform config from params-only state.",
      };
      return;
    }

    transformState.value = { status: "loading" };

    // Passthrough components point at the SDK helper directly; synthesize the
    // module via the helper rather than routing through the definition's lazy
    // import. Functionally equivalent today (def.transform === the helper),
    // but the explicit branch documents intent and stays correct if the
    // contract evolves to leave def.transform absent for passthrough manifests.
    const isPassthrough = def.transform === createPassthroughTransform;
    const mode: TransformMode = isPassthrough ? "passthrough" : "transform";

    try {
      // Resolve the transform module and fixture data in parallel. Either
      // rejection lands in the catch below as a single error message; the
      // fixture loader's failures are already wrapped with the component id
      // by resolveFixtureData.
      const modulePromise = isPassthrough ? createPassthroughTransform() : def.transform();
      const [mod, fixtureData] = await Promise.all([modulePromise, resolveFixtureData(def)]);
      if (token !== loadToken) return;

      // Minimal duck-type: both TransformModule and StaticComponentTransformModule expose
      // { transform(ctx) }. Extra context keys (e.g. fixtureData) are ignored by modules
      // that only declare TransformContext<config, inputs>.
      const transformFn = (mod as { transform: (ctx: Record<string, unknown>) => unknown })
        .transform;
      if (typeof transformFn !== "function") {
        throw new TypeError("Transform module does not export a transform function.");
      }

      const inputs = buildSyntheticInputs(def, fixtureData);
      const resolvedConfig = resolveTransformConfig(def, config, paramValues, inputs);
      const result = await Promise.resolve(
        transformFn({ config: resolvedConfig, inputs, fixtureData }),
      );
      if (token !== loadToken) return;

      transformState.value = { status: "ready", mode, output: result };
    } catch (err) {
      if (token !== loadToken) return;
      transformState.value = {
        status: "error",
        message: err instanceof Error ? err.message : "Transform execution failed.",
      };
    }
  },
  { immediate: true },
);
</script>

<template>
  <section
    v-if="transformState.status !== 'idle'"
    class="mb-6"
    aria-label="Transform output"
    data-testid="transform-output-pane"
  >
    <div class="flex items-center gap-2 mb-2">
      <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Transform output
      </h3>
      <span
        v-if="transformState.status === 'ready' && transformState.mode === 'passthrough'"
        class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wide"
        data-testid="transform-passthrough-badge"
        title="Synthesized via createPassthroughTransform SDK helper"
      >
        Passthrough
      </span>
    </div>

    <!-- Missing: component has no transform module -->
    <p
      v-if="transformState.status === 'missing'"
      class="text-xs text-muted-foreground italic"
      data-testid="transform-missing"
    >
      No transform module.
    </p>

    <!-- Loading: transform module and fixture data are resolving, or transform is executing -->
    <div
      v-else-if="transformState.status === 'loading'"
      class="flex items-center gap-2 py-3"
      role="status"
      aria-label="Running transform"
      data-testid="transform-loading"
    >
      <span
        class="w-4 h-4 rounded-full border-2 border-border border-t-primary animate-spin"
        aria-hidden="true"
      />
      <span class="text-xs text-muted-foreground">Running transform…</span>
    </div>

    <!-- Error: module load, fixture load, or transform execution failed -->
    <div
      v-else-if="transformState.status === 'error'"
      class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
      role="alert"
      data-testid="transform-error"
    >
      <p class="text-xs font-semibold text-destructive mb-0.5">Transform failed</p>
      <p class="text-[11px] text-muted-foreground font-code break-all leading-relaxed">
        {{ transformState.message }}
      </p>
    </div>

    <!-- Ready: transform executed, show JSON output with copy affordance -->
    <div
      v-else-if="transformState.status === 'ready'"
      class="relative"
      data-testid="transform-ready"
    >
      <button
        type="button"
        :aria-label="copiedOutput ? 'Copied' : 'Copy transform output'"
        class="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @click="copyOutput"
      >
        {{ copiedOutput ? "Copied" : "Copy" }}
      </button>
      <pre
        class="text-[11px] font-code text-foreground bg-muted/30 rounded-md p-3 pr-12 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed"
        data-testid="transform-output-json"
        >{{ formatOutput(transformState.output) }}</pre
      >
    </div>
  </section>
</template>

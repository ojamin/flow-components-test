// Module intent: runtime evaluation lifecycle for the preview-app renderer host.
// Owns the runtime-outputs ref the renderer reads, drives evaluate() on
// (definition, resolvedConfig, fixtureState, inputs, configValid) changes,
// and surfaces a deterministic loading/ready/error status compatible with
// vmap1's `VMapDatasetStatus` schema (loading carries `startedAt`).
//
// Stale-token guard mirrors the renderer-load and fixture-load patterns:
// a slow evaluate() or runtime() module load from a previous selection can
// never overwrite outputs the user is currently looking at.
//
// Loading seeding policy:
//   - Skip seeding entirely while fixtureState is still "loading" so a
//     transient/orphan loading status never appears before the runtime
//     actually starts.
//   - Skip when no `runtime()` module is declared; outputs reset to {} so
//     the renderer falls back to its descriptor-derived view.
//   - When configValid is false the host still calls evaluate so runtimes
//     that opt into the contract (e.g. vmap1 datasets) can short-circuit
//     to a deterministic idle/error payload of their own choosing instead
//     of running side effects against unparseable config.

import { ref, watch, type ComputedRef, type Ref } from "vue";

import type { ComponentDefinition } from "@flow-builder/components/sdk";

export type RuntimeFixtureSnapshot =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; value: unknown }
  | { status: "error"; message: string };

export interface UseRuntimeExecutionOptions {
  definitionRef: Ref<ComponentDefinition | undefined>;
  resolvedConfigRef: ComputedRef<Record<string, unknown>>;
  fixtureStateRef: Ref<RuntimeFixtureSnapshot>;
  inputValuesRef: ComputedRef<Record<string, unknown>>;
  configValidRef: ComputedRef<boolean>;
  /** Test/clock seam — defaults to a fresh ISO timestamp on every call. */
  now?: () => string;
}

export interface UseRuntimeExecutionResult {
  runtimeOutputs: Ref<Record<string, unknown>>;
  mergeOutputs: (next: Record<string, unknown>) => void;
  resetOutputs: () => void;
}

export function useRuntimeExecution(
  options: UseRuntimeExecutionOptions,
): UseRuntimeExecutionResult {
  const {
    definitionRef,
    resolvedConfigRef,
    fixtureStateRef,
    inputValuesRef,
    configValidRef,
    now = () => new Date().toISOString(),
  } = options;

  const runtimeOutputs = ref<Record<string, unknown>>({});
  let runtimeToken = 0;

  function mergeOutputs(next: Record<string, unknown>): void {
    runtimeOutputs.value = { ...runtimeOutputs.value, ...next };
  }

  function resetOutputs(): void {
    runtimeOutputs.value = {};
  }

  watch(
    [
      definitionRef,
      resolvedConfigRef,
      () => fixtureStateRef.value.status,
      inputValuesRef,
      configValidRef,
    ] as const,
    async ([def, configValue, fixtureStatus, inputValues, configValid]) => {
      const token = ++runtimeToken;

      // No runtime module → nothing to evaluate. Reset to {} so renderers fall
      // back to their descriptor-derived view rather than reading stale outputs
      // from a prior selection.
      if (!def || !def.runtime) {
        runtimeOutputs.value = {};
        return;
      }

      // Hold off until fixture-data lifecycle has settled. Without this guard
      // we'd seed a "loading" status before evaluate() actually starts and the
      // host could end up parked in that orphan state if no later watcher
      // dependency changes once the fixture finishes.
      if (fixtureStatus === "loading") return;

      // Seed loading with an ISO `startedAt`. vmap1's VMapDatasetStatus schema
      // requires startedAt on the loading variant, so omitting it would surface
      // as a schema violation through any runtime status validator and break
      // dataset renderers that re-check the field.
      runtimeOutputs.value = {
        status: { state: "loading", startedAt: now() },
      };

      let runtimeModule: unknown;
      try {
        runtimeModule = await def.runtime();
      } catch (err) {
        if (token !== runtimeToken) return;
        const message = err instanceof Error ? err.message : "Runtime module failed to load.";
        runtimeOutputs.value = { status: { state: "error", message } };
        return;
      }
      if (token !== runtimeToken) return;

      const evaluate = (runtimeModule as { evaluate?: unknown }).evaluate;
      if (typeof evaluate !== "function") {
        runtimeOutputs.value = {
          status: {
            state: "error",
            message: "Runtime module does not export an evaluate function.",
          },
        };
        return;
      }

      const fixtureData =
        fixtureStateRef.value.status === "loaded" ? fixtureStateRef.value.value : undefined;

      try {
        const result = await Promise.resolve(
          (evaluate as (ctx: Record<string, unknown>) => unknown)({
            config: configValue,
            inputs: inputValues,
            fixtureData,
            configValid,
            instanceId: `preview::${def.id}`,
          }),
        );
        if (token !== runtimeToken) return;
        const outputs = (result as { outputs?: Record<string, unknown> } | null | undefined)
          ?.outputs;
        if (outputs && typeof outputs === "object") {
          runtimeOutputs.value = { ...outputs };
        } else {
          runtimeOutputs.value = {};
        }
      } catch (err) {
        if (token !== runtimeToken) return;
        const message = err instanceof Error ? err.message : "Runtime evaluation failed.";
        runtimeOutputs.value = { status: { state: "error", message } };
      }
    },
    { immediate: true },
  );

  return {
    runtimeOutputs,
    mergeOutputs,
    resetOutputs,
  };
}

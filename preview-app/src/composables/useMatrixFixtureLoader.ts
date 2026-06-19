// Module intent: shared fixture-data lifecycle for the matrix route. Loads
// the resolved fixture payload (or the named variant when selected) once per
// definition × variant pair and reuses it across all matrix cells. The
// stale-token pattern keeps fixture transitions safe under rapid switches.

import { ref, watch } from "vue";
import type { Ref } from "vue";

import type { ComponentDefinition } from "@flow-builder/components/sdk";

import { resolveSelectedFixturePayload } from "./useFixtureConfigPreset";

export type MatrixFixtureState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; value: unknown }
  | { status: "error"; message: string };

export async function resolveMatrixFixturePayload(
  def: ComponentDefinition,
  variantId: string,
): Promise<unknown> {
  return resolveSelectedFixturePayload(def, variantId);
}

export interface MatrixFixtureLoader {
  fixtureState: Ref<MatrixFixtureState>;
}

export function useMatrixFixtureLoader(
  selectedDefinition: Ref<ComponentDefinition | undefined>,
  selectedVariantId: Ref<string>,
): MatrixFixtureLoader {
  const fixtureState = ref<MatrixFixtureState>({ status: "idle" });

  let fixtureToken = 0;

  watch(
    [selectedDefinition, selectedVariantId] as const,
    async ([def, variantId]) => {
      const token = ++fixtureToken;
      if (!def) {
        fixtureState.value = { status: "idle" };
        return;
      }
      fixtureState.value = { status: "loading" };
      try {
        const value = await resolveMatrixFixturePayload(def, variantId);
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

  return { fixtureState };
}

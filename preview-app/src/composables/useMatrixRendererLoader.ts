// Module intent: shared renderer-lifecycle state for the matrix route. One
// renderer instance is loaded per selected definition and reused across every
// matrix cell. The stale-token pattern mirrors RendererHostPane so a slow
// renderer import never overwrites a freshly selected component.

import { markRaw, ref, shallowRef, watch } from "vue";
import type { Component, Ref, ShallowRef } from "vue";

import type { ComponentDefinition } from "@flow-builder/components/sdk";

export type MatrixRendererState =
  | { status: "idle" }
  | { status: "non-renderable" }
  | { status: "loading" }
  | { status: "loaded" }
  | { status: "error"; message: string };

export interface MatrixRendererLoader {
  rendererState: Ref<MatrixRendererState>;
  rendererComponent: ShallowRef<Component | null>;
}

export function useMatrixRendererLoader(
  selectedDefinition: Ref<ComponentDefinition | undefined>,
): MatrixRendererLoader {
  const rendererState = ref<MatrixRendererState>({ status: "idle" });
  const rendererComponent = shallowRef<Component | null>(null);

  let rendererToken = 0;

  watch(
    selectedDefinition,
    async (def) => {
      const token = ++rendererToken;
      rendererComponent.value = null;
      if (!def) {
        rendererState.value = { status: "idle" };
        return;
      }
      if (!def.renderer) {
        rendererState.value = { status: "non-renderable" };
        return;
      }
      rendererState.value = { status: "loading" };
      try {
        const resolved = await def.renderer();
        if (token !== rendererToken) return;
        rendererComponent.value = markRaw(resolved as Component);
        rendererState.value = { status: "loaded" };
      } catch (err) {
        if (token !== rendererToken) return;
        rendererState.value = {
          status: "error",
          message: err instanceof Error ? err.message : "Renderer could not be loaded.",
        };
      }
    },
    { immediate: true },
  );

  return { rendererState, rendererComponent };
}

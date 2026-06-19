// Module intent: shared route-query state for the /matrix route. Component,
// variant, and viewport are read from `?component=…&variant=…&viewport=…` so
// the URL is the single source of truth — refresh-safe and Playwright-
// deterministic. Centralizing this here keeps the route view focused on
// composition rather than vue-router glue.

import { computed, type ComputedRef } from "vue";
import { useRoute, useRouter, type LocationQueryRaw } from "vue-router";

export type Viewport = "desktop" | "tablet" | "mobile";

export const VIEWPORTS = ["desktop", "tablet", "mobile"] as const satisfies readonly Viewport[];

/** Coerce a raw query value to a single string (vue-router can produce arrays). */
function singleString(raw: unknown): string {
  if (Array.isArray(raw)) return raw[0] ?? "";
  return raw == null ? "" : String(raw);
}

export interface MatrixQueryState {
  selectedComponentId: ComputedRef<string>;
  selectedVariantId: ComputedRef<string>;
  viewport: ComputedRef<Viewport>;
  updateQuery(patch: Record<string, string>): void;
}

export function useMatrixQueryState(): MatrixQueryState {
  const route = useRoute();
  const router = useRouter();

  const selectedComponentId = computed((): string => singleString(route.query.component));
  const selectedVariantId = computed((): string => singleString(route.query.variant));
  const viewport = computed((): Viewport => {
    const raw = singleString(route.query.viewport);
    return (VIEWPORTS as readonly string[]).includes(raw) ? (raw as Viewport) : "desktop";
  });

  // Replace query parameters while keeping the existing route stable. Empty
  // values are stripped so the URL never carries `?variant=` placeholders.
  function updateQuery(patch: Record<string, string>): void {
    const next: LocationQueryRaw = { ...route.query };
    for (const [key, value] of Object.entries(patch)) {
      if (value === "" || value == null) delete next[key];
      else next[key] = value;
    }
    void router.replace({ path: route.path, query: next });
  }

  return { selectedComponentId, selectedVariantId, viewport, updateQuery };
}

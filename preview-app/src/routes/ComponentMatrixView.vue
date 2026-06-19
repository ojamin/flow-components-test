<script setup lang="ts">
// Module intent: state × theme matrix route. Renders the selected component
// across five state rows (Default, Empty, Loading, Error, Disabled) and two
// theme columns (Light, Dark) so contributors can audit coverage and design
// polish in one screen. Component, variant, and viewport are read from the
// route query (`?component=...&variant=...&viewport=...`) so the URL is the
// single source of truth — refresh-safe and Playwright-deterministic.
//
// Compared to ComponentBrowserView, this route deliberately stays minimal:
// no bind-state editing, no config panel, no event capture. The renderer and
// fixture payload are resolved once and reused across all ten cells via
// dedicated composables; the per-cell `MatrixCell` component is presentational
// and never re-fetches. Header chrome lives in `MatrixHeader.vue`.

import { computed, ref, watch } from "vue";

import { Badge } from "@flow-builder/components/component-ui";
import type {
  ComponentDefinition,
  FixtureVariantMeta,
  StateApplicability,
  StateSupportMeta,
} from "@flow-builder/components/sdk";

import {
  loadCatalogResult,
  loadEnrichedEntry,
  type CatalogGroupWithSections,
  type CatalogLoadResult,
} from "../catalog-loader";
import MatrixCell from "../components/MatrixCell.vue";
import type { MatrixCellState, MatrixCellTheme } from "../components/MatrixCell.vue";
import MatrixHeader, {
  DEFAULT_VARIANT_SENTINEL,
  type MatrixPickerGroupOption,
} from "../components/MatrixHeader.vue";

import { useMatrixQueryState, type Viewport } from "../composables/useMatrixQueryState";
import { useMatrixRendererLoader } from "../composables/useMatrixRendererLoader";
import { useMatrixFixtureLoader } from "../composables/useMatrixFixtureLoader";
import { useMatrixThemeContexts } from "../composables/useMatrixThemeContexts";
import { resolveSelectedConfigPresetPayload } from "../composables/useFixtureConfigPreset";

// ── Route query state ─────────────────────────────────────────────────────────

const { selectedComponentId, selectedVariantId, viewport, updateQuery } = useMatrixQueryState();

/** Coerce a raw select payload to a single string (Select can emit unknown). */
function singleString(raw: unknown): string {
  if (Array.isArray(raw)) return raw[0] ?? "";
  return raw == null ? "" : String(raw);
}

// ── Catalog data ──────────────────────────────────────────────────────────────

const catalogResult = computed((): CatalogLoadResult => loadCatalogResult());
const groups = computed((): CatalogGroupWithSections[] =>
  catalogResult.value.status === "ready" ? catalogResult.value.groups : [],
);

const selectedEntry = computed(() =>
  selectedComponentId.value ? loadEnrichedEntry(selectedComponentId.value) : undefined,
);
const selectedDefinition = computed(
  (): ComponentDefinition | undefined => selectedEntry.value?.definition,
);

const fixtureVariants = computed(
  (): readonly FixtureVariantMeta[] => selectedDefinition.value?.fixtureVariants ?? [],
);
const stateSupport = computed(
  (): StateSupportMeta | undefined => selectedDefinition.value?.stateSupport,
);

// ── Renderer + fixture lifecycles ─────────────────────────────────────────────

const { rendererState, rendererComponent } = useMatrixRendererLoader(selectedDefinition);
const { fixtureState } = useMatrixFixtureLoader(selectedDefinition, selectedVariantId);

// ── Theme contexts ────────────────────────────────────────────────────────────

const { themeContextFor, cellThemeBridge } = useMatrixThemeContexts();

// ── Resolved config ───────────────────────────────────────────────────────────
// Literal `configDefaults` plus explicit config-scoped fixture variants only —
// bind-state authoring lives in the single-component browser route; the matrix
// is a read-only coverage view.

const configVariantPreset = ref<Record<string, unknown> | undefined>();
let configPresetToken = 0;

watch(
  [selectedDefinition, selectedVariantId] as const,
  async ([definition, variantId]) => {
    const token = ++configPresetToken;
    configVariantPreset.value = undefined;
    if (!definition || !variantId) return;

    try {
      const preset = await resolveSelectedConfigPresetPayload(definition, variantId);
      if (token !== configPresetToken) return;
      configVariantPreset.value = preset;
    } catch {
      if (token !== configPresetToken) return;
      configVariantPreset.value = undefined;
    }
  },
  { immediate: true },
);

const configDefaults = computed((): Record<string, unknown> => {
  const defaults = selectedDefinition.value?.configDefaults;
  return defaults && typeof defaults === "object" ? (defaults as Record<string, unknown>) : {};
});

const resolvedConfig = computed((): Record<string, unknown> => {
  const definition = selectedDefinition.value;
  const mergedConfig = { ...configDefaults.value, ...configVariantPreset.value };
  if (!definition || !configVariantPreset.value) return mergedConfig;

  const parsed = definition.configSchema.safeParse(mergedConfig);
  return parsed.success ? (parsed.data as Record<string, unknown>) : configDefaults.value;
});

// ── State applicability lookup ────────────────────────────────────────────────

const STATE_KEY_BY_MODE = {
  empty: "empty",
  loading: "loading",
  error: "error",
  disabled: "disabled",
} as const satisfies Record<Exclude<MatrixCellState, "default">, keyof StateSupportMeta>;

const STATES = [
  "default",
  "empty",
  "loading",
  "error",
  "disabled",
] as const satisfies readonly MatrixCellState[];
const THEMES = ["light", "dark"] as const satisfies readonly MatrixCellTheme[];

function applicabilityFor(state: MatrixCellState): StateApplicability | undefined {
  if (state === "default") return true;
  if (!stateSupport.value) return undefined;
  const key = STATE_KEY_BY_MODE[state];
  return stateSupport.value[key];
}

// ── Viewport class ────────────────────────────────────────────────────────────
// Mirrors RendererHostPane's viewport mapping so the matrix grid simulates the
// same widths as the single-component preview frame.

function viewportClass(vp: Viewport): string {
  if (vp === "mobile") return "max-w-sm";
  if (vp === "tablet") return "max-w-3xl";
  return "w-full";
}

// ── Component picker options ──────────────────────────────────────────────────
// Flatten the catalog into the select payload expected by MatrixHeader.

const pickerOptions = computed((): MatrixPickerGroupOption[] =>
  groups.value.map((group) => ({
    groupId: group.id,
    groupLabel: group.label,
    components: group.sections.flatMap((section) =>
      section.components.map((entry) => ({ id: entry.id, title: entry.title })),
    ),
  })),
);

const totalCatalogComponents = computed((): number =>
  pickerOptions.value.reduce((sum, g) => sum + g.components.length, 0),
);

const variantSelectValue = computed((): string =>
  selectedVariantId.value ? selectedVariantId.value : DEFAULT_VARIANT_SENTINEL,
);

// ── Handlers ──────────────────────────────────────────────────────────────────

function handleComponentChange(next: unknown): void {
  const id = singleString(next);
  // Variant id is component-scoped — clear it whenever the component changes.
  updateQuery({ component: id, variant: "" });
}

function handleVariantChange(next: unknown): void {
  const id = singleString(next);
  updateQuery({ variant: id === DEFAULT_VARIANT_SENTINEL ? "" : id });
}

function handleViewportChange(next: Viewport): void {
  updateQuery({ viewport: next });
}

// ── Derived render guards ─────────────────────────────────────────────────────

const showMatrix = computed(
  (): boolean =>
    !!selectedDefinition.value &&
    rendererState.value.status !== "idle" &&
    rendererState.value.status !== "error",
);

const fixtureReadyValue = computed((): unknown =>
  fixtureState.value.status === "loaded" ? fixtureState.value.value : undefined,
);

const fixtureBlocking = computed(
  (): boolean => fixtureState.value.status === "loading" || fixtureState.value.status === "error",
);

const fixtureErrorMessage = computed((): string | undefined =>
  fixtureState.value.status === "error" ? fixtureState.value.message : undefined,
);

const rendererErrorMessage = computed((): string | undefined =>
  rendererState.value.status === "error" ? rendererState.value.message : undefined,
);
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-background">
    <MatrixHeader
      :selected-component-id="selectedComponentId"
      :variant-select-value="variantSelectValue"
      :viewport="viewport"
      :picker-options="pickerOptions"
      :fixture-variants="fixtureVariants"
      @component-change="handleComponentChange"
      @variant-change="handleVariantChange"
      @viewport-change="handleViewportChange"
    />

    <!-- Selected-component summary row (renderable badge + id) -->
    <div
      v-if="selectedEntry"
      class="px-6 py-2 border-b border-border/60 bg-muted/20 flex items-center gap-2 text-xs"
      data-testid="matrix-component-summary"
    >
      <span class="font-semibold text-foreground">{{ selectedEntry.title }}</span>
      <Badge
        v-if="selectedDefinition"
        :variant="selectedDefinition.renderable ? 'default' : 'secondary'"
        class="text-[10px] font-semibold uppercase tracking-widest"
      >
        {{ selectedDefinition.renderable ? "Renderable" : "Non-renderable" }}
      </Badge>
      <span class="text-muted-foreground font-code">{{ selectedEntry.id }}</span>
      <span v-if="!stateSupport" class="text-warning text-[11px]">
        No stateSupport metadata declared
      </span>
    </div>

    <!-- ── Main ───────────────────────────────────────────────── -->
    <main class="flex-1 overflow-auto px-6 py-6" tabindex="-1" data-testid="matrix-main">
      <!-- Catalog loading -->
      <div
        v-if="catalogResult.status === 'loading'"
        class="flex flex-col items-center justify-center h-full gap-3 text-center"
        role="status"
        aria-live="polite"
      >
        <span
          class="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin"
          aria-hidden="true"
        />
        <p class="text-sm text-muted-foreground">Loading component catalog…</p>
      </div>

      <!-- Catalog error -->
      <div
        v-else-if="catalogResult.status === 'error'"
        class="flex flex-col items-center justify-center h-full gap-1 text-center"
        role="alert"
      >
        <p class="text-sm font-medium text-destructive">Catalog unavailable</p>
        <p class="text-xs text-muted-foreground max-w-md">{{ catalogResult.message }}</p>
      </div>

      <!-- Idle: no component chosen yet — instructive empty state -->
      <div
        v-else-if="!selectedComponentId"
        class="flex flex-col items-center justify-center h-full gap-3 text-center px-8"
        role="status"
        aria-live="polite"
        data-testid="matrix-idle"
      >
        <div
          class="w-12 h-12 rounded-full bg-muted flex items-center justify-center"
          aria-hidden="true"
        >
          <svg
            class="w-5 h-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5"
            />
          </svg>
        </div>
        <p class="text-sm font-medium text-foreground">Choose a component to inspect</p>
        <p class="text-xs text-muted-foreground max-w-md leading-relaxed">
          The matrix renders one component across Default / Empty / Loading / Error / Disabled
          states in Light and Dark themes, at the selected viewport.
        </p>
        <p class="text-[11px] text-muted-foreground">
          {{ totalCatalogComponents }} components available.
        </p>
      </div>

      <!-- Unknown component id -->
      <div
        v-else-if="selectedComponentId && !selectedEntry"
        class="flex flex-col items-center justify-center h-full gap-1 text-center"
        role="alert"
        data-testid="matrix-unknown-component"
      >
        <p class="text-sm font-medium text-destructive">Component not found</p>
        <p class="text-xs text-muted-foreground max-w-md font-code">
          {{ selectedComponentId }}
        </p>
      </div>

      <!-- Renderer error (failed to resolve renderer module) -->
      <div
        v-else-if="rendererState.status === 'error'"
        class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
        role="alert"
        data-testid="matrix-renderer-error"
      >
        <p class="text-xs font-semibold text-destructive mb-0.5">Renderer unavailable</p>
        <p class="text-[11px] text-foreground leading-relaxed font-code break-all">
          {{ rendererErrorMessage }}
        </p>
      </div>

      <!-- Matrix grid -->
      <section
        v-else-if="showMatrix"
        :class="['mx-auto', viewportClass(viewport)]"
        :data-viewport="viewport"
        data-testid="matrix-grid-container"
      >
        <!-- Loading + fixture diagnostics row -->
        <div
          v-if="rendererState.status === 'loading'"
          class="mb-3 rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground"
          role="status"
          data-testid="matrix-renderer-loading"
        >
          Loading renderer…
        </div>
        <div
          v-if="fixtureBlocking && fixtureState.status === 'loading'"
          class="mb-3 rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground"
          role="status"
          data-testid="matrix-fixture-loading"
        >
          Loading fixture data…
        </div>
        <div
          v-if="fixtureState.status === 'error'"
          class="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[11px] text-destructive"
          role="alert"
          data-testid="matrix-fixture-error"
        >
          Fixture data unavailable: {{ fixtureErrorMessage }}
        </div>

        <!--
          Grid: 1 header row + 5 state rows × 2 theme columns. Uses a labeled
          region (not `role=table`) because each cell carries its own
          independent `role=figure` + aria-label and is addressed individually
          by AT/Playwright — `role=table` would require valid row/cell
          ownership which the visual grid doesn't provide. The column-header
          labels are presentational text; each cell already announces its
          theme through its aria-label so a duplicate header role is noise.
        -->
        <div
          class="grid grid-cols-2 gap-3"
          role="region"
          aria-label="Component state by theme matrix"
          data-testid="matrix-grid"
        >
          <!-- Column labels (presentational text — cells label their own theme) -->
          <div
            v-for="theme in THEMES"
            :key="`header-${theme}`"
            class="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-1"
            :data-testid="`matrix-column-header-${theme}`"
            aria-hidden="true"
          >
            {{ theme }} theme
          </div>

          <!-- State rows × theme columns -->
          <template v-for="state in STATES" :key="state">
            <MatrixCell
              v-for="theme in THEMES"
              :key="`${state}-${theme}`"
              :component-id="selectedEntry?.id ?? ''"
              :variant-id="selectedVariantId"
              :theme="theme"
              :state="state"
              :viewport="viewport"
              :applicability="applicabilityFor(state)"
              :renderer-component="rendererComponent"
              :resolved-config="resolvedConfig"
              :fixture-data="fixtureReadyValue"
              :theme-context="themeContextFor(theme)"
              :theme-context-style="cellThemeBridge(theme, state)"
            />
          </template>
        </div>
      </section>
    </main>
  </div>
</template>

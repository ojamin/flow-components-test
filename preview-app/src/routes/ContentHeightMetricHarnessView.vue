<script setup lang="ts">
// Module intent: catalog-driven browser metric harness for package component sizing.
// It renders one requested manifest-renderable component through public package
// facades under all fixed/min/auto width+height combinations so Playwright can
// iterate safely without exhausting browser canvas/WebGL contexts.

import { computed, markRaw, ref, shallowRef, watch } from "vue";
import type { Component } from "vue";
import { useRoute } from "vue-router";

import { staticComponentPackageCatalog } from "@flow-builder/components/catalog";
import { staticComponentSourceManifest } from "@flow-builder/components/source-manifest";
import { getBuiltInComponentTheme, resolveFixtureData } from "@flow-builder/components/sdk";
import type {
  ComponentDefinition,
  ComponentManifestSummary,
  ComponentThemeContext,
} from "@flow-builder/components/sdk";

const AXIS_MODES = ["fixed", "min", "auto"] as const;
type AxisMode = (typeof AXIS_MODES)[number];

interface HarnessCombo {
  id: string;
  widthMode: AxisMode;
  heightMode: AxisMode;
  label: string;
  wrapperClass: string;
  contentClass: string;
}

interface HarnessCase {
  id: string;
  title: string;
  definition: ComponentDefinition | undefined;
  manifest: ComponentManifestSummary | undefined;
  component: Component | null;
  fixtureData: unknown;
  status: "loading" | "ready" | "error";
  message?: string;
}

const route = useRoute();

const combos: HarnessCombo[] = AXIS_MODES.flatMap((widthMode) =>
  AXIS_MODES.map((heightMode) => ({
    id: `${widthMode}-${heightMode}`,
    widthMode,
    heightMode,
    label: `${widthMode} / ${heightMode}`,
    wrapperClass: [
      widthMode === "fixed" ? "w-[420px]" : widthMode === "min" ? "min-w-72" : "w-auto",
      heightMode === "fixed" ? "h-72" : heightMode === "min" ? "min-h-44" : "h-auto",
    ].join(" "),
    contentClass: [
      widthMode === "fixed" ? "w-full" : widthMode === "min" ? "min-w-72" : "min-w-px",
      heightMode === "fixed" ? "h-full" : heightMode === "min" ? "h-44" : "min-h-px [&>*]:min-h-px",
    ].join(" "),
  })),
);

const manifestById = new Map(
  staticComponentSourceManifest.components.map((entry) => [entry.id, entry]),
);
const renderableEntries = staticComponentPackageCatalog.components
  .map((entry) => ({ ...entry, manifest: manifestById.get(entry.id) }))
  .filter((entry) => entry.manifest?.renderable === true);
const skippedEntries = staticComponentPackageCatalog.components
  .map((entry) => ({ ...entry, manifest: manifestById.get(entry.id) }))
  .filter((entry) => entry.manifest?.renderable !== true);

const requestedComponentId = computed(() => {
  const value = route.query.component;
  return typeof value === "string" && value.length > 0 ? value : undefined;
});
const requestedComboId = computed(() => {
  const value = route.query.combo;
  return typeof value === "string" && combos.some((combo) => combo.id === value)
    ? value
    : combos[0]?.id;
});
const selectedCombos = computed(() =>
  combos.filter((combo) => combo.id === requestedComboId.value),
);

const selectedEntries = computed(() => {
  const requested = requestedComponentId.value;
  if (!requested) return [];
  return renderableEntries.filter((entry) => entry.id === requested);
});

const selectedCaseIds = computed(() => selectedEntries.value.map((entry) => entry.id).join("|"));

const cases = ref<HarnessCase[]>([]);
const componentsById = shallowRef<Record<string, Component | null>>({});
const runtimeOutputsById = ref<Record<string, Record<string, unknown>>>({});

const readyCount = computed(() => cases.value.filter((item) => item.status === "ready").length);
const hasError = computed(() => cases.value.some((item) => item.status === "error"));
const exampleComponentId = computed(() => renderableEntries[0]?.id);

const defaultBuiltInTheme = getBuiltInComponentTheme("default");
const previewThemeContext: ComponentThemeContext | undefined = defaultBuiltInTheme
  ? Object.freeze({
      themeId: defaultBuiltInTheme.id,
      properties: defaultBuiltInTheme.properties,
    })
  : undefined;

function createCases(): HarnessCase[] {
  return selectedEntries.value.map((entry) => ({
    id: entry.id,
    title: entry.title,
    definition: staticComponentPackageCatalog.definitions.find(
      (definition) => definition.id === entry.id,
    ),
    manifest: entry.manifest,
    component: null,
    fixtureData: undefined,
    status: "loading",
  }));
}

function mergeRuntimeOutputs(componentId: string, next: Record<string, unknown>): void {
  runtimeOutputsById.value = {
    ...runtimeOutputsById.value,
    [componentId]: { ...runtimeOutputsById.value[componentId], ...next },
  };
}

watch(
  selectedCaseIds,
  async () => {
    const nextCases = createCases();
    cases.value = nextCases;
    runtimeOutputsById.value = {};
    const nextComponents: Record<string, Component | null> = {};

    await Promise.all(
      nextCases.map(async (item, index) => {
        if (!item.definition?.renderer) {
          cases.value[index] = { ...item, status: "error", message: "Renderer missing" };
          nextComponents[item.id] = null;
          return;
        }

        try {
          const [component, fixtureData] = await Promise.all([
            item.definition.renderer(),
            resolveFixtureData(item.definition),
          ]);
          const resolved = markRaw(component as Component);
          nextComponents[item.id] = resolved;
          cases.value[index] = { ...item, component: resolved, fixtureData, status: "ready" };
        } catch (err) {
          nextComponents[item.id] = null;
          cases.value[index] = {
            ...item,
            status: "error",
            message: err instanceof Error ? err.message : "Renderer failed to load",
          };
        }
      }),
    );

    componentsById.value = nextComponents;
  },
  { immediate: true },
);
</script>

<template>
  <main class="min-h-screen bg-background p-6 text-foreground" data-testid="content-height-harness">
    <header class="mb-6 max-w-5xl">
      <p class="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Browser metric proof
      </p>
      <h1 class="mt-1 text-2xl font-semibold">Package component sizing matrix</h1>
      <p class="mt-2 text-sm text-muted-foreground">
        <template v-if="requestedComponentId">
          {{ readyCount }} / {{ cases.length }} selected renderable components loaded through the
          package catalog for combo {{ requestedComboId }} (1 / {{ combos.length }}).
        </template>
        <template v-else>
          Select one renderable component with
          <span class="font-code">?component=&lt;id&gt;</span> to run the sizing matrix without
          mounting every canvas/WebGL preview at once.
        </template>
      </p>
      <p class="mt-1 text-xs text-muted-foreground" data-testid="content-height-matrix-counts">
        Renderable: {{ renderableEntries.length }} · Skipped non-renderable:
        {{ skippedEntries.length }}
      </p>
      <p
        v-if="requestedComponentId && cases.length === 0"
        class="mt-2 text-sm text-destructive"
        role="alert"
      >
        Requested component is not manifest-renderable: {{ requestedComponentId }}
      </p>
      <p v-if="hasError" class="mt-2 text-sm text-destructive" role="alert">
        One or more renderable components failed to load.
      </p>
    </header>

    <section
      v-if="!requestedComponentId"
      class="mb-6 max-w-5xl space-y-4 border-y border-border/70 py-5"
      aria-labelledby="content-height-harness-instructions"
    >
      <div class="space-y-2">
        <h2 id="content-height-harness-instructions" class="text-sm font-semibold">
          Run one component matrix at a time
        </h2>
        <p class="text-sm text-muted-foreground">
          This harness intentionally stays idle until a component id is supplied. Use the catalog
          below, or navigate directly to
          <RouterLink
            v-if="exampleComponentId"
            class="font-code text-primary underline-offset-4 hover:underline focus-visible:underline"
            :to="`/content-height-metrics?component=${exampleComponentId}`"
          >
            /content-height-metrics?component={{ exampleComponentId }}
          </RouterLink>
          .
        </p>
      </div>
      <details class="text-xs text-muted-foreground">
        <summary class="cursor-pointer font-semibold text-foreground">
          {{ renderableEntries.length }} renderable package components available
        </summary>
        <ul class="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="entry in renderableEntries" :key="entry.id" class="min-w-0">
            <RouterLink
              class="font-code text-primary underline-offset-4 hover:underline focus-visible:underline"
              :to="`/content-height-metrics?component=${entry.id}`"
            >
              {{ entry.id }}
            </RouterLink>
          </li>
        </ul>
      </details>
    </section>

    <section
      v-if="requestedComponentId"
      class="mb-6 max-w-5xl border-y border-border/70 py-4"
      aria-labelledby="content-height-combo-picker"
    >
      <h2 id="content-height-combo-picker" class="text-sm font-semibold">Sizing combo</h2>
      <p class="mt-1 text-xs text-muted-foreground">
        One combo is rendered per page to keep canvas/WebGL-heavy components within browser context
        limits. Playwright iterates these links for full matrix coverage.
      </p>
      <ul class="mt-3 flex flex-wrap gap-2">
        <li v-for="combo in combos" :key="combo.id">
          <RouterLink
            class="inline-flex min-h-8 items-center border border-border px-2.5 py-1 text-xs font-medium text-foreground underline-offset-4 hover:bg-muted/50 focus-visible:underline"
            :class="combo.id === requestedComboId ? 'bg-muted' : ''"
            :aria-current="combo.id === requestedComboId ? 'page' : undefined"
            :to="`/content-height-metrics?component=${requestedComponentId}&combo=${combo.id}`"
          >
            {{ combo.label }}
          </RouterLink>
        </li>
      </ul>
    </section>

    <section class="mb-6" aria-label="Non-renderable components skipped">
      <details class="text-xs text-muted-foreground">
        <summary class="cursor-pointer font-semibold text-foreground">
          {{ skippedEntries.length }} non-renderable package components skipped by manifest contract
        </summary>
        <ul class="mt-2 columns-1 gap-x-6 sm:columns-2 lg:columns-3">
          <li v-for="entry in skippedEntries" :key="entry.id" class="break-inside-avoid font-code">
            {{ entry.id }}
          </li>
        </ul>
      </details>
    </section>

    <section class="space-y-10" aria-label="Renderable component sizing matrix">
      <article v-for="item in cases" :key="item.id" class="space-y-3" :data-component-id="item.id">
        <div>
          <h2 class="text-sm font-semibold">{{ item.title }}</h2>
          <p class="font-code text-xs text-muted-foreground">{{ item.id }}</p>
        </div>

        <div v-if="item.status === 'error'" class="text-sm text-destructive" role="alert">
          {{ item.message }}
        </div>
        <div
          v-else-if="item.status !== 'ready'"
          class="text-sm text-muted-foreground"
          role="status"
        >
          Loading…
        </div>
        <div v-else class="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          <div v-for="combo in selectedCombos" :key="combo.id" class="space-y-1">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {{ combo.label }}
            </p>
            <div
              :class="[
                'content-height-metric-wrapper max-w-full overflow-auto border border-dashed border-border/70 bg-muted/10 p-3',
                combo.wrapperClass,
              ]"
              :data-testid="`metric-wrapper-${item.id}-${combo.id}`"
              :data-component-id="item.id"
              :data-default-height-mode="item.definition?.builder?.heightMode ?? 'auto'"
              :data-width-mode="combo.widthMode"
              :data-height-mode="combo.heightMode"
              :data-combo-id="combo.id"
            >
              <div
                :class="['content-height-metric-rendered min-h-0 min-w-0', combo.contentClass]"
                :data-testid="`metric-rendered-${item.id}-${combo.id}`"
                data-ct-scope="content-height-matrix"
              >
                <component
                  :is="componentsById[item.id]"
                  :config="item.definition?.configDefaults ?? {}"
                  :fixture-data="item.fixtureData"
                  :runtime-outputs="runtimeOutputsById[item.id] ?? {}"
                  :update-runtime-outputs="
                    (next: Record<string, unknown>) => mergeRuntimeOutputs(item.id, next)
                  "
                  :emit-event="() => undefined"
                  :theme-context="previewThemeContext"
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>

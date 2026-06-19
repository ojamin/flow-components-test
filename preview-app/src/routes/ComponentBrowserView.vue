<script setup lang="ts">
// Module intent: component browser — search/filter/sort controls plus group/section/component
// list and a metadata detail pane. All catalog access goes through catalog-loader; all
// filter state lives in useBrowserFilter. No host app imports — only package facades.

import { computed, ref, watch } from "vue";

import type { ComponentDefinition, ParamValuesState } from "@flow-builder/components/sdk";
import ConfigPanelHostPane from "../components/ConfigPanelHostPane.vue";
import ContractDetailsPane from "../components/ContractDetailsPane.vue";
import RendererHostPane from "../components/RendererHostPane.vue";
import type { CapturedRendererEvent } from "../components/ValidationStatusPane.vue";
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@flow-builder/components/component-ui";
import {
  loadCatalogCount,
  loadCatalogResult,
  loadEnrichedEntry,
  loadManifestEntry,
  loadTagsByComponentId,
  type CatalogLoadResult,
} from "../catalog-loader";
import { useBrowserFilter } from "../composables/useBrowserFilter";
import { createPreviewDatasetDerivationService } from "../runtime/preview-dataset-derivation-service";

// Props allow tests to inject catalog states (loading/error/ready with custom groups).
// Normal production runtime never sets this prop; the loaded result is used.
const props = defineProps<{
  testCatalogResult?: CatalogLoadResult;
}>();

const totalCount = loadCatalogCount();
const catalogResult = computed(
  (): CatalogLoadResult => props.testCatalogResult ?? loadCatalogResult(),
);
const tagsByComponentId = loadTagsByComponentId();

// Groups are only available when catalog loaded successfully; fallback to empty list.
const groups = computed(() =>
  catalogResult.value.status === "ready" ? catalogResult.value.groups : [],
);

const {
  searchQuery,
  selectedGroupId,
  selectedSectionId,
  sortOrder,
  filteredGroups,
  totalMatches,
  hasActiveFilters,
  availableSections,
  allGroupIds,
  groupLabelById,
  clearFilters,
  setGroupFilter,
} = useBrowserFilter(groups.value, tagsByComponentId);

const selectedId = ref<string | null>(null);
const selectedEntry = computed(() =>
  selectedId.value != null ? loadEnrichedEntry(selectedId.value) : undefined,
);
// Narrowed separately so the template can use a plain v-if.
const selectedDefinition = computed(
  (): ComponentDefinition | undefined => selectedEntry.value?.definition,
);

// Source-manifest summary for the selected component; drives manifest section in detail pane.
const selectedManifestEntry = computed(() =>
  selectedId.value != null ? loadManifestEntry(selectedId.value) : undefined,
);
const datasetDerivationService = createPreviewDatasetDerivationService();

function select(id: string): void {
  selectedId.value = id;
}

// ── Config + bind state ───────────────────────────────────────────────────────
// Controlled config for the ConfigPanel → Renderer live preview loop, plus the
// param-values bind state that drives SchemaForm's `Literal | From data` toggle.
// Both reset on selection change so a previous component's edits never bleed
// into a freshly selected one. RendererHostPane seeds paramValues with derived
// defaults whenever it's still undefined; ConfigPanelHostPane and the renderer
// share the same state from then on.
const currentConfig = ref<Record<string, unknown> | undefined>(undefined);
const currentParamValues = ref<ParamValuesState | undefined>(undefined);

// Latest captured renderer event, surfaced from RendererHostPane so the
// validation pane can fold undeclared emits into event-declaration drift and
// future preview-controls (replay last event) can act on it without reaching
// into the panel's internal buffer.
const latestCapturedEvent = ref<CapturedRendererEvent | null>(null);

watch(selectedId, () => {
  currentConfig.value = selectedDefinition.value?.configDefaults as
    | Record<string, unknown>
    | undefined;
  currentParamValues.value = undefined;
  latestCapturedEvent.value = null;
});

function handleConfigUpdate(next: Record<string, unknown>): void {
  currentConfig.value = next;
}

function handleParamValuesUpdate(next: ParamValuesState): void {
  currentParamValues.value = next;
}

function handleLatestCapturedEvent(next: CapturedRendererEvent | null): void {
  latestCapturedEvent.value = next;
}
</script>

<template>
  <!--
    Responsive shell: stacks vertically on narrow viewports (sidebar above main),
    switches to side-by-side on md+ (preserving the fixed w-64 sidebar design).
  -->
  <div class="flex flex-col md:flex-row h-screen overflow-hidden">
    <!-- ── Sidebar ─────────────────────────────────────────────── -->
    <!--
      Three-zone vertical layout (header, filter, list) inside a flex column.
      `min-h-0` on the aside lets it shrink within the flex-row parent so the
      nested column can budget vertical space; `min-h-0` on the scrolling nav
      below is the canonical fix that prevents intrinsic content height from
      pushing list rows outside the scroll container and underneath the
      sticky-feeling filter block.
    -->
    <aside
      class="flex flex-col w-full md:w-64 md:shrink-0 md:min-h-0 border-b md:border-b-0 md:border-r border-border bg-background overflow-hidden max-h-72 md:max-h-none"
      aria-label="Component groups"
    >
      <!-- Package header -->
      <div class="px-4 pt-4 pb-3 border-b border-border shrink-0">
        <p
          class="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest leading-none"
        >
          @flow-builder
        </p>
        <p class="text-sm font-semibold text-foreground mt-1">Components</p>
        <p class="text-xs text-muted-foreground mt-0.5">
          <template v-if="hasActiveFilters"> {{ totalMatches }} of {{ totalCount }} </template>
          <template v-else>{{ totalCount }} components</template>
        </p>
      </div>

      <!-- Filter controls. A subtle `bg-muted/30` plus the existing
           `border-b` defines a clear seam between filters and the scroll
           area below, so list rows never read as bleeding up under the
           filter controls when the list scrolls. -->
      <div class="px-3 py-2.5 border-b border-border shrink-0 space-y-1.5 bg-muted/30">
        <!-- Search input -->
        <div class="relative">
          <Label for="browser-search" class="sr-only">Search components</Label>
          <Input
            id="browser-search"
            v-model="searchQuery"
            type="search"
            placeholder="Search…"
            autocomplete="off"
            class="h-7 text-xs"
          />
          <!-- Clear search -->
          <Button
            v-if="searchQuery"
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear search"
            class="absolute inset-y-0 right-0 h-full w-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
            @click="searchQuery = ''"
          >
            <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </Button>
        </div>

        <!-- Group and sort row -->
        <div class="flex gap-1.5">
          <Label for="browser-group" class="sr-only">Filter by group</Label>
          <Select
            id="browser-group"
            :model-value="selectedGroupId ?? '__all__'"
            @update:model-value="setGroupFilter($event === '__all__' ? null : ($event as string))"
          >
            <SelectTrigger class="flex-1 min-w-0 h-7 text-xs">
              <SelectValue placeholder="All groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All groups</SelectItem>
              <SelectItem v-for="gid in allGroupIds" :key="gid" :value="gid">
                {{ groupLabelById.get(gid) ?? gid }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Label for="browser-sort" class="sr-only">Sort order</Label>
          <Select id="browser-sort" v-model="sortOrder">
            <SelectTrigger class="w-[76px] h-7 text-xs shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="catalog">Default</SelectItem>
              <SelectItem value="asc">A → Z</SelectItem>
              <SelectItem value="desc">Z → A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Section filter (shown when multiple sections are available) -->
        <div v-if="availableSections.length > 1" class="flex gap-1.5 items-center">
          <Label for="browser-section" class="sr-only">Filter by section</Label>
          <Select
            id="browser-section"
            :model-value="selectedSectionId ?? '__all__'"
            @update:model-value="
              selectedSectionId = $event === '__all__' ? null : ($event as string)
            "
          >
            <SelectTrigger class="flex-1 min-w-0 h-7 text-xs">
              <SelectValue placeholder="All sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All sections</SelectItem>
              <SelectItem v-for="sec in availableSections" :key="sec.id" :value="sec.id">
                {{ sec.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            v-if="hasActiveFilters"
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Clear all filters"
            class="shrink-0 text-[11px] px-1.5 h-7"
            @click="clearFilters"
          >
            Clear
          </Button>
        </div>

        <!-- Clear-filters row when section select is hidden but filters are active -->
        <div v-else-if="hasActiveFilters" class="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Clear all filters"
            class="text-[11px] px-1.5 h-7"
            @click="clearFilters"
          >
            Clear filters
          </Button>
        </div>
      </div>

      <!-- Scrollable group → section → component list. `min-h-0` lets this
           flex-1 child shrink below its intrinsic content height so the
           internal `overflow-y-auto` actually scrolls instead of letting
           rows render outside the scroll viewport. Generous `pt-4`
           guarantees the first group label has breathing room from the
           filter seam, and `pb-6` keeps the last item from feeling pinned
           to the viewport edge. -->
      <nav class="flex-1 min-h-0 overflow-y-auto pt-4 pb-6" aria-label="Component list">
        <!-- No-results empty state -->
        <div
          v-if="filteredGroups.length === 0 && catalogResult.status === 'ready'"
          class="px-4 py-8 text-center"
          role="status"
          aria-live="polite"
        >
          <p class="text-xs font-medium text-foreground mb-1">No results</p>
          <p class="text-[11px] text-muted-foreground leading-relaxed mb-3">
            No components match your filters.
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            class="text-xs h-auto p-0"
            @click="clearFilters"
          >
            Clear filters
          </Button>
        </div>

        <!-- Filtered group → section → component hierarchy -->
        <template v-else>
          <div v-for="group in filteredGroups" :key="group.id" class="mb-4">
            <!-- Group label -->
            <div class="px-4 mb-1.5">
              <span
                class="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest"
              >
                {{ group.label }}
              </span>
            </div>

            <!-- Sections within the group -->
            <div v-for="section in group.sections" :key="section.id" class="mb-1">
              <!-- Section heading (shown only when the group has multiple sections) -->
              <div v-if="group.sections.length > 1" class="px-4 py-0.5 mt-1">
                <span class="text-[10px] text-muted-foreground/60 uppercase tracking-wide">
                  {{ section.label }}
                </span>
              </div>

              <!-- Component buttons -->
              <ul role="list">
                <li v-for="entry in section.components" :key="entry.id">
                  <button
                    type="button"
                    :aria-pressed="selectedId === entry.id"
                    class="w-full text-left px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    :class="
                      selectedId === entry.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-muted hover:text-foreground'
                    "
                    @click="select(entry.id)"
                  >
                    {{ entry.title }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </nav>
    </aside>

    <!-- ── Detail pane ─────────────────────────────────────────── -->
    <main class="flex-1 overflow-y-auto bg-background min-h-0" tabindex="-1">
      <!-- Loading state -->
      <div
        v-if="catalogResult.status === 'loading'"
        class="flex flex-col items-center justify-center h-full gap-4 text-center px-8"
        role="status"
        aria-live="polite"
        aria-label="Loading catalog"
      >
        <!-- Animated spinner via border trick using semantic tokens only -->
        <span
          class="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin"
          aria-hidden="true"
        />
        <p class="text-sm text-muted-foreground">Loading component catalog…</p>
      </div>

      <!-- Catalog error state -->
      <div
        v-else-if="catalogResult.status === 'error'"
        class="flex flex-col items-center justify-center h-full text-center px-8"
        role="alert"
      >
        <p class="text-sm font-medium text-destructive mb-1">Catalog unavailable</p>
        <p class="text-xs text-muted-foreground max-w-xs">{{ catalogResult.message }}</p>
      </div>

      <!-- Empty selection state -->
      <div
        v-else-if="!selectedEntry"
        class="flex flex-col items-center justify-center h-full text-center px-8"
        role="status"
        aria-live="polite"
      >
        <div
          class="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4"
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
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
            />
          </svg>
        </div>
        <p class="text-sm font-medium text-foreground">Select a component</p>
        <p class="text-xs text-muted-foreground mt-1 max-w-xs">
          Choose a component from the list to view its metadata.
        </p>
      </div>

      <!-- Component detail -->
      <div v-else class="max-w-2xl px-8 py-8">
        <!-- Title row -->
        <div class="flex items-start gap-3 mb-6">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <h2 class="text-xl font-semibold text-foreground leading-tight">
                {{ selectedEntry.title }}
              </h2>
              <!-- Renderable/non-renderable status badge -->
              <Badge
                v-if="selectedDefinition"
                :variant="selectedDefinition.renderable ? 'default' : 'secondary'"
                class="text-[10px] font-semibold uppercase tracking-widest"
              >
                {{ selectedDefinition.renderable ? "Renderable" : "Non-renderable" }}
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground font-code">{{ selectedEntry.id }}</p>
          </div>
          <!--
            Discovery affordance for the state × theme matrix route. Carries the
            selected component id through the URL so the matrix renders the same
            definition the author is inspecting in the detail pane.
          -->
          <RouterLink
            :to="{ path: '/matrix', query: { component: selectedEntry.id } }"
            class="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground border border-border/60 rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
            data-testid="open-matrix-link"
          >
            Open matrix →
          </RouterLink>
        </div>

        <!-- Description -->
        <p v-if="selectedEntry.description" class="text-sm text-foreground leading-relaxed mb-6">
          {{ selectedEntry.description }}
        </p>

        <!-- Fixture renderer host (Task 38.3): shown for all selected components; handles
             renderable/non-renderable/loading/error states internally. Controlled config
             from the ConfigPanel overrides definition configDefaults when present.
             Bind state (`paramValues`) is shared with ConfigPanelHostPane so the renderer
             reflects bind toggles made in the config panel; the renderer also seeds the
             initial bind defaults via `update:paramValues` and surfaces the latest
             captured event for upcoming PreviewControlsBar replay support. -->
        <RendererHostPane
          :definition="selectedDefinition"
          :config="currentConfig"
          :param-values="currentParamValues"
          @update:param-values="handleParamValuesUpdate"
          @update:latest-captured-event="handleLatestCapturedEvent"
        />

        <!-- ConfigPanel host (Task 38.4): loads the definition's configPanel() lazily;
             handles missing/loading/error/invalid-update states internally. Owns the
             SchemaForm bind toggle and forwards `update:paramValues` so bind state
             lives alongside `config` in the preview-app session. -->
        <ConfigPanelHostPane
          :definition="selectedDefinition"
          :config="currentConfig"
          :param-values="currentParamValues"
          :dataset-derivation-service="datasetDerivationService"
          @update:config="handleConfigUpdate"
          @update:param-values="handleParamValuesUpdate"
        />

        <!-- Contract details: metadata grid, ports, slots, runtime requirements,
             transform output, fixture data, and manifest metadata (Task 38.5). -->
        <ContractDetailsPane
          :definition="selectedDefinition"
          :entry="selectedEntry"
          :config="currentConfig"
          :param-values="currentParamValues"
          :manifest-entry="selectedManifestEntry"
          :latest-captured-event="latestCapturedEvent"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Module intent: contract detail sections for the selected component — metadata
// grid, input/output ports, slots, params, events, eventOutputs, runtime
// requirements, transform output, fixture data JSON, manifest metadata, package
// source hashes, and contract diagnostics. Extracted from ComponentBrowserView
// to keep that file under the 600-line hard cap. Depends only on package
// facades; no host-app imports.

import { ref, watch } from "vue";
import type {
  ComponentDefinition,
  ComponentManifestSummary,
  ParamValuesState,
} from "@flow-builder/components/sdk";
import { resolveFixtureData } from "@flow-builder/components/sdk";
import { loadSourceFingerprints } from "../catalog-loader";
import type { EnrichedCatalogEntry } from "../catalog-loader";
import ContractInterfaceSections from "./ContractInterfaceSections.vue";
import TransformOutputPane from "./TransformOutputPane.vue";
import ValidationStatusPane, { type CapturedRendererEvent } from "./ValidationStatusPane.vue";

const props = defineProps<{
  /** The definition for the selected component, or undefined when absent. */
  definition: ComponentDefinition | undefined;
  /** Enriched catalog entry carrying group + section metadata. */
  entry: EnrichedCatalogEntry | undefined;
  /** Current controlled config forwarded to TransformOutputPane. */
  config?: Record<string, unknown>;
  /** Shared literal/bind param state forwarded to TransformOutputPane. */
  paramValues?: ParamValuesState;
  /** Source-manifest summary for the selected component. */
  manifestEntry?: ComponentManifestSummary;
  /**
   * Most recent renderer event captured by RendererHostPane; forwarded as-is
   * to ValidationStatusPane so undeclared emits surface as event-declaration
   * drift alongside manifest drift.
   */
  latestCapturedEvent?: CapturedRendererEvent | null;
}>();

// Package-level fingerprints loaded once — same for all components in this build.
const sourceFingerprints = loadSourceFingerprints();

// Fixture-data load state. `loadFixtureData` is required on every definition
// under the async fixture contract, so the section renders deterministic
// loading / ready / error states whenever a definition is present.
type FixtureState =
  | { status: "loading" }
  | { status: "ready"; data: unknown }
  | { status: "error"; message: string };

const fixtureState = ref<FixtureState>({ status: "loading" });

// Monotonic token guards against stale resolutions when the selected definition
// changes while a previous load is still in flight.
let fixtureLoadToken = 0;

watch(
  () => props.definition,
  async (definition) => {
    const token = ++fixtureLoadToken;
    if (!definition) {
      fixtureState.value = { status: "loading" };
      return;
    }
    fixtureState.value = { status: "loading" };
    try {
      const data = await resolveFixtureData(definition);
      if (token !== fixtureLoadToken) return;
      fixtureState.value = { status: "ready", data };
    } catch (err) {
      if (token !== fixtureLoadToken) return;
      fixtureState.value = {
        status: "error",
        message: err instanceof Error ? err.message : "Fixture load failed.",
      };
    }
  },
  { immediate: true },
);

// No-ops silently when the Clipboard API is absent (insecure/file: origins) or
// when the write is rejected (e.g. permission denied).
function copyText(text: string): void {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(text).catch(() => {});
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function copyResolvedFixtureData(): void {
  if (fixtureState.value.status !== "ready") return;
  copyText(formatJson(fixtureState.value.data));
}
</script>

<template>
  <!-- Populated when a definition is available; fallback otherwise. -->
  <template v-if="definition">
    <!-- ── Key metadata grid ───────────────────────────────────────── -->
    <dl class="grid grid-cols-2 gap-x-8 gap-y-3 mb-8 text-sm" data-testid="metadata-grid">
      <div>
        <dt class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
          Category
        </dt>
        <dd class="text-foreground capitalize">{{ definition.category }}</dd>
      </div>
      <div>
        <dt class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
          Group
        </dt>
        <dd class="text-foreground capitalize">{{ entry?.group }}</dd>
      </div>
      <div>
        <dt class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
          Section
        </dt>
        <dd class="text-foreground capitalize">{{ entry?.section ?? "—" }}</dd>
      </div>
      <div>
        <dt class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
          Version
        </dt>
        <dd class="text-foreground">v{{ definition.version }}</dd>
      </div>
    </dl>

    <!-- ── Input ports ────────────────────────────────────────────── -->
    <section class="mb-6" aria-labelledby="inputs-heading">
      <h3
        id="inputs-heading"
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
      >
        Input ports
        <span class="font-normal normal-case tracking-normal text-muted-foreground/70">
          ({{ definition.inputs.length }})
        </span>
      </h3>
      <ul v-if="definition.inputs.length > 0" class="space-y-2" role="list">
        <li
          v-for="port in definition.inputs"
          :key="port.id"
          class="flex items-baseline gap-2 text-sm"
        >
          <span class="font-code text-xs text-info shrink-0 w-28 truncate">{{ port.id }}</span>
          <span class="text-foreground flex-1">{{ port.label }}</span>
          <span class="text-xs text-muted-foreground shrink-0">
            {{ port.acceptedTypeIds.join(", ") }}
          </span>
        </li>
      </ul>
      <p v-else class="text-xs text-muted-foreground italic">No input ports.</p>
    </section>

    <!-- ── Output ports ───────────────────────────────────────────── -->
    <section class="mb-6" aria-labelledby="outputs-heading">
      <h3
        id="outputs-heading"
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
      >
        Output ports
        <span class="font-normal normal-case tracking-normal text-muted-foreground/70">
          ({{ definition.outputs.length }})
        </span>
      </h3>
      <ul v-if="definition.outputs.length > 0" class="space-y-2" role="list">
        <li
          v-for="port in definition.outputs"
          :key="port.id"
          class="flex items-baseline gap-2 text-sm"
        >
          <span class="font-code text-xs text-primary shrink-0 w-28 truncate">{{ port.id }}</span>
          <span class="text-foreground flex-1">{{ port.label }}</span>
          <span class="text-xs text-muted-foreground shrink-0">{{ port.typeId }}</span>
        </li>
      </ul>
      <p v-else class="text-xs text-muted-foreground italic">No output ports.</p>
    </section>

    <!-- ── Slots ──────────────────────────────────────────────────── -->
    <section v-if="definition.slots.length > 0" class="mb-6" aria-labelledby="slots-heading">
      <h3
        id="slots-heading"
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
      >
        Slots
        <span class="font-normal normal-case tracking-normal text-muted-foreground/70">
          ({{ definition.slots.length }})
        </span>
      </h3>
      <ul class="space-y-2" role="list">
        <li
          v-for="slot in definition.slots"
          :key="slot.id"
          class="flex items-baseline gap-2 text-sm"
        >
          <span class="font-code text-xs text-warning shrink-0 w-28 truncate">{{ slot.id }}</span>
          <span class="text-foreground flex-1">{{ slot.label }}</span>
          <span class="text-xs text-muted-foreground shrink-0">{{ slot.childScopeMode }}</span>
        </li>
      </ul>
    </section>

    <!-- ── Params / Events / Event outputs (extracted child) ──────── -->
    <ContractInterfaceSections :definition="definition" />

    <!-- ── Runtime requirements (from manifest) ───────────────────── -->
    <section
      v-if="manifestEntry?.runtimeRequirements?.length"
      class="mb-6"
      aria-labelledby="runtime-req-heading"
      data-testid="runtime-requirements"
    >
      <h3
        id="runtime-req-heading"
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
      >
        Runtime requirements
      </h3>
      <ul class="flex flex-wrap gap-1.5" role="list">
        <li
          v-for="req in manifestEntry.runtimeRequirements"
          :key="req"
          class="text-[11px] font-code bg-muted px-2 py-0.5 rounded text-foreground"
        >
          {{ req }}
        </li>
      </ul>
    </section>

    <!-- ── Transform output (lazy-executed via TransformOutputPane) ── -->
    <TransformOutputPane
      v-if="definition.transform"
      :definition="definition"
      :config="config"
      :param-values="paramValues"
    />

    <!-- ── Fixture data JSON (lazy-resolved via resolveFixtureData) ── -->
    <section class="mb-6" aria-labelledby="fixture-heading" data-testid="fixture-data-section">
      <h3
        id="fixture-heading"
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
      >
        Fixture data
      </h3>

      <!-- Loading: the fixture promise is pending -->
      <div
        v-if="fixtureState.status === 'loading'"
        class="flex items-center gap-2 py-3"
        role="status"
        aria-label="Loading fixture data"
        data-testid="fixture-data-loading"
      >
        <span
          class="w-4 h-4 rounded-full border-2 border-border border-t-primary animate-spin"
          aria-hidden="true"
        />
        <span class="text-xs text-muted-foreground">Loading fixture data…</span>
      </div>

      <!-- Error: loadFixtureData rejected -->
      <div
        v-else-if="fixtureState.status === 'error'"
        class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
        role="alert"
        data-testid="fixture-data-error"
      >
        <p class="text-xs font-semibold text-destructive mb-0.5">Fixture load failed</p>
        <p class="text-[11px] text-muted-foreground font-code break-all leading-relaxed">
          {{ fixtureState.message }}
        </p>
      </div>

      <!-- Ready: resolved value is undefined → empty placeholder, otherwise JSON + copy -->
      <p
        v-else-if="fixtureState.data === undefined"
        class="text-xs text-muted-foreground italic"
        data-testid="fixture-data-empty"
      >
        No fixture data.
      </p>
      <div v-else class="relative">
        <button
          type="button"
          aria-label="Copy fixture data"
          class="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          @click="copyResolvedFixtureData"
        >
          Copy
        </button>
        <pre
          class="text-[11px] font-code text-foreground bg-muted/30 rounded-md p-3 pr-12 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed"
          data-testid="fixture-data-json"
          >{{ formatJson(fixtureState.data) }}</pre
        >
      </div>
    </section>

    <!-- ── Manifest metadata (tags, flags, sourcePath, contentHash) ── -->
    <section
      v-if="manifestEntry"
      class="mb-6"
      aria-labelledby="manifest-heading"
      data-testid="manifest-section"
    >
      <h3
        id="manifest-heading"
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
      >
        Manifest
      </h3>
      <dl class="space-y-2 text-sm">
        <div v-if="manifestEntry.tags.length > 0">
          <dt class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Tags
          </dt>
          <dd class="flex flex-wrap gap-1">
            <span
              v-for="tag in manifestEntry.tags"
              :key="tag"
              class="text-[11px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
            >
              {{ tag }}
            </span>
          </dd>
        </div>

        <div>
          <dt
            class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5"
          >
            Source path
          </dt>
          <dd class="font-code text-xs text-foreground break-all">
            {{ manifestEntry.sourcePath }}
          </dd>
        </div>

        <div>
          <dt
            class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5"
          >
            Content hash
          </dt>
          <dd class="flex items-center gap-2">
            <span class="font-code text-[11px] text-muted-foreground break-all">
              {{ manifestEntry.contentHash }}
            </span>
            <button
              type="button"
              aria-label="Copy content hash"
              class="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              @click="copyText(manifestEntry.contentHash)"
            >
              Copy
            </button>
          </dd>
        </div>

        <div v-if="manifestEntry.deprecated || manifestEntry.experimental" class="flex gap-2 pt-1">
          <span
            v-if="manifestEntry.deprecated"
            class="text-[11px] font-semibold bg-destructive/10 text-destructive px-2 py-0.5 rounded uppercase tracking-wider"
            data-testid="flag-deprecated"
          >
            Deprecated
          </span>
          <span
            v-if="manifestEntry.experimental"
            class="text-[11px] font-semibold bg-warning/10 text-warning px-2 py-0.5 rounded uppercase tracking-wider"
            data-testid="flag-experimental"
          >
            Experimental
          </span>
        </div>
      </dl>
    </section>

    <!-- ── Package source hashes (same for every component in this build) ── -->
    <section
      class="mb-6"
      aria-labelledby="source-hashes-heading"
      data-testid="source-fingerprints-section"
    >
      <h3
        id="source-hashes-heading"
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
      >
        Package source hashes
      </h3>
      <dl class="space-y-2">
        <div>
          <dt
            class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5"
          >
            Manifest hash
          </dt>
          <dd class="flex items-center gap-2">
            <span
              class="font-code text-[11px] text-muted-foreground break-all"
              data-testid="source-manifest-hash"
            >
              {{ sourceFingerprints.manifestHash }}
            </span>
            <button
              type="button"
              aria-label="Copy manifest hash"
              class="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              @click="copyText(sourceFingerprints.manifestHash)"
            >
              Copy
            </button>
          </dd>
        </div>

        <div>
          <dt
            class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5"
          >
            Files hash
          </dt>
          <dd class="flex items-center gap-2">
            <span
              class="font-code text-[11px] text-muted-foreground break-all"
              data-testid="source-files-hash"
            >
              {{ sourceFingerprints.filesHash }}
            </span>
            <button
              type="button"
              aria-label="Copy files hash"
              class="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              @click="copyText(sourceFingerprints.filesHash)"
            >
              Copy
            </button>
          </dd>
        </div>
      </dl>
    </section>

    <!-- ── Validation status + author commands ───────────────────────── -->
    <ValidationStatusPane
      :definition="definition"
      :manifest-entry="manifestEntry"
      :folder-group="entry?.group"
      :latest-captured-event="latestCapturedEvent"
    />

    <!-- ── Contract diagnostics (missing manifest/fingerprint issues) ─ -->
    <section class="mb-6" aria-labelledby="diagnostics-heading" data-testid="contract-diagnostics">
      <h3
        id="diagnostics-heading"
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
      >
        Contract diagnostics
      </h3>

      <p
        v-if="manifestEntry"
        class="text-xs text-muted-foreground italic"
        data-testid="diagnostics-healthy"
      >
        No contract diagnostics.
      </p>

      <ul v-else class="space-y-1.5" role="list" aria-label="Contract issues">
        <li
          class="flex items-start gap-2 text-xs text-destructive"
          data-testid="diagnostics-missing-manifest"
        >
          <span aria-hidden="true" class="shrink-0 font-semibold">⚠</span>
          <span>Missing package manifest entry for this component.</span>
        </li>
      </ul>
    </section>
  </template>

  <!-- Fallback when definition is unexpectedly absent -->
  <p v-else class="text-xs text-muted-foreground italic" data-testid="definition-absent-fallback">
    Definition metadata not available for this component.
  </p>
</template>

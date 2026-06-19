<script lang="ts">
// Module intent: exports the pure status-derivation types and function so tests
// can import them directly without mounting the component.
import type { ComponentDefinition, ComponentManifestSummary } from "@flow-builder/components/sdk";

export type TestStatusKind = "pass" | "fail" | "unknown";

/** Per-contract-area test status derived deterministically from definition + manifest. */
export interface ComponentTestStatus {
  /** Manifest entry present? */
  contract: TestStatusKind;
  /** Renderer module registered? Pass if renderer exists (even for non-renderable components
   *  that ship a diagnostic renderer). Fail only when renderable but renderer is absent.
   *  Unknown when non-renderable and no renderer. */
  render: TestStatusKind;
  /** Transform module registered? Unknown when absent (not all components transform). */
  transform: TestStatusKind;
}

/**
 * Derives test status from definition + manifestEntry without executing any tests.
 * Pure function — safe to call in reactive contexts and unit tests alike.
 */
export function deriveTestStatus(
  definition: ComponentDefinition,
  manifestEntry: ComponentManifestSummary | undefined,
): ComponentTestStatus {
  return {
    contract: manifestEntry ? "pass" : "fail",
    render: definition.renderer ? "pass" : definition.renderable ? "fail" : "unknown",
    transform: definition.transform ? "pass" : "unknown",
  };
}

/**
 * Renderer event capture record. Structurally identical to the local interface
 * declared inside RendererHostPane.vue; exported here so consumers (the parent
 * route + this pane) can type the prop without crossing into RendererHostPane's
 * internal types. Shape parity is intentional: any divergence would silently
 * bypass the event-declaration drift surface below.
 */
export interface CapturedRendererEvent {
  id: number;
  eventId: string;
  payload: unknown;
  status: "valid" | "invalid" | "undeclared";
  message?: string;
}

/** Surfaced drift entry for an `emitEvent(id, …)` call against an undeclared event id. */
export interface EventDeclarationDriftIssue {
  /** The event id the renderer attempted to emit. */
  eventId: string;
  /** Human-readable message describing why the emit was flagged. */
  message: string;
}
</script>

<script setup lang="ts">
// Component setup: reactive bindings, copy logic, and command list.
// No host-app imports; depends only on @flow-builder/components SDK + manifest facades.

import { computed, ref, watch } from "vue";
import {
  findManifestDrift,
  type ComponentGroupId,
  type ManifestDriftIssue,
} from "@flow-builder/components/sdk";

const props = defineProps<{
  /** The definition for the selected component. */
  definition: ComponentDefinition;
  /** Source-manifest summary; absent when the manifest entry is missing. */
  manifestEntry: ComponentManifestSummary | undefined;
  /** Folder-derived group from the catalog entry; required to evaluate manifest drift. */
  folderGroup?: ComponentGroupId;
  /**
   * Most recent renderer event captured by RendererHostPane. The pane accumulates
   * any `status === "undeclared"` entries here into the event-declaration drift
   * section; valid/invalid captures and `null` are ignored for drift purposes.
   */
  latestCapturedEvent?: CapturedRendererEvent | null;
}>();

// ── Status presentation ───────────────────────────────────────────────────────

const status = computed(() => deriveTestStatus(props.definition, props.manifestEntry));

// ── Manifest drift ────────────────────────────────────────────────────────────
// Surfaces SDK drift validator output (id / displayName / version / renderable /
// group / category) so authors can see contract divergence in the preview app
// the same way `npm run validate` would. The validator only reads a subset of
// ComponentManifest fields; the source-manifest summary covers all of them, so
// we lift the summary into a ComponentManifest-shaped value with empty entry
// paths (unread by the validator) to keep types honest without re-deriving the
// full per-component manifest at runtime.

function summaryAsManifest(
  summary: ComponentManifestSummary,
): Parameters<typeof findManifestDrift>[1] {
  return {
    schemaVersion: 1,
    id: summary.id,
    displayName: summary.displayName,
    group: summary.group,
    section: summary.section,
    tags: summary.tags,
    version: summary.version,
    renderable: summary.renderable,
    transformKind: "module",
    entry: { definition: "", renderer: "", configPanel: "" },
  };
}

/** True when both inputs needed to evaluate drift are available. */
const canEvaluateDrift = computed<boolean>(
  () => props.manifestEntry !== undefined && props.folderGroup !== undefined,
);

const driftIssues = computed<ManifestDriftIssue[]>(() => {
  if (!props.manifestEntry || !props.folderGroup) return [];
  return findManifestDrift(props.definition, summaryAsManifest(props.manifestEntry), {
    folderGroup: props.folderGroup,
  });
});

// ── Event-declaration drift ───────────────────────────────────────────────────
// Surfaces undeclared `emitEvent(id, …)` calls captured by RendererHostPane as a
// drift class alongside manifest drift (per docs/component-system-improvements-v1.md
// §1524). RendererHostPane only exposes the latest captured event; this pane
// accumulates undeclared entries deduped by event id so authors see every distinct
// id their renderer called that isn't declared on the definition. The list resets
// when the selected component changes so a stale entry from a prior selection
// never lingers across navigations.

const eventDeclarationDrift = ref<EventDeclarationDriftIssue[]>([]);
// Per-id capture id last folded in; lets us ignore prop re-emits for entries we
// already recorded while still updating the message when a newer capture arrives.
const recordedCaptureIdByEventId = new Map<string, number>();

function resetEventDeclarationDrift(): void {
  eventDeclarationDrift.value = [];
  recordedCaptureIdByEventId.clear();
}

watch(
  () => props.definition.id,
  () => resetEventDeclarationDrift(),
);

watch(
  () => props.latestCapturedEvent,
  (event) => {
    if (!event || event.status !== "undeclared") return;
    const previousCaptureId = recordedCaptureIdByEventId.get(event.eventId);
    if (previousCaptureId !== undefined && previousCaptureId >= event.id) return;
    recordedCaptureIdByEventId.set(event.eventId, event.id);
    const issue: EventDeclarationDriftIssue = {
      eventId: event.eventId,
      message: event.message ?? `Event "${event.eventId}" is not declared on this component.`,
    };
    const existingIndex = eventDeclarationDrift.value.findIndex(
      (entry) => entry.eventId === event.eventId,
    );
    if (existingIndex >= 0) {
      const next = eventDeclarationDrift.value.slice();
      next[existingIndex] = issue;
      eventDeclarationDrift.value = next;
    } else {
      eventDeclarationDrift.value = [...eventDeclarationDrift.value, issue];
    }
  },
  { immediate: true },
);

function statusLabel(kind: TestStatusKind): string {
  if (kind === "pass") return "Pass";
  if (kind === "fail") return "Fail";
  return "Unknown";
}

function statusColorClass(kind: TestStatusKind): string {
  if (kind === "pass") return "text-success font-semibold";
  if (kind === "fail") return "text-destructive font-semibold";
  return "text-muted-foreground";
}

// ── Author commands ────────────────────────────────────────────────────────────
// Mirrors packages/components/package.json scripts; workspace flag makes each
// command directly runnable from the repo root.

interface AuthorCommand {
  /** Script name — matches the key in package.json. */
  label: string;
  /** Short human description shown below the command line. */
  description: string;
  /** Exact command to copy and run. */
  command: string;
}

const AUTHOR_COMMANDS: AuthorCommand[] = [
  {
    label: "scaffold",
    description: "Scaffold a new component in the registry",
    command:
      'npm run scaffold --workspace @flow-builder/components -- --group content --folder promo-banner --id content.promo-banner --display-name "Promo Banner"',
  },
  {
    label: "generate",
    description: "Regenerate the catalog and source manifest",
    command: "npm run generate --workspace @flow-builder/components",
  },
  {
    label: "validate",
    description: "Validate the component library against the manifest",
    command: "npm run validate --workspace @flow-builder/components",
  },
  {
    label: "test:components",
    description: "Run all component-package tests",
    command: "npm run test:components --workspace @flow-builder/components",
  },
  {
    label: "check",
    description: "Full check: validate + typecheck + lint + tests",
    command: "npm run check --workspace @flow-builder/components",
  },
  {
    label: "preview:dev",
    description: "Start the component preview app in dev mode",
    command: "npm run preview:dev --workspace @flow-builder/components",
  },
  {
    label: "preview:build",
    description: "Build the component preview app",
    command: "npm run preview:build --workspace @flow-builder/components",
  },
];

// Tracks the most recently copied command; cleared after 1500 ms.
const copiedCommand = ref<string | null>(null);
let copiedTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Writes a command to the clipboard. No-ops silently when the Clipboard API is
 * absent (insecure/file: origins) or the write is rejected (permission denied).
 */
function copyCommand(command: string): void {
  if (!navigator.clipboard) return;
  navigator.clipboard
    .writeText(command)
    .then(() => {
      if (copiedTimer !== null) clearTimeout(copiedTimer);
      copiedCommand.value = command;
      copiedTimer = setTimeout(() => {
        copiedCommand.value = null;
        copiedTimer = null;
      }, 1500);
    })
    .catch(() => {});
}
</script>

<template>
  <!-- ── Validation readiness ────────────────────────────────────────── -->
  <!-- Statuses are deterministic package-readiness checks derived from
       manifest/module/catalog presence — not live test-run results.
       Use the copyable commands below for executable proof. -->
  <section
    class="mb-6"
    aria-labelledby="validation-readiness-heading"
    data-testid="validation-status-pane"
  >
    <h3
      id="validation-readiness-heading"
      class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1"
    >
      Validation readiness
    </h3>
    <p class="text-[10px] text-muted-foreground mb-3 leading-snug" data-testid="status-help-text">
      Derived from the package manifest and registered modules; run the
      <code class="font-code">check</code> command below for executable test proof.
    </p>

    <ul class="space-y-2" role="list" data-testid="status-rows">
      <li class="flex items-center justify-between text-sm" data-testid="status-row-contract">
        <span class="text-foreground">Contract manifest</span>
        <span
          :class="statusColorClass(status.contract)"
          class="text-xs tabular-nums"
          :data-testid="`status-badge-contract`"
          :aria-label="`Contract manifest: ${statusLabel(status.contract)}`"
        >
          {{ statusLabel(status.contract) }}
        </span>
      </li>

      <li class="flex items-center justify-between text-sm" data-testid="status-row-render">
        <span class="text-foreground">Renderer module</span>
        <span
          :class="statusColorClass(status.render)"
          class="text-xs tabular-nums"
          :data-testid="`status-badge-render`"
          :aria-label="`Renderer module: ${statusLabel(status.render)}`"
        >
          {{ statusLabel(status.render) }}
        </span>
      </li>

      <li class="flex items-center justify-between text-sm" data-testid="status-row-transform">
        <span class="text-foreground">Transform module</span>
        <span
          :class="statusColorClass(status.transform)"
          class="text-xs tabular-nums"
          :data-testid="`status-badge-transform`"
          :aria-label="`Transform module: ${statusLabel(status.transform)}`"
        >
          {{ statusLabel(status.transform) }}
        </span>
      </li>
    </ul>
  </section>

  <!-- ── Manifest drift ─────────────────────────────────────────────── -->
  <!-- Mirrors `npm run validate` drift checks (id, displayName, major version,
       renderable, manifest-group vs folder-group, group→category mapping)
       against the resolved definition and source-manifest summary. -->
  <section class="mb-6" aria-labelledby="manifest-drift-heading" data-testid="manifest-drift-pane">
    <h3
      id="manifest-drift-heading"
      class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1"
    >
      Manifest drift
    </h3>
    <p
      class="text-[10px] text-muted-foreground mb-3 leading-snug"
      data-testid="manifest-drift-help-text"
    >
      Compares the resolved component definition with its source-manifest entry; identical to the
      <code class="font-code">validate</code> command's drift checks.
    </p>

    <!-- Skipped: required inputs (manifest entry or catalog folder group) are absent -->
    <p
      v-if="!canEvaluateDrift"
      class="text-xs text-muted-foreground italic"
      data-testid="manifest-drift-skipped"
    >
      Drift check skipped — manifest entry or catalog group is unavailable.
    </p>

    <!-- Healthy: validator returned no issues -->
    <p
      v-else-if="driftIssues.length === 0"
      class="text-xs text-muted-foreground italic"
      data-testid="manifest-drift-healthy"
    >
      No manifest drift detected.
    </p>

    <!-- Issues: surface every drift entry with its field and message -->
    <ul
      v-else
      class="space-y-1.5"
      role="list"
      aria-label="Manifest drift issues"
      data-testid="manifest-drift-issues"
    >
      <li
        v-for="issue in driftIssues"
        :key="`${issue.componentId}:${issue.field}`"
        class="flex items-start gap-2 text-xs text-destructive"
        :data-testid="`manifest-drift-issue-${issue.field}`"
      >
        <span aria-hidden="true" class="shrink-0 font-semibold">⚠</span>
        <span class="flex-1 leading-relaxed">
          <span class="font-code text-[11px] mr-1">{{ issue.field }}</span>
          <span>{{ issue.message }}</span>
        </span>
      </li>
    </ul>
  </section>

  <!-- ── Event-declaration drift ────────────────────────────────────── -->
  <!-- Surfaces undeclared `emitEvent(id, …)` calls accumulated from
       RendererHostPane. Mirrors the manifest drift contract: the section is
       always present so authors learn it exists, but only renders issue entries
       when the renderer has actually attempted an undeclared emit. -->
  <section
    class="mb-6"
    aria-labelledby="event-declaration-drift-heading"
    data-testid="event-declaration-drift-pane"
  >
    <h3
      id="event-declaration-drift-heading"
      class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1"
    >
      Event declaration drift
    </h3>
    <p
      class="text-[10px] text-muted-foreground mb-3 leading-snug"
      data-testid="event-declaration-drift-help-text"
    >
      Flags renderer
      <code class="font-code">emitEvent</code>
      calls whose event id is not declared on
      <code class="font-code">definition.events</code>.
    </p>

    <p
      v-if="eventDeclarationDrift.length === 0"
      class="text-xs text-muted-foreground italic"
      data-testid="event-declaration-drift-healthy"
    >
      No undeclared events captured.
    </p>

    <ul
      v-else
      class="space-y-1.5"
      role="list"
      aria-label="Event declaration drift issues"
      data-testid="event-declaration-drift-issues"
    >
      <li
        v-for="issue in eventDeclarationDrift"
        :key="issue.eventId"
        class="flex items-start gap-2 text-xs text-destructive"
        :data-testid="`event-declaration-drift-issue-${issue.eventId}`"
      >
        <span aria-hidden="true" class="shrink-0 font-semibold">⚠</span>
        <span class="flex-1 leading-relaxed">
          <span class="font-code text-[11px] mr-1">{{ issue.eventId }}</span>
          <span>{{ issue.message }}</span>
        </span>
      </li>
    </ul>
  </section>

  <!-- ── Author commands ─────────────────────────────────────────────── -->
  <section
    class="mb-6"
    aria-labelledby="author-commands-heading"
    data-testid="author-commands-pane"
  >
    <h3
      id="author-commands-heading"
      class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
    >
      Author commands
    </h3>

    <ul class="space-y-3" role="list" data-testid="command-list">
      <li
        v-for="cmd in AUTHOR_COMMANDS"
        :key="cmd.label"
        class="flex flex-col gap-0.5"
        :data-testid="`command-item-${cmd.label}`"
      >
        <div class="flex items-center gap-2">
          <code
            class="flex-1 min-w-0 text-[11px] font-code text-foreground bg-muted/40 px-2 py-1 rounded overflow-x-auto whitespace-nowrap"
            :data-testid="`command-text-${cmd.label}`"
            >{{ cmd.command }}</code
          >
          <button
            type="button"
            :aria-label="
              copiedCommand === cmd.command ? `Copied ${cmd.label}` : `Copy ${cmd.label} command`
            "
            class="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :data-testid="`command-copy-${cmd.label}`"
            @click="copyCommand(cmd.command)"
          >
            {{ copiedCommand === cmd.command ? "Copied" : "Copy" }}
          </button>
        </div>
        <span class="text-[10px] text-muted-foreground pl-0.5">{{ cmd.description }}</span>
      </li>
    </ul>
  </section>
</template>

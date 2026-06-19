<script setup lang="ts">
// Module intent: renders the contract "interface" sections — Params, Events,
// and Event outputs — for the selected component. Extracted from
// ContractDetailsPane.vue to keep that file under the AGENTS.md hard cap.
// Behavior contract is preserved verbatim (Task 50.1, see
// docs/component-system-improvements-v1.md:1514-1527): each section renders
// from the definition's params / events / eventOutputs declarations and
// surfaces immediately, independent of fixture-data loading state.

import { computed } from "vue";
import type { ComponentDefinition, EventOutputBinding } from "@flow-builder/components/sdk";
import { buildEventRow, buildParamRow, type EventRow, type ParamRow } from "./contract-summary";

const props = defineProps<{
  /** Selected component definition; sections render from its declarations. */
  definition: ComponentDefinition;
}>();

// Best-effort one-line summaries derived from the SDK contract shapes. The
// summarization helpers live in ./contract-summary so this file stays focused
// on the markup/structure of the three interface sections.

const paramRows = computed<ParamRow[]>(() =>
  Object.entries(props.definition.params ?? {}).map(([key, descriptor]) =>
    buildParamRow(key, descriptor),
  ),
);

const eventRows = computed<EventRow[]>(() => (props.definition.events ?? []).map(buildEventRow));

const eventOutputRows = computed<readonly EventOutputBinding[]>(
  () => props.definition.eventOutputs ?? [],
);
</script>

<template>
  <!-- ── Params (from definition.params) ────────────────────────── -->
  <section class="mb-6" aria-labelledby="params-heading" data-testid="params-section">
    <h3
      id="params-heading"
      class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
    >
      Params
      <span class="font-normal normal-case tracking-normal text-muted-foreground/70"
        >({{ paramRows.length }})</span
      >
    </h3>
    <ul v-if="paramRows.length > 0" class="space-y-2" role="list">
      <li
        v-for="row in paramRows"
        :key="row.key"
        class="text-sm"
        :data-testid="`param-row-${row.key}`"
      >
        <div class="flex items-baseline gap-2">
          <span class="font-code text-xs text-info shrink-0 w-28 truncate">{{ row.key }}</span>
          <span class="text-foreground flex-1 font-code text-xs break-all">{{
            row.schemaSummary
          }}</span>
          <span
            class="text-[10px] font-code bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0"
            :data-testid="`param-control-${row.key}`"
            >{{ row.controlKind }}</span
          >
          <span
            v-if="row.bindable"
            class="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0"
            :data-testid="`param-bindable-${row.key}`"
            >bindable</span
          >
        </div>
        <p
          v-if="row.bindable && row.bindFrom.length > 0"
          class="mt-1 ml-30 text-[11px] text-muted-foreground font-code break-all"
          :data-testid="`param-bindfrom-${row.key}`"
        >
          from: {{ row.bindFrom.join(" · ") }}
        </p>
      </li>
    </ul>
    <p v-else class="text-xs text-muted-foreground italic" data-testid="params-empty">
      No declared params.
    </p>
  </section>

  <!-- ── Events (from definition.events) ────────────────────────── -->
  <section class="mb-6" aria-labelledby="events-heading" data-testid="events-section">
    <h3
      id="events-heading"
      class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
    >
      Events
      <span class="font-normal normal-case tracking-normal text-muted-foreground/70"
        >({{ eventRows.length }})</span
      >
    </h3>
    <ul v-if="eventRows.length > 0" class="space-y-2" role="list">
      <li
        v-for="event in eventRows"
        :key="event.id"
        class="text-sm"
        :data-testid="`event-row-${event.id}`"
      >
        <div class="flex items-baseline gap-2">
          <span class="font-code text-xs text-warning shrink-0 w-28 truncate">{{ event.id }}</span>
          <span class="text-foreground flex-1">{{ event.label }}</span>
          <span
            class="text-[10px] font-code bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0"
            :data-testid="`event-payload-${event.id}`"
            >{{ event.payloadSummary }}</span
          >
        </div>
        <p
          v-if="event.description"
          class="mt-0.5 ml-30 text-[11px] text-muted-foreground leading-relaxed"
        >
          {{ event.description }}
        </p>
      </li>
    </ul>
    <p v-else class="text-xs text-muted-foreground italic" data-testid="events-empty">
      No declared events.
    </p>
  </section>

  <!-- ── Event outputs (from definition.eventOutputs) ───────────── -->
  <section
    v-if="eventOutputRows.length > 0"
    class="mb-6"
    aria-labelledby="event-outputs-heading"
    data-testid="event-outputs-section"
  >
    <h3
      id="event-outputs-heading"
      class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
    >
      Event outputs
      <span class="font-normal normal-case tracking-normal text-muted-foreground/70"
        >({{ eventOutputRows.length }})</span
      >
    </h3>
    <ul class="space-y-2" role="list">
      <li
        v-for="(binding, index) in eventOutputRows"
        :key="`${binding.eventId}->${binding.outputId}-${index}`"
        class="flex items-baseline gap-2 text-sm"
        :data-testid="`event-output-row-${binding.eventId}`"
      >
        <span class="font-code text-xs text-warning shrink-0 w-28 truncate">{{
          binding.eventId
        }}</span>
        <span class="text-muted-foreground shrink-0" aria-hidden="true">→</span>
        <span class="font-code text-xs text-primary flex-1 break-all">{{ binding.outputId }}</span>
        <span
          v-if="binding.project"
          class="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0"
          >projected</span
        >
      </li>
    </ul>
  </section>
</template>

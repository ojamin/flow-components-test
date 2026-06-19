<script setup lang="ts">
// Module intent: presentational panel for the renderer host's captured-events
// buffer. Renders id + payload + validation status badge per entry, plus a
// Clear control. Status-classifying logic and the underlying buffer live in
// the useCapturedEvents composable; this component is purely visual so the
// host can stay focused on lifecycle/state-machine concerns.
//
// Status badges classify each entry:
//   - valid: payload satisfied the declared payloadSchema
//   - invalid: payload failed payloadSchema validation
//   - undeclared: renderer emitted an event id absent from definition.events
// The host never throws on bad emits — all surfacing happens here so authors
// can iterate on renderer code without crashing the preview.

import type { CapturedRendererEvent } from "../composables/useCapturedEvents";

defineProps<{
  events: readonly CapturedRendererEvent[];
}>();

defineEmits<{
  (e: "clear"): void;
}>();

/** JSON-pretty-print a payload for the panel; falls back gracefully on circular refs. */
function formatCapturedPayload(payload: unknown): string {
  try {
    const formatted = JSON.stringify(payload, null, 2);
    return formatted ?? String(payload);
  } catch {
    return String(payload);
  }
}

/** Tailwind classes for the small status badge next to each captured event id. */
function capturedStatusBadgeClass(status: CapturedRendererEvent["status"]): string {
  if (status === "valid") return "bg-success/15 text-success";
  if (status === "invalid") return "bg-warning/20 text-foreground";
  return "bg-destructive/15 text-destructive";
}
</script>

<template>
  <details
    class="mt-4 rounded-md border border-border/40 bg-muted/30"
    open
    data-testid="renderer-host-captured-events"
  >
    <summary class="cursor-pointer select-none flex items-center justify-between gap-2 px-3 py-2">
      <span class="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Captured events ({{ events.length }})
      </span>
      <button
        v-if="events.length > 0"
        type="button"
        class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
        data-testid="renderer-host-captured-events-clear"
        @click.stop.prevent="$emit('clear')"
      >
        Clear
      </button>
    </summary>
    <div class="px-3 pb-3 flex flex-col gap-2">
      <p
        v-if="events.length === 0"
        class="text-[11px] text-muted-foreground leading-relaxed"
        data-testid="renderer-host-captured-events-empty"
      >
        No events captured yet. Trigger an interaction in the preview to record an event.
      </p>
      <ul v-else class="flex flex-col gap-2 list-none m-0 p-0">
        <li
          v-for="entry in events"
          :key="entry.id"
          class="rounded border border-border/40 bg-background px-2 py-1.5 flex flex-col gap-1"
          :data-testid="`renderer-host-captured-event-${entry.status}`"
          :data-event-id="entry.eventId"
        >
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-code text-foreground">{{ entry.eventId }}</span>
            <span
              :class="capturedStatusBadgeClass(entry.status)"
              class="text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5"
            >
              {{ entry.status }}
            </span>
          </div>
          <pre
            class="text-[11px] font-code leading-snug whitespace-pre-wrap break-all m-0"
            data-testid="renderer-host-captured-event-payload"
            >{{ formatCapturedPayload(entry.payload) }}</pre
          >
          <p
            v-if="entry.message"
            class="text-[11px] leading-relaxed text-foreground/80"
            data-testid="renderer-host-captured-event-message"
          >
            {{ entry.message }}
          </p>
        </li>
      </ul>
    </div>
  </details>
</template>

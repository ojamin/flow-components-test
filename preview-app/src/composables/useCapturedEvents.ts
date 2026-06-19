// Module intent: captured-renderer-events state machine for the preview-app
// renderer host. Encapsulates the bounded buffer, validation classification,
// and definition-change reset that previously lived inline in
// RendererHostPane.vue. Logic only — the panel UI is rendered by a sibling
// component using the state returned here.
//
// Renderers receive a synchronous `emitEvent(eventId, payload)` callback (per
// docs/component-system-improvements-v1.md §1291-1311). The preview app
// records each emit so component authors can verify event id, payload, and
// validation status against the declared `events`/`payloadSchema` contract.
// Unlike the package test harness (which throws on undeclared/invalid emits
// to fail tests loudly), the preview app must surface those failures
// visually without crashing the host so authors can iterate.

import { computed, ref, watch, type Ref } from "vue";

import type { ComponentDefinition } from "@flow-builder/components/sdk";

export interface CapturedRendererEvent {
  id: number;
  eventId: string;
  payload: unknown;
  status: "valid" | "invalid" | "undeclared";
  message?: string;
}

interface UseCapturedEventsOptions {
  definitionRef: Ref<ComponentDefinition | undefined>;
  onLatestChange?: (latest: CapturedRendererEvent | null) => void;
}

// Bounded buffer so a runaway emitter cannot grow the panel without limit.
const MAX_CAPTURED_EVENTS = 50;

export function useCapturedEvents(options: UseCapturedEventsOptions) {
  const { definitionRef, onLatestChange } = options;

  const capturedEvents = ref<CapturedRendererEvent[]>([]);
  let nextCapturedEventId = 0;

  function recordCapturedEvent(entry: Omit<CapturedRendererEvent, "id">): void {
    const recorded: CapturedRendererEvent = { id: ++nextCapturedEventId, ...entry };
    const next: CapturedRendererEvent[] = [recorded];
    next.push(...capturedEvents.value);
    if (next.length > MAX_CAPTURED_EVENTS) next.length = MAX_CAPTURED_EVENTS;
    capturedEvents.value = next;
    onLatestChange?.(recorded);
  }

  function emitRendererEvent(eventId: string, payload: unknown): void {
    const definition = definitionRef.value;
    const event = definition?.events?.find((candidate) => candidate.id === eventId);
    if (!event) {
      recordCapturedEvent({
        eventId,
        payload,
        status: "undeclared",
        message: `Event "${eventId}" is not declared on this component.`,
      });
      return;
    }

    const result = event.payloadSchema.safeParse(payload);
    if (result.success) {
      recordCapturedEvent({ eventId, payload: result.data, status: "valid" });
      return;
    }

    const issueMessage =
      result.error.issues
        ?.map((issue) => issue.message)
        .filter(Boolean)
        .join("; ") || result.error.message;
    recordCapturedEvent({
      eventId,
      payload,
      status: "invalid",
      message: `Payload failed validation. ${issueMessage}`,
    });
  }

  function clearCapturedEvents(): void {
    capturedEvents.value = [];
    nextCapturedEventId = 0;
    onLatestChange?.(null);
  }

  // Reset whenever the selected definition changes so prior emits never bleed
  // into a new selection. Immediate so the parent receives a single null pulse
  // on mount, mirroring the contract that downstream surfaces (e.g. the parent
  // route's tracked latest-event ref) reset in lockstep with the panel.
  watch(
    definitionRef,
    () => {
      clearCapturedEvents();
    },
    { immediate: true },
  );

  /**
   * Most recent captured event regardless of status. Replay correctness depends
   * on this being the *actual* latest entry: replay must operate on the user's
   * most recent emit, not a stale valid emit shadowed by a subsequent
   * invalid/undeclared one. Eligibility for replay is derived from this entry's
   * status (see `canReplayLastEvent`).
   */
  const latestCapturedEvent = computed((): CapturedRendererEvent | null => {
    return capturedEvents.value[0] ?? null;
  });

  const hasDeclaredEvents = computed((): boolean => (definitionRef.value?.events?.length ?? 0) > 0);

  /**
   * Replay is only eligible when the most recent captured event passed schema
   * validation. After a valid emit followed by an invalid or undeclared emit,
   * the latest entry is no longer replayable — projecting the prior valid
   * payload would silently lie about the renderer's current behavior.
   */
  const canReplayLastEvent = computed((): boolean => latestCapturedEvent.value?.status === "valid");

  return {
    capturedEvents,
    emitRendererEvent,
    clearCapturedEvents,
    latestCapturedEvent,
    canReplayLastEvent,
    hasDeclaredEvents,
  };
}

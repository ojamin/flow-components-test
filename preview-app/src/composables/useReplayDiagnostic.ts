// Module intent: replay-last-event diagnostic state for the renderer host.
// Drives the "Replay last event" preview-control action: projects the most
// recent valid captured event's payload through the definition's
// `eventOutputs` bindings into runtimeOutputs, then surfaces a tone-coded
// banner so authors can verify event→output projection without re-clicking
// through the renderer.
//
// Replay correctness invariant: the caller passes the *actual* latest captured
// event. If that entry is not valid, replay is gated upstream (the action
// button is disabled). The handler asserts the same precondition defensively
// so a programmer mistake at the call site can never project stale payloads.

import { ref, watch, type Ref } from "vue";

import type { ComponentDefinition } from "@flow-builder/components/sdk";

import type { CapturedRendererEvent } from "./useCapturedEvents";

export type ReplayDiagnosticTone = "success" | "warning" | "error";

/** Per-output entry shown under a successful replay headline. */
export interface ReplayDiagnosticOutput {
  outputId: string;
  /** Compact, length-bounded value summary so long payloads stay readable in the banner. */
  formattedValue: string;
}

export interface ReplayDiagnostic {
  tone: ReplayDiagnosticTone;
  /** Single-line headline naming event id and the projection outcome. */
  headline: string;
  /** Projected output values shown under the headline on success only. */
  outputs?: readonly ReplayDiagnosticOutput[];
}

/** Maximum characters in a single formatted projected value before truncation. */
const REPLAY_VALUE_PREVIEW_LIMIT = 120;

/**
 * JSON-serialise a projected value into a compact one-line summary for the banner,
 * falling back to String(value) when the input is undefined or contains a circular ref.
 * Long values are truncated with an ellipsis to keep the banner from dominating the pane.
 */
function formatReplayValue(value: unknown): string {
  if (value === undefined) return "undefined";
  let formatted: string;
  try {
    const serialised = JSON.stringify(value);
    formatted = serialised ?? String(value);
  } catch {
    formatted = String(value);
  }
  if (formatted.length > REPLAY_VALUE_PREVIEW_LIMIT) {
    return `${formatted.slice(0, REPLAY_VALUE_PREVIEW_LIMIT - 1)}…`;
  }
  return formatted;
}

interface UseReplayDiagnosticOptions {
  definitionRef: Ref<ComponentDefinition | undefined>;
  latestCapturedEventRef: Ref<CapturedRendererEvent | null>;
  /** Merge projected outputs into the renderer's runtimeOutputs surface. */
  applyRuntimeOutputs: (outputs: Record<string, unknown>) => void;
}

export function useReplayDiagnostic(options: UseReplayDiagnosticOptions) {
  const { definitionRef, latestCapturedEventRef, applyRuntimeOutputs } = options;
  const replayDiagnostic = ref<ReplayDiagnostic | null>(null);

  function clearDiagnostic(): void {
    replayDiagnostic.value = null;
  }

  function runReplay(): void {
    const def = definitionRef.value;
    const last = latestCapturedEventRef.value;
    // Defensive: the caller gates the action on `canReplayLastEvent`, but we
    // reassert the precondition so a stale or non-valid entry can never reach
    // the projection path.
    if (!def || !last || last.status !== "valid") return;

    const bindings = def.eventOutputs?.filter((binding) => binding.eventId === last.eventId) ?? [];
    if (bindings.length === 0) {
      replayDiagnostic.value = {
        tone: "warning",
        headline: `No output mapping declared for event "${last.eventId}".`,
      };
      return;
    }

    const projected: Record<string, unknown> = {};
    const outputs: ReplayDiagnosticOutput[] = [];
    for (const binding of bindings) {
      try {
        const value = binding.project ? binding.project(last.payload) : last.payload;
        projected[binding.outputId] = value;
        outputs.push({ outputId: binding.outputId, formattedValue: formatReplayValue(value) });
      } catch (err) {
        const detail = err instanceof Error ? err.message : "projection threw";
        replayDiagnostic.value = {
          tone: "error",
          headline: `Replay projection failed for event "${last.eventId}" → output "${binding.outputId}": ${detail}.`,
        };
        return;
      }
    }

    applyRuntimeOutputs(projected);
    const noun = outputs.length === 1 ? "output" : "outputs";
    replayDiagnostic.value = {
      tone: "success",
      headline: `Replayed event "${last.eventId}" → ${outputs.length} ${noun} projected.`,
      outputs,
    };
  }

  // Stale diagnostic from a prior component must not linger across selections.
  watch(definitionRef, () => {
    clearDiagnostic();
  });

  return {
    replayDiagnostic,
    runReplay,
    clearDiagnostic,
  };
}

<script setup lang="ts">
// Module intent: presentational banner for the renderer host's "Replay last
// event" diagnostic. Tone-coded styling so success / warning / error are
// visually distinct; the projection logic, value formatting, and tone choice
// happen upstream in the useReplayDiagnostic composable.
//
// Stays mounted with role=status / aria-live=polite so screen readers
// announce projection outcomes inline rather than letting the action complete
// silently.

import { Icon } from "@iconify/vue";

import type { ReplayDiagnostic, ReplayDiagnosticTone } from "../composables/useReplayDiagnostic";

defineProps<{
  diagnostic: ReplayDiagnostic;
}>();

/** Tailwind classes for the replay diagnostic banner per tone. */
function replayDiagnosticClass(tone: ReplayDiagnosticTone): string {
  if (tone === "success") return "border-success/40 bg-success/10 text-foreground";
  if (tone === "warning") return "border-warning/40 bg-warning/10 text-foreground";
  return "border-destructive/40 bg-destructive/10 text-destructive";
}

/** Lucide icon name paired with the diagnostic tone for a quick visual cue in the banner. */
function replayDiagnosticIcon(tone: ReplayDiagnosticTone): string {
  if (tone === "success") return "lucide:check-circle-2";
  if (tone === "warning") return "lucide:alert-triangle";
  return "lucide:circle-x";
}
</script>

<template>
  <div
    :class="[
      'mb-3 flex items-start gap-2 rounded-md border px-2.5 py-2 text-[11px] leading-relaxed',
      replayDiagnosticClass(diagnostic.tone),
    ]"
    role="status"
    aria-live="polite"
    data-testid="renderer-host-replay-diagnostic"
    :data-tone="diagnostic.tone"
  >
    <Icon
      :icon="replayDiagnosticIcon(diagnostic.tone)"
      class="size-4 shrink-0 mt-px"
      aria-hidden="true"
    />
    <div class="flex flex-col gap-1 min-w-0 flex-1">
      <p class="font-medium" data-testid="renderer-host-replay-diagnostic-headline">
        {{ diagnostic.headline }}
      </p>
      <ul
        v-if="diagnostic.outputs && diagnostic.outputs.length > 0"
        class="flex flex-col gap-0.5 list-none m-0 p-0"
        data-testid="renderer-host-replay-diagnostic-outputs"
      >
        <li
          v-for="output in diagnostic.outputs"
          :key="output.outputId"
          class="font-code text-[11px] break-all"
          :data-output-id="output.outputId"
        >
          <span class="font-semibold">{{ output.outputId }}</span>
          <span aria-hidden="true"> = </span>
          <span>{{ output.formattedValue }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

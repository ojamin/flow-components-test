<script setup lang="ts">
/**
 * ConfigValidationFeedback — displays validation messages as a flat
 * severity-aware list suited to inspector rails.
 *
 * Accepts a flat array of messages and groups them visually by severity.
 * This component is read-only; it presents but does not modify validation state.
 */
import { computed } from "vue";
import { Icon } from "@iconify/vue";

import type { ConfigValidationMessage } from "./types";

const props = defineProps<{
  /** Validation messages to display. */
  messages: ConfigValidationMessage[];
}>();

const hasMessages = computed(() => props.messages.length > 0);

/** Maps severity to an icon and Alert-compatible variant. */
const severityMeta: Record<
  ConfigValidationMessage["severity"],
  { icon: string; variant: "default" | "destructive" | "warning" | "info" }
> = {
  error: {
    icon: "lucide:circle-x",
    variant: "destructive",
  },
  warning: {
    icon: "lucide:triangle-alert",
    variant: "warning",
  },
  info: {
    icon: "lucide:info",
    variant: "info",
  },
};

function metaFor(severity: ConfigValidationMessage["severity"]) {
  return severityMeta[severity];
}
</script>

<template>
  <div data-testid="config-validation-feedback">
    <p v-if="!hasMessages" class="text-xs text-muted-foreground/60" data-testid="validation-empty">
      No validation issues.
    </p>

    <ul v-else class="flex flex-col gap-1.5" role="list" aria-label="Validation messages">
      <li
        v-for="msg in messages"
        :key="msg.id"
        :data-severity="msg.severity"
        data-testid="validation-message"
        class="flex items-start gap-2 text-xs"
        role="listitem"
      >
        <Icon
          :icon="metaFor(msg.severity).icon"
          class="mt-0.5 size-3.5 shrink-0"
          :class="
            msg.severity === 'error'
              ? 'text-destructive'
              : msg.severity === 'warning'
                ? 'text-warning'
                : 'text-info'
          "
          aria-hidden="true"
        />
        <span
          :class="
            msg.severity === 'error'
              ? 'text-destructive'
              : msg.severity === 'warning'
                ? 'text-warning'
                : 'text-muted-foreground'
          "
        >
          {{ msg.message }}
        </span>
      </li>
    </ul>
  </div>
</template>

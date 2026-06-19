<script setup lang="ts">
// Module intent: presentational binding-input-stubs UI for the renderer host.
// Renders one textarea per allowed bindable input id, plus a diagnostic list
// for resolver issues / parse errors / schema failures. State (textarea
// values, parse classification) lives in useBindingInputStubs and the
// resolver in useParamResolution; this component is purely visual.

import type { ResolveParamIssue } from "@flow-builder/components/sdk";

import type { StubParseError } from "../composables/useBindingInputStubs";

defineProps<{
  bindableInputIds: readonly string[];
  /** Two-way bound stub text per input id; mutated by v-model on the textareas. */
  stubs: Record<string, string>;
  paramResolveIssues: readonly ResolveParamIssue[];
  stubParseErrors: readonly StubParseError[];
  schemaError: string | null;
  blockingError: string | null;
  hasParamDiagnostics: boolean;
}>();
</script>

<template>
  <details
    class="mb-3 rounded-md border border-border/40 bg-muted/30"
    data-testid="renderer-host-param-stubs"
  >
    <summary
      class="cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-3 py-2"
    >
      {{ bindableInputIds.length > 0 ? "Binding input stubs" : "Param diagnostics" }}
    </summary>
    <div class="px-3 pb-3 flex flex-col gap-2">
      <p
        v-if="bindableInputIds.length > 0"
        class="text-[11px] text-muted-foreground leading-relaxed"
      >
        JSON parses automatically (objects, arrays, numbers, booleans, null); other text is
        forwarded as a raw string. Empty stubs leave the bound param to its fallback.
      </p>
      <div v-for="inputId in bindableInputIds" :key="inputId" class="flex flex-col gap-1">
        <label
          :for="`renderer-host-stub-${inputId}`"
          class="text-[11px] font-semibold text-foreground"
        >
          Input <span class="font-code">{{ inputId }}</span>
        </label>
        <textarea
          :id="`renderer-host-stub-${inputId}`"
          v-model="stubs[inputId]"
          rows="2"
          spellcheck="false"
          class="text-[11px] font-code rounded border border-border/40 bg-background px-2 py-1 leading-snug focus:outline-none focus:ring-1 focus:ring-ring"
          :data-testid="`renderer-host-stub-input-${inputId}`"
          :placeholder="`JSON or text payload for input ${inputId}`"
        />
      </div>
      <ul
        v-if="hasParamDiagnostics"
        class="rounded border border-warning/40 bg-warning/10 px-2 py-1.5 text-[11px] text-foreground flex flex-col gap-1 list-none"
        role="status"
        aria-live="polite"
        data-testid="renderer-host-param-issues"
      >
        <li
          v-for="issue in paramResolveIssues"
          :key="`p-${issue.key}-${issue.reason}`"
          class="leading-relaxed"
        >
          <span class="font-semibold">{{ issue.key }}:</span> {{ issue.message }}
        </li>
        <li v-if="blockingError" class="leading-relaxed font-medium">
          Contract failure: {{ blockingError }}
        </li>
        <li v-for="err in stubParseErrors" :key="`s-${err.input}`" class="leading-relaxed">
          {{ err.message }}
        </li>
        <li v-if="schemaError" class="leading-relaxed font-medium">
          {{ schemaError }}
        </li>
      </ul>
    </div>
  </details>
</template>

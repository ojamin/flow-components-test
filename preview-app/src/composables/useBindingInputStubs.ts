// Module intent: binding-input-stubs state for the preview-app renderer host.
// Owns the per-input textarea text, the JSON-vs-raw-string parsing decision,
// and the union of allowed input ids for a definition's bindable params. Logic
// lives here so the host's setup script focuses on lifecycle/state-machines;
// the small textarea UI is rendered through a sibling component.

import { computed, ref, watch, type Ref } from "vue";

import {
  resolveAllowedParamBindSources,
  type ComponentDefinition,
} from "@flow-builder/components/sdk";

export interface StubParseError {
  input: string;
  message: string;
}

export interface InputStubParsing {
  values: Record<string, unknown>;
  errors: readonly StubParseError[];
}

interface UseBindingInputStubsOptions {
  definitionRef: Ref<ComponentDefinition | undefined>;
}

export function useBindingInputStubs(options: UseBindingInputStubsOptions) {
  const { definitionRef } = options;
  const inputStubs = ref<Record<string, string>>({});

  /** Union of input port ids that any bindable param's allowed sources reference. */
  const bindableInputIds = computed((): string[] => {
    const def = definitionRef.value;
    if (!def?.params) return [];
    const ids = new Set<string>();
    for (const descriptor of Object.values(def.params)) {
      if (!descriptor.meta.bindable) continue;
      for (const source of resolveAllowedParamBindSources(descriptor, def.inputs)) {
        ids.add(source.input);
      }
    }
    return [...ids];
  });

  // Sync inputStubs keys with bindableInputIds so v-model targets are stable
  // across selections and existing stub text is preserved when navigating
  // between similar definitions.
  watch(
    bindableInputIds,
    (ids) => {
      const next: Record<string, string> = {};
      for (const id of ids) next[id] = inputStubs.value[id] ?? "";
      inputStubs.value = next;
    },
    { immediate: true },
  );

  /**
   * Parse stub text per input id. Empty values are omitted so the resolver hits
   * the fallback path. Strings that look like JSON values are parsed and
   * surfaced as a parse error when malformed; plain text stays raw so authors
   * can exercise primitive.string inputs without quoting.
   */
  const inputStubParsing = computed<InputStubParsing>(() => {
    const values: Record<string, unknown> = {};
    const errors: StubParseError[] = [];
    for (const [inputId, raw] of Object.entries(inputStubs.value)) {
      if (raw === "") continue;
      const trimmed = raw.trim();
      const looksLikeJson = /^(\{|\[|"|-?\d|true$|false$|null$)/.test(trimmed);
      if (!looksLikeJson) {
        values[inputId] = raw;
        continue;
      }
      try {
        values[inputId] = JSON.parse(trimmed);
      } catch (err) {
        values[inputId] = raw;
        const detail = err instanceof Error ? err.message : "invalid JSON";
        errors.push({
          input: inputId,
          message: `Stub for input "${inputId}" is not valid JSON (${detail}); passing raw string instead.`,
        });
      }
    }
    return { values, errors };
  });

  return {
    inputStubs,
    bindableInputIds,
    inputStubParsing,
  };
}

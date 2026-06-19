// Module intent: derive resolved literal config for the renderer from the
// definition + param state + input-stub parsing. Encapsulates the
// `resolveParamValues` + `configSchema.safeParse` pipeline plus the issue
// surfaces (param resolve issues, stub parse errors, schema fallback message)
// so the host doesn't have to hand-wire computeds for each diagnostic source.
//
// Components without `params` are contract failures: the renderer host blocks
// rather than falling back to legacy config defaults.

import { computed, type ComputedRef, type Ref } from "vue";

import {
  resolveAllowedParamBindSources,
  resolveParamValues,
  type ComponentDefinition,
  type ParamValuesState,
  type ResolveParamIssue,
} from "@flow-builder/components/sdk";

import type { InputStubParsing, StubParseError } from "./useBindingInputStubs";

export interface ParamResolution {
  values: Record<string, unknown>;
  issues: readonly ResolveParamIssue[];
  schemaError: string | null;
  blockingError: string | null;
}

interface UseParamResolutionOptions {
  definitionRef: Ref<ComponentDefinition | undefined>;
  configRef: Ref<Record<string, unknown> | undefined>;
  paramValuesRef: Ref<ParamValuesState | undefined>;
  inputStubParsingRef: ComputedRef<InputStubParsing>;
}

export function useParamResolution(options: UseParamResolutionOptions) {
  const { definitionRef, configRef, paramValuesRef, inputStubParsingRef } = options;

  /**
   * Derived bind state used when the parent has not supplied controlled
   * `paramValues`. Only bind sources with an explicit `defaultPath` are seeded;
   * this avoids binding scalar params to object/array fixture roots by accident.
   */
  const derivedDefaultParamValues = computed<ParamValuesState>(() => {
    const def = definitionRef.value;
    if (!def?.params) return {};
    const state: ParamValuesState = {};
    for (const [key, descriptor] of Object.entries(def.params)) {
      if (!descriptor.meta.bindable) continue;
      const sources = resolveAllowedParamBindSources(descriptor, def.inputs);
      const source = sources.find((candidate) => candidate.defaultPath !== undefined);
      if (!source) continue;
      const fallback = (def.configDefaults as Record<string, unknown>)[key];
      state[key] = { mode: "bind", input: source.input, path: source.defaultPath ?? "$", fallback };
    }
    return state;
  });

  const effectiveParamValues = computed<ParamValuesState>(
    () => paramValuesRef.value ?? derivedDefaultParamValues.value,
  );

  const paramResolution = computed<ParamResolution>(() => {
    const def = definitionRef.value;
    const baseConfig = (configRef.value ?? def?.configDefaults ?? {}) as Record<string, unknown>;
    if (def && !def.params) {
      return {
        values: {},
        issues: [],
        schemaError: null,
        blockingError:
          "Component definition is missing params; package preview cannot resolve renderer config from legacy defaults.",
      };
    }
    if (!def) {
      return { values: {}, issues: [], schemaError: null, blockingError: null };
    }

    const resolution = resolveParamValues({
      params: def.params,
      state: effectiveParamValues.value,
      inputValues: inputStubParsingRef.value.values,
      inputPorts: def.inputs,
      defaults: { ...(def.configDefaults as Record<string, unknown>), ...baseConfig },
    });

    const parsed = def.configSchema.safeParse(resolution.values);
    if (parsed.success) {
      return {
        values: parsed.data as Record<string, unknown>,
        issues: resolution.issues,
        schemaError: null,
        blockingError: null,
      };
    }
    return {
      values: baseConfig,
      issues: resolution.issues,
      schemaError: "Resolved param values failed schema validation; rendering with default config.",
      blockingError: null,
    };
  });

  const resolvedConfig = computed(() => paramResolution.value.values);
  const paramResolveIssues = computed(() => paramResolution.value.issues);
  const stubParseErrors = computed<readonly StubParseError[]>(
    () => inputStubParsingRef.value.errors,
  );
  const schemaError = computed(() => paramResolution.value.schemaError);
  const blockingError = computed(() => paramResolution.value.blockingError);
  const hasParamDiagnostics = computed(
    () =>
      paramResolveIssues.value.length > 0 ||
      stubParseErrors.value.length > 0 ||
      schemaError.value !== null ||
      blockingError.value !== null,
  );

  return {
    derivedDefaultParamValues,
    resolvedConfig,
    paramResolveIssues,
    stubParseErrors,
    schemaError,
    blockingError,
    hasParamDiagnostics,
  };
}

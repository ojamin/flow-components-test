import type {
  ComponentParams,
  InputPortDefinition,
  ParamBindSource,
  ParamDescriptor,
} from "./component-definition";
import { isValidDataPath, resolveDataPath } from "./data-path-helpers";
import type { JsonValue } from "./schema-primitives";

export type ParamValueState =
  | { mode: "literal"; value: unknown }
  | { mode: "bind"; input: string; path: string; fallback?: unknown };

export type ParamValuesState = Record<string, ParamValueState>;

export interface ResolveParamValuesOptions {
  params: ComponentParams;
  state: ParamValuesState | undefined;
  inputValues: Record<string, unknown>;
  inputPorts: readonly InputPortDefinition[];
  defaults: Record<string, unknown>;
}

export interface ResolveParamIssue {
  key: string;
  reason: "not-bindable" | "stale-input" | "disallowed-input" | "invalid-path" | "missing-value";
  message: string;
}

export interface ResolveParamValuesResult {
  values: Record<string, unknown>;
  issues: readonly ResolveParamIssue[];
}

export function isValidJsonPath(path: string): boolean {
  return isValidDataPath(path, "jsonpath");
}

export function resolveParamValues({
  params,
  state,
  inputValues,
  inputPorts,
  defaults,
}: ResolveParamValuesOptions): ResolveParamValuesResult {
  const values: Record<string, unknown> = { ...defaults };
  const issues: ResolveParamIssue[] = [];
  if (!state) return { values, issues };

  for (const [key, valueState] of Object.entries(state) as [string, unknown][]) {
    const descriptor = params[key];
    if (!descriptor) continue;
    if (!isParamValueStateObject(valueState)) {
      issues.push(paramIssue(key, "invalid-path", `Param "${key}" has malformed persisted state.`));
      continue;
    }
    if (valueState.mode === "literal") {
      values[key] = valueState.value;
      continue;
    }
    if (valueState.mode !== "bind") {
      issues.push(
        paramIssue(
          key,
          "invalid-path",
          `Param "${key}" has unsupported mode "${String(valueState.mode)}".`,
        ),
      );
      continue;
    }
    if (!descriptor.meta.bindable) {
      issues.push(
        paramIssue(
          key,
          "not-bindable",
          `Param "${key}" is not bindable but persisted state is "bind".`,
        ),
      );
      continue;
    }
    if (typeof valueState.input !== "string") {
      issues.push(paramIssue(key, "stale-input", `Param "${key}" has invalid persisted input id.`));
      continue;
    }

    const allowedSources = resolveAllowedParamBindSources(descriptor, inputPorts);
    const inputExists = inputPorts.some((input) => input.id === valueState.input);
    if (!inputExists) {
      const availableInputs = inputPorts.map((input) => input.id).join(", ") || "(none)";
      issues.push(
        paramIssue(
          key,
          "stale-input",
          `Param "${key}" is bound to stale input "${valueState.input}"; available inputs: ${availableInputs}.`,
        ),
      );
      continue;
    }
    if (!allowedSources.some((source) => source.input === valueState.input)) {
      const compatibleInputs = allowedSources.map((source) => source.input).join(", ") || "(none)";
      issues.push(
        paramIssue(
          key,
          "disallowed-input",
          `Param "${key}" is bound to disallowed input "${valueState.input}"; compatible inputs: ${compatibleInputs}.`,
        ),
      );
      continue;
    }
    if (typeof valueState.path !== "string" || !isValidJsonPath(valueState.path)) {
      issues.push(
        paramIssue(
          key,
          "invalid-path",
          `Param "${key}" has invalid JSONPath: ${String(valueState.path)}.`,
        ),
      );
      continue;
    }

    const resolvedValue = readJsonPath(inputValues[valueState.input], valueState.path);
    if (resolvedValue === undefined) {
      const fallbackMessage =
        valueState.fallback !== undefined ? "; applying configured fallback" : "";
      issues.push(
        paramIssue(
          key,
          "missing-value",
          `Param "${key}" could not resolve path "${valueState.path}" from input "${valueState.input}"${fallbackMessage}.`,
        ),
      );
      if (valueState.fallback !== undefined) values[key] = valueState.fallback;
      continue;
    }
    values[key] = resolvedValue;
  }

  return { values, issues };
}

function isParamValueStateObject(value: unknown): value is {
  mode?: unknown;
  value?: unknown;
  input?: string;
  path?: string;
  fallback?: unknown;
} {
  return typeof value === "object" && value !== null;
}

export function resolveAllowedParamBindSources(
  descriptor: ParamDescriptor,
  inputPorts: readonly InputPortDefinition[],
): readonly ParamBindSource[] {
  if (!descriptor.meta.bindable) return [];
  const inputsById = new Map(inputPorts.map((input) => [input.id, input]));
  return (descriptor.meta.bindFrom ?? []).filter((source) => {
    const input = inputsById.get(source.input);
    return input
      ? input.acceptedTypeIds.includes(source.typeId) || input.acceptedTypeIds.includes("all-data")
      : false;
  });
}

function paramIssue(
  key: string,
  reason: ResolveParamIssue["reason"],
  message: string,
): ResolveParamIssue {
  return { key, reason, message };
}

/**
 * Supported JSONPath subset: `$` root, `.identifier` object keys, and `[<integer>]`
 * array indexes. Missing keys/indexes return undefined; malformed paths throw for direct misuse.
 */
function readJsonPath(root: unknown, path: string): unknown {
  if (!isValidJsonPath(path)) throw new Error(`Invalid JSONPath: ${path}`);
  const result = resolveDataPath(root as JsonValue | undefined, path);
  return result.ok ? result.value : undefined;
}

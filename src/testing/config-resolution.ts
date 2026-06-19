import type { ZodTypeAny } from "zod";

import { resolveAllowedParamBindSources, resolveParamValues } from "@flow-builder/components/sdk";
import type {
  ComponentDefinition,
  InputPortDefinition,
  ParamDescriptor,
  ParamValuesState,
} from "../sdk/public-sdk";

type StaticComponentDefinition = ComponentDefinition<any>;

export interface StaticComponentResolutionOptions {
  inputs?: Record<string, unknown>;
  paramValues?: ParamValuesState;
}

export function collectParamContractIssues(
  definition: StaticComponentDefinition,
  config: Record<string, unknown>,
  issues: string[],
) {
  if (!definition.params) return;

  const shape = getObjectShape(definition.configSchema);
  if (!shape) {
    issues.push("params are present but configSchema is not an object schema with a shape");
    return;
  }

  const paramEntries = Object.entries(definition.params);
  const configKeys = new Set(Object.keys(shape));

  for (const [key, descriptor] of paramEntries) {
    const configSchema = shape[key];
    if (!configSchema) {
      issues.push(`Param "${key}" is missing from configSchema.shape`);
      continue;
    }

    if (!areSchemasEquivalent(descriptor.schema, configSchema)) {
      issues.push(`Param "${key}" schema does not match configSchema.shape.${key}`);
    }
  }

  for (const key of configKeys) {
    if (!definition.params[key]) {
      issues.push(`Config schema field "${key}" has no matching params entry`);
    }
  }

  const resolvedInputs = resolveContractInputPorts(definition, config, issues);
  if (!resolvedInputs) return;

  for (const [key, descriptor] of paramEntries) {
    collectBindableParamIssues(key, descriptor, resolvedInputs, issues);
  }
}

export function parseComponentConfig(
  definition: StaticComponentDefinition,
  config?: unknown,
): Record<string, unknown> {
  const result = definition.configSchema.safeParse(config ?? definition.configDefaults);

  if (!result.success || !isRecord(result.data)) {
    throw new Error("Static component config must satisfy the schema and resolve to an object.");
  }

  return result.data;
}

export function resolveComponentConfig(
  definition: StaticComponentDefinition,
  config: unknown,
  options: StaticComponentResolutionOptions,
): Record<string, unknown> {
  const defaults = parseComponentConfig(definition, config);
  if (!options.paramValues) return defaults;

  const issues: string[] = [];
  const inputPorts = resolveContractInputPorts(definition, defaults, issues);
  if (!inputPorts) throw new Error(issues.join("\n"));

  const resolved = resolveParamValues({
    params: definition.params,
    state: options.paramValues,
    inputValues: options.inputs ?? {},
    inputPorts,
    defaults,
  });

  if (resolved.issues.length > 0) {
    throw new Error(resolved.issues.map((issue) => issue.message).join("\n"));
  }

  return parseComponentConfig(definition, resolved.values);
}

export function assertNoRawConfigStateProps(rawProps: Record<string, unknown>, context: string) {
  for (const key of ["paramValues", "fields"] as const) {
    if (key in rawProps) {
      throw new Error(
        `Static component ${context} tests must not pass raw ${key} to the component; use the harness paramValues option and assert resolved config instead.`,
      );
    }
  }
}

function collectBindableParamIssues(
  key: string,
  descriptor: ParamDescriptor,
  inputPorts: readonly InputPortDefinition[],
  issues: string[],
) {
  if (!descriptor.meta.bindable) return;

  if (!descriptor.meta.bindFrom || descriptor.meta.bindFrom.length === 0) {
    issues.push(`Bindable param "${key}" must declare non-empty bindFrom`);
    return;
  }

  const inputsById = new Map(inputPorts.map((input) => [input.id, input]));

  for (const source of descriptor.meta.bindFrom) {
    const input = inputsById.get(source.input);
    if (!input) {
      issues.push(`Bindable param "${key}" bindFrom input "${source.input}" does not exist`);
      continue;
    }

    if (
      !input.acceptedTypeIds.includes(source.typeId) &&
      !input.acceptedTypeIds.includes("all-data")
    ) {
      issues.push(
        `Bindable param "${key}" bindFrom source "${source.input}" type "${source.typeId}" is not compatible with accepted types ${input.acceptedTypeIds.join(", ")}`,
      );
    }
  }

  if (resolveAllowedParamBindSources(descriptor, inputPorts).length === 0) {
    issues.push(`Bindable param "${key}" has no compatible resolved input`);
  }
}

function resolveContractInputPorts(
  definition: StaticComponentDefinition,
  config: Record<string, unknown>,
  issues: string[],
): readonly InputPortDefinition[] | undefined {
  if (!definition.resolvePorts) return definition.inputs;

  try {
    return definition.resolvePorts({
      config,
      inputs: definition.inputs,
      outputs: definition.outputs,
    }).inputs;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    issues.push(`resolvePorts failed during params validation: ${message}`);
    return undefined;
  }
}

function getObjectShape(schema: ZodTypeAny): Record<string, ZodTypeAny> | undefined {
  const candidate = schema as ZodTypeAny & { shape?: unknown };
  return isRecord(candidate.shape) ? (candidate.shape as Record<string, ZodTypeAny>) : undefined;
}

function areSchemasEquivalent(paramSchema: ZodTypeAny, configSchema: ZodTypeAny): boolean {
  if (paramSchema === configSchema) return true;

  const paramDef = stringifyZodDef(paramSchema);
  const configDef = stringifyZodDef(configSchema);

  return paramDef !== undefined && paramDef === configDef;
}

function stringifyZodDef(schema: ZodTypeAny): string | undefined {
  try {
    return JSON.stringify((schema as ZodTypeAny & { _def?: unknown })._def);
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

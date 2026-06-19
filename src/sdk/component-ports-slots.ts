import type { ZodTypeAny } from "zod";

import { parseComponentConfig } from "./component-definition-factory";
import type {
  ComponentConfig,
  ComponentConfigInput,
  ComponentDefinition,
  ResolvedPorts,
  SlotDefinition,
} from "./component-definition-types";

export function resolveComponentPorts<TSchema extends ZodTypeAny>(
  definition: ComponentDefinition<TSchema>,
  config: ComponentConfigInput<TSchema> | ComponentConfig<TSchema> = definition.configDefaults,
): ResolvedPorts {
  const parsedConfig = parseComponentConfig(definition.configSchema, config);
  const resolvedPorts = definition.resolvePorts?.({
    config: parsedConfig,
    inputs: definition.inputs,
    outputs: definition.outputs,
  });

  return {
    inputs: [...(resolvedPorts?.inputs ?? definition.inputs)],
    outputs: [...(resolvedPorts?.outputs ?? definition.outputs)],
  };
}

export function resolveComponentSlots<TSchema extends ZodTypeAny>(
  definition: ComponentDefinition<TSchema>,
  config: ComponentConfigInput<TSchema> | ComponentConfig<TSchema> = definition.configDefaults,
): SlotDefinition[] {
  if (!definition.resolveSlots) {
    return [...definition.slots];
  }

  const parsedConfigResult = definition.configSchema.safeParse(config);

  if (!parsedConfigResult.success || !isPlainObject(parsedConfigResult.data)) {
    return [...definition.slots];
  }

  const resolvedSlots = definition.resolveSlots({
    config: parsedConfigResult.data as ComponentConfig<TSchema>,
    slots: definition.slots,
  });

  return [...resolvedSlots.slots];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

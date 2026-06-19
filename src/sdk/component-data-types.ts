import { getDataTypeDefinition } from "./data-types";
import type { OutputPortDefinition, PortOutputMap } from "./component-definition-types";

export function safeParseDataTypeValue<TValue = unknown>(typeId: string, value: unknown) {
  const dataTypeDefinition = getDataTypeDefinition(typeId);

  if (!dataTypeDefinition) {
    return {
      success: false as const,
      error: new Error(`Unknown data type "${typeId}".`),
    };
  }

  const result = dataTypeDefinition.schema.safeParse(value);

  if (!result.success) {
    return {
      success: false as const,
      error: new Error(`Value does not satisfy data type "${typeId}".`, { cause: result.error }),
    };
  }

  return {
    success: true as const,
    value: result.data as TValue,
  };
}

export function parseDataTypeValue<TValue = unknown>(typeId: string, value: unknown): TValue {
  const result = safeParseDataTypeValue<TValue>(typeId, value);

  if (!result.success) {
    throw result.error;
  }

  return result.value;
}

export function shapePortOutputs<const TOutputs extends readonly OutputPortDefinition[]>(
  outputDefinitions: TOutputs,
  outputs: Record<string, unknown>,
): PortOutputMap<TOutputs> {
  const outputDefinitionsById = new Map(
    outputDefinitions.map((definition) => [definition.id, definition]),
  );
  const shapedOutputs: Record<string, unknown> = {};
  const issues: string[] = [];

  for (const [portId, value] of Object.entries(outputs)) {
    if (value === undefined) continue;

    const outputDefinition = outputDefinitionsById.get(portId);

    if (!outputDefinition) {
      issues.push(`Unknown output port "${portId}".`);
      continue;
    }

    const parsedValue = safeParseDataTypeValue(outputDefinition.typeId, value);

    if (!parsedValue.success) {
      issues.push(`Output port "${portId}" failed validation: ${parsedValue.error.message}`);
      continue;
    }

    shapedOutputs[portId] = parsedValue.value;
  }

  if (issues.length > 0) {
    throw new Error(`Invalid component outputs. ${issues.join(" ")}`);
  }

  return shapedOutputs as PortOutputMap<TOutputs>;
}

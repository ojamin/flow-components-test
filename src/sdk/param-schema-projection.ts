import { z, type ZodTypeAny } from "zod";

import type { ComponentParams, ParamControl, ParamDescriptor } from "./component-definition";
import type { JsonValue } from "./schema-primitives";

export type ParamSchemaProjectionType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "enum"
  | "null"
  | "unknown";

export interface ParamSchemaProjection {
  type: ParamSchemaProjectionType;
  schemaTypes?: readonly string[];
  properties?: Record<string, ParamSchemaProjection>;
  items?: ParamSchemaProjection;
  required?: readonly string[];
  enumValues?: readonly JsonValue[];
  defaultValue?: JsonValue;
  placeholder?: string;
  description?: string;
}

type JsonSchemaObject = Record<string, unknown>;

export function projectComponentParamSchemas(
  params: ComponentParams,
): Record<string, ParamSchemaProjection> {
  return Object.fromEntries(
    Object.entries(params).map(([key, descriptor]) => [key, projectParamSchema(descriptor)]),
  );
}

export function projectParamSchema(descriptor: ParamDescriptor): ParamSchemaProjection {
  const manualProjection = readManualProjection(descriptor.meta.schemaProjection);
  const jsonSchema = toJsonSchemaObject(descriptor.schema);
  const projection = manualProjection ?? projectJsonSchema(jsonSchema);
  const controlPlaceholder = getControlPlaceholder(descriptor.meta.control);

  if (!projection.placeholder && controlPlaceholder) {
    return { ...projection, placeholder: controlPlaceholder };
  }

  return projection;
}

function readManualProjection(value: unknown): ParamSchemaProjection | undefined {
  if (!isPlainObject(value)) return undefined;
  const type =
    typeof value.type === "string" && isProjectionType(value.type) ? value.type : undefined;
  if (!type) return undefined;
  return {
    type,
    ...(Array.isArray(value.schemaTypes)
      ? { schemaTypes: readStringArray(value.schemaTypes) }
      : {}),
    ...(isPlainObject(value.properties)
      ? { properties: projectManualProperties(value.properties) ?? {} }
      : {}),
    ...(isPlainObject(value.items)
      ? { items: readManualProjection(value.items) ?? projectJsonSchema(value.items) }
      : {}),
    ...(Array.isArray(value.required) ? { required: readStringArray(value.required) } : {}),
    ...(Array.isArray(value.enumValues) ? { enumValues: readJsonArray(value.enumValues) } : {}),
    ...jsonValueField("defaultValue", value.defaultValue),
    ...stringField("placeholder", value.placeholder),
    ...stringField("description", value.description),
  };
}

function projectManualProperties(
  value: unknown,
): Record<string, ParamSchemaProjection> | undefined {
  if (!isPlainObject(value)) return undefined;

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, propertySchema]) => {
      if (!isPlainObject(propertySchema)) return [];
      return [[key, readManualProjection(propertySchema) ?? projectJsonSchema(propertySchema)]];
    }),
  );
}

function projectJsonSchema(schema: JsonSchemaObject | undefined): ParamSchemaProjection {
  if (!schema) return { type: "unknown" };

  const enumValues = readJsonArray(schema.enum);
  const schemaTypes = readSchemaTypes(schema.type);
  const type = enumValues.length > 0 ? "enum" : chooseProjectionType(schemaTypes);
  const projection: ParamSchemaProjection = {
    type,
    ...(schemaTypes.length > 1 ? { schemaTypes } : {}),
    ...(enumValues.length > 0 ? { enumValues } : {}),
    ...jsonValueField("defaultValue", schema.default),
    ...stringField("placeholder", schema.placeholder),
    ...stringField("description", schema.description),
  };

  const properties = projectProperties(schema.properties);
  if (properties) projection.properties = properties;

  const items = projectItems(schema.items);
  if (items) projection.items = items;

  const required = readStringArray(schema.required);
  if (required.length > 0) projection.required = required;

  return projection;
}

function toJsonSchemaObject(schema: ZodTypeAny): JsonSchemaObject | undefined {
  try {
    const projected = z.toJSONSchema(schema);
    return isPlainObject(projected) ? projected : undefined;
  } catch {
    return undefined;
  }
}

function projectProperties(value: unknown): Record<string, ParamSchemaProjection> | undefined {
  if (!isPlainObject(value)) return undefined;

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, propertySchema]) => {
      if (!isPlainObject(propertySchema)) return [];
      return [[key, projectJsonSchema(propertySchema)]];
    }),
  );
}

function projectItems(value: unknown): ParamSchemaProjection | undefined {
  return isPlainObject(value) ? projectJsonSchema(value) : undefined;
}

function chooseProjectionType(types: readonly string[]): ParamSchemaProjectionType {
  const primaryType = types.find((type) => type !== "null") ?? types[0];
  if (isProjectionType(primaryType)) return primaryType;
  return "unknown";
}

function readSchemaTypes(value: unknown): readonly string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  return [];
}

function readStringArray(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function readJsonArray(value: unknown): readonly JsonValue[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const jsonValue = toJsonValue(item);
    return jsonValue === undefined ? [] : [jsonValue];
  });
}

function jsonValueField<TKey extends string>(
  key: TKey,
  value: unknown,
): Record<TKey, JsonValue> | {} {
  const jsonValue = toJsonValue(value);
  return jsonValue === undefined ? {} : ({ [key]: jsonValue } as Record<TKey, JsonValue>);
}

function stringField<TKey extends string>(key: TKey, value: unknown): Record<TKey, string> | {} {
  return typeof value === "string" && value.length > 0
    ? ({ [key]: value } as Record<TKey, string>)
    : {};
}

function toJsonValue(value: unknown): JsonValue | undefined {
  if (value === undefined || typeof value === "function" || typeof value === "symbol") {
    return undefined;
  }

  try {
    return JSON.parse(JSON.stringify(value)) as JsonValue;
  } catch {
    return undefined;
  }
}

function getControlPlaceholder(control: ParamControl): string | undefined {
  for (const key of placeholderKeys) {
    const value = (control as Record<string, unknown>)[key];
    if (typeof value === "string" && value.length > 0) return value;
  }

  return undefined;
}

function isPlainObject(value: unknown): value is JsonSchemaObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProjectionType(value: string | undefined): value is ParamSchemaProjectionType {
  return Boolean(value && projectionTypes.has(value as ParamSchemaProjectionType));
}

const projectionTypes = new Set<ParamSchemaProjectionType>([
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
  "enum",
  "null",
]);

const placeholderKeys = [
  "placeholder",
  "itemPlaceholder",
  "keyPlaceholder",
  "valuePlaceholder",
  "hashSlugPlaceholder",
  "sourcePlaceholder",
  "outputPlaceholder",
  "rowsPlaceholder",
] as const;

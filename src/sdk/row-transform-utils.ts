import type { JsonObject, JsonValue } from "./schema-primitives";
import {
  assertSafeRowTransformOutputField,
  type RowAggregateOperation,
} from "./row-transform-engine-types";
import { deriveOutputFieldName, readRowField, resolveRowSource } from "./transform-contracts";

export function resolveObjectRows(data: JsonValue | undefined, rowsPath: string): JsonObject[] {
  return resolveRowSource(data, rowsPath)
    .filter(isJsonObject)
    .map((row) => cloneJsonObject(row));
}

export function setOutputField(
  output: JsonObject,
  field: string,
  value: JsonValue,
  configPath: string,
): void {
  const safeField = assertSafeRowTransformOutputField(field, configPath);
  Object.defineProperty(output, safeField, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
}

export function cloneRowWithOutputField(
  row: JsonObject,
  field: string,
  value: JsonValue,
  configPath: string,
): JsonObject {
  const next = cloneJsonObject(row);
  setOutputField(next, field, value, configPath);
  return next;
}

export function validateOutputField(field: string, configPath: string): string {
  return assertSafeRowTransformOutputField(field, configPath);
}

export function validateDerivedOutputField(sourceField: string, configPath: string): string {
  return assertSafeRowTransformOutputField(deriveOutputFieldName(sourceField), configPath);
}

export function validateGeneratedOutputField(field: string, configPath: string): string {
  return assertSafeRowTransformOutputField(field, configPath);
}

export function validateAggregateOutputField(
  aggregate: {
    readonly sourceField?: string;
    readonly operation: RowAggregateOperation;
    readonly outputField: string;
  },
  configPath: string,
): string {
  const name =
    aggregate.outputField.trim() ||
    `${aggregate.operation}_${aggregate.sourceField ? deriveOutputFieldName(aggregate.sourceField) : "rows"}`;
  return assertSafeRowTransformOutputField(name, configPath);
}

export function validateGroupByOutputFields(
  groupByFields: readonly string[],
  configPath: string,
): string[] {
  return groupByFields.map((field, index) =>
    validateDerivedOutputField(field, `${configPath}[${index}]`),
  );
}

export function validateCountOutputField(countField: string, configPath: string): string {
  return assertSafeRowTransformOutputField(countField, configPath);
}

export function compareValues(left: JsonValue | undefined, right: JsonValue | undefined): number {
  if (left === undefined || left === null) return right === undefined || right === null ? 0 : 1;
  if (right === undefined || right === null) return -1;
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right));
}

export function containsValue(
  value: JsonValue | undefined,
  expected: JsonValue | undefined,
): boolean {
  if (typeof value === "string") return value.includes(String(expected ?? ""));
  if (Array.isArray(value))
    return value.some((entry) => stableStringify(entry) === stableStringify(expected ?? null));
  return false;
}

export function computeAggregate(
  operation: RowAggregateOperation,
  rows: readonly JsonObject[],
  sourceField: string | undefined,
): JsonValue {
  if (operation === "count") return rows.length;
  const values = rows
    .map((row) => (sourceField ? readRowField(row, sourceField) : undefined))
    .filter(isFiniteNumber);
  if (values.length === 0) return operation === "sum" ? 0 : null;
  if (operation === "sum") return values.reduce((total, value) => total + value, 0);
  if (operation === "min") return Math.min(...values);
  if (operation === "max") return Math.max(...values);
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function readOrNull(row: JsonObject, field: string): JsonValue {
  return readRowField(row, field) ?? null;
}

export function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function sanitizeFieldName(value: string): string {
  return (
    value
      .trim()
      .replace(/[^A-Za-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "") || "value"
  );
}

export function createUniqueOutputField(baseName: string, usedOutputFields: Set<string>): string {
  let candidate = baseName;
  let suffix = 2;
  while (usedOutputFields.has(candidate)) {
    candidate = `${baseName}_${suffix}`;
    suffix += 1;
  }
  usedOutputFields.add(candidate);
  return candidate;
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  if (isJsonObject(value as JsonValue)) {
    return `{${Object.keys(value as JsonObject)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify((value as JsonObject)[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function cloneJsonObject(value: JsonObject): JsonObject {
  return cloneJsonValue(value) as JsonObject;
}

export function cloneJsonValue(value: JsonValue): JsonValue {
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

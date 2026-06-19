import type { JsonObject, JsonValue } from "./schema-primitives";
import { createStableRowKey, deriveOutputFieldName, readRowField } from "./transform-contracts";
import {
  cloneJsonValue,
  cloneRowWithOutputField,
  readOrNull,
  stableStringify,
  setOutputField,
  validateDerivedOutputField,
  validateGeneratedOutputField,
  validateOutputField,
} from "./row-transform-utils";

export function projectRow(
  row: JsonObject,
  fields: readonly { readonly sourceField: string; readonly outputField?: string }[],
): JsonObject {
  const projected: JsonObject = {};
  fields.forEach((field, index) => {
    setOutputField(
      projected,
      field.outputField ?? deriveOutputFieldName(field.sourceField),
      readOrNull(row, field.sourceField),
      field.outputField ? `fields[${index}].outputField` : `fields[${index}].sourceField`,
    );
  });
  return projected;
}

export function flattenRows(
  rows: readonly JsonObject[],
  field: string,
  outputField: string | undefined,
  keepEmpty: boolean,
): JsonObject[] {
  const name = outputField
    ? validateOutputField(outputField, "outputField")
    : validateDerivedOutputField(field, "field");
  const flattened: JsonObject[] = [];
  for (const row of rows) {
    const value = readRowField(row, field);
    if (Array.isArray(value)) {
      if (value.length === 0 && keepEmpty)
        flattened.push(cloneRowWithOutputField(row, name, null, "outputField"));
      else
        for (const entry of value)
          flattened.push(cloneRowWithOutputField(row, name, cloneJsonValue(entry), "outputField"));
    } else if (keepEmpty) {
      flattened.push(cloneRowWithOutputField(row, name, value ?? null, "outputField"));
    }
  }
  return flattened;
}

export function dedupeRows(
  rows: readonly JsonObject[],
  keyFields: readonly string[],
  keep: "first" | "last",
): JsonObject[] {
  const byKey = new Map<string, JsonObject>();
  for (const row of rows) {
    const key =
      keyFields.length > 0
        ? stableStringify(keyFields.map((field) => readOrNull(row, field)))
        : createStableRowKey(row);
    if (keep === "last" || !byKey.has(key)) byKey.set(key, row);
  }
  return [...byKey.values()];
}

export function dateBucketRows(
  rows: readonly JsonObject[],
  field: string,
  outputField: string | undefined,
  granularity: "hour" | "day" | "week" | "month" | "year",
): JsonObject[] {
  const name = outputField
    ? validateOutputField(outputField, "outputField")
    : validateGeneratedOutputField(
        `${deriveOutputFieldName(field)}_${granularity}`,
        "field/granularity",
      );
  return rows.map((row) =>
    cloneRowWithOutputField(
      row,
      name,
      bucketDate(readRowField(row, field), granularity),
      "outputField",
    ),
  );
}

function bucketDate(
  value: JsonValue | undefined,
  granularity: "hour" | "day" | "week" | "month" | "year",
): string | null {
  const date = new Date(
    typeof value === "number" || typeof value === "string" ? value : Number.NaN,
  );
  if (Number.isNaN(date.getTime())) return null;
  if (granularity === "year") return `${date.getUTCFullYear()}`;
  if (granularity === "month") return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}`;
  if (granularity === "week") {
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() - day + 1);
  }
  const dayPrefix = `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
  return granularity === "hour" ? `${dayPrefix}T${pad2(date.getUTCHours())}:00:00.000Z` : dayPrefix;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

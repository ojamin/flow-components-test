import type { JsonObject, JsonValue } from "./schema-primitives";
import { deriveOutputFieldName, readRowField } from "./transform-contracts";
import {
  cloneJsonObject,
  isFiniteNumber,
  setOutputField,
  validateGeneratedOutputField,
  validateOutputField,
} from "./row-transform-utils";

export function normalizeRows(
  rows: readonly JsonObject[],
  fields: readonly {
    readonly sourceField: string;
    readonly outputField?: string;
    readonly method: "minMax" | "zScore";
  }[],
): JsonObject[] {
  const stats = new Map<string, { min: number; max: number; mean: number; stdev: number }>();
  for (const field of fields) {
    const values = rows.map((row) => readRowField(row, field.sourceField)).filter(isFiniteNumber);
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const mean = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    const stdev = Math.sqrt(
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length || 1),
    );
    stats.set(field.sourceField, { min, max, mean, stdev });
  }
  return rows.map((row) => {
    const next = cloneJsonObject(row);
    fields.forEach((field, index) => {
      const value = readRowField(row, field.sourceField);
      const stat = stats.get(field.sourceField)!;
      const name = field.outputField
        ? validateOutputField(field.outputField, `fields[${index}].outputField`)
        : validateGeneratedOutputField(
            `${deriveOutputFieldName(field.sourceField)}_${field.method}`,
            `fields[${index}].sourceField/method`,
          );
      setOutputField(
        next,
        name,
        isFiniteNumber(value) ? normalizeNumber(value, stat, field.method) : null,
        `fields[${index}]`,
      );
    });
    return next;
  });
}

export function formatRows(
  rows: readonly JsonObject[],
  fields: readonly {
    readonly sourceField: string;
    readonly outputField?: string;
    readonly format: string;
    readonly decimals: number;
  }[],
): JsonObject[] {
  return rows.map((row) => {
    const next = cloneJsonObject(row);
    fields.forEach((field, index) => {
      setOutputField(
        next,
        field.outputField ?? deriveOutputFieldName(field.sourceField),
        formatValue(readRowField(row, field.sourceField), field.format, field.decimals),
        field.outputField ? `fields[${index}].outputField` : `fields[${index}].sourceField`,
      );
    });
    return next;
  });
}

function normalizeNumber(
  value: number,
  stat: { min: number; max: number; mean: number; stdev: number },
  method: "minMax" | "zScore",
): number {
  if (method === "zScore") return stat.stdev === 0 ? 0 : (value - stat.mean) / stat.stdev;
  return stat.max === stat.min ? 0 : (value - stat.min) / (stat.max - stat.min);
}

function formatValue(value: JsonValue | undefined, format: string, decimals: number): JsonValue {
  if (value === undefined || value === null) return null;
  if (format === "uppercase") return String(value).toUpperCase();
  if (format === "lowercase") return String(value).toLowerCase();
  if (format === "trim") return String(value).trim();
  if (format === "numberFixed") return isFiniteNumber(value) ? value.toFixed(decimals) : null;
  if (format === "dateIso") {
    const date = new Date(
      typeof value === "number" || typeof value === "string" ? value : Number.NaN,
    );
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return String(value);
}

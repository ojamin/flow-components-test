import type { JsonObject, JsonValue } from "./schema-primitives";
import type { RowFilterOperator } from "./row-transform-engine-types";
import { readRowField } from "./transform-contracts";
import { compareValues, containsValue, stableStringify } from "./row-transform-utils";

export function sortRows(
  rows: readonly JsonObject[],
  keys: readonly { readonly field: string; readonly direction: "asc" | "desc" }[],
): JsonObject[] {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      for (const key of keys) {
        const comparison = compareValues(
          readRowField(left.row, key.field),
          readRowField(right.row, key.field),
        );
        if (comparison !== 0) return key.direction === "desc" ? -comparison : comparison;
      }
      return left.index - right.index;
    })
    .map((entry) => entry.row);
}

export function filterRows(
  rows: readonly JsonObject[],
  clauses: readonly {
    readonly field: string;
    readonly operator: RowFilterOperator;
    readonly value?: JsonValue;
  }[],
  match: "all" | "any",
): JsonObject[] {
  return rows.filter((row) => {
    const results = clauses.map((clause) =>
      evaluateFilter(readRowField(row, clause.field), clause.operator, clause.value),
    );
    return match === "all" ? results.every(Boolean) : results.some(Boolean);
  });
}

function evaluateFilter(
  value: JsonValue | undefined,
  operator: RowFilterOperator,
  expected: JsonValue | undefined,
): boolean {
  switch (operator) {
    case "equals":
      return stableStringify(value ?? null) === stableStringify(expected ?? null);
    case "notEquals":
      return stableStringify(value ?? null) !== stableStringify(expected ?? null);
    case "contains":
      return containsValue(value, expected);
    case "startsWith":
      return String(value ?? "").startsWith(String(expected ?? ""));
    case "endsWith":
      return String(value ?? "").endsWith(String(expected ?? ""));
    case "greaterThan":
      return compareValues(value, expected) > 0;
    case "greaterThanOrEqual":
      return compareValues(value, expected) >= 0;
    case "lessThan":
      return compareValues(value, expected) < 0;
    case "lessThanOrEqual":
      return compareValues(value, expected) <= 0;
    case "exists":
      return value !== undefined && value !== null;
    case "isEmpty":
      return (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      );
    case "in":
      return (
        Array.isArray(expected) &&
        expected.some((entry) => stableStringify(entry) === stableStringify(value ?? null))
      );
    case "notIn":
      return (
        !Array.isArray(expected) ||
        expected.every((entry) => stableStringify(entry) !== stableStringify(value ?? null))
      );
    default:
      throw new Error(`Unsupported filter operator: ${String(operator)}`);
  }
}

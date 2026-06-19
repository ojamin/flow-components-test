import type { JsonObject, JsonValue } from "./schema-primitives";
import type { RowAggregateOperation, RowTransformConfig } from "./row-transform-engine-types";
import { deriveOutputFieldName } from "./transform-contracts";
import {
  computeAggregate,
  createUniqueOutputField,
  readOrNull,
  sanitizeFieldName,
  setOutputField,
  stableStringify,
  validateAggregateOutputField,
  validateCountOutputField,
  validateDerivedOutputField,
  validateGeneratedOutputField,
  validateGroupByOutputFields,
} from "./row-transform-utils";

export function groupRows(
  rows: readonly JsonObject[],
  groupByFields: readonly string[],
  countField: string,
  aggregates: readonly {
    readonly sourceField?: string;
    readonly operation: RowAggregateOperation;
    readonly outputField: string;
  }[],
): JsonObject[] {
  const groupOutputFields = validateGroupByOutputFields(groupByFields, "groupByFields");
  const safeCountField = validateCountOutputField(countField, "countField");
  const aggregateOutputFields = aggregates.map((aggregate, index) =>
    validateAggregateOutputField(
      aggregate,
      aggregate.outputField ? `aggregates[${index}].outputField` : `aggregates[${index}]`,
    ),
  );
  const buckets = new Map<string, { values: JsonValue[]; rows: JsonObject[] }>();
  for (const row of rows) {
    const values = groupByFields.map((field) => readOrNull(row, field));
    const key = stableStringify(values);
    buckets.set(key, { values, rows: [...(buckets.get(key)?.rows ?? []), row] });
  }
  return [...buckets.values()].map((bucket) => {
    const output: JsonObject = {};
    groupOutputFields.forEach((field, index) => {
      setOutputField(output, field, bucket.values[index] ?? null, `groupByFields[${index}]`);
    });
    setOutputField(output, safeCountField, bucket.rows.length, "countField");
    aggregates.forEach((aggregate, index) => {
      setOutputField(
        output,
        aggregateOutputFields[index]!,
        computeAggregate(aggregate.operation, bucket.rows, aggregate.sourceField),
        `aggregates[${index}]`,
      );
    });
    return output;
  });
}

export function pivotRows(
  rows: readonly JsonObject[],
  config: Extract<RowTransformConfig, { operation: "pivot" }>,
): JsonObject[] {
  const pivotNames = new Map<string, string>();
  const usedOutputFields = new Set<string>([
    ...validateGroupByOutputFields(config.groupByFields, "groupByFields"),
    validateCountOutputField(config.countField, "countField"),
  ]);
  rows.forEach((row, rowIndex) => {
    const value = readOrNull(row, config.pivotField);
    const key = stableStringify(value);
    if (!pivotNames.has(key)) {
      const outputField = createUniqueOutputField(
        `${config.outputPrefix}${sanitizeFieldName(String(value ?? "null"))}`,
        usedOutputFields,
      );
      pivotNames.set(
        key,
        validateGeneratedOutputField(
          outputField,
          `pivotField generated output from row ${rowIndex}`,
        ),
      );
    }
  });

  return groupRows(
    rows,
    config.groupByFields,
    config.countField,
    [...pivotNames.entries()].map(([pivotKey, outputField]) => ({
      operation: config.aggregate,
      outputField,
      sourceField: config.valueField,
      pivotKey,
    })),
  ).map((groupedRow) => recomputePivotRow(groupedRow, rows, config, pivotNames));
}

function recomputePivotRow(
  groupedRow: JsonObject,
  rows: readonly JsonObject[],
  config: Extract<RowTransformConfig, { operation: "pivot" }>,
  pivotNames: ReadonlyMap<string, string>,
): JsonObject {
  const matchingRows = rows.filter((row) =>
    config.groupByFields.every(
      (field) =>
        stableStringify(readOrNull(row, field)) ===
        stableStringify(groupedRow[deriveOutputFieldName(field)] ?? null),
    ),
  );
  const output = pickFieldsFromGroupRow(groupedRow, config.groupByFields, config.countField);
  for (const [pivotKey, outputField] of pivotNames.entries()) {
    const pivotRowsForKey = matchingRows.filter(
      (row) => stableStringify(readOrNull(row, config.pivotField)) === pivotKey,
    );
    setOutputField(
      output,
      outputField,
      computeAggregate(config.aggregate, pivotRowsForKey, config.valueField),
      "pivotField generated output",
    );
  }
  return output;
}

function pickFieldsFromGroupRow(
  row: JsonObject,
  groupByFields: readonly string[],
  countField: string,
): JsonObject {
  const output: JsonObject = {};
  groupByFields.forEach((field, index) => {
    const outputField = validateDerivedOutputField(field, `groupByFields[${index}]`);
    setOutputField(output, outputField, row[outputField] ?? null, `groupByFields[${index}]`);
  });
  const safeCountField = validateCountOutputField(countField, "countField");
  setOutputField(output, safeCountField, row[safeCountField] ?? 0, "countField");
  return output;
}

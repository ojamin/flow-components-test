import type { JsonObject, JsonValue } from "./schema-primitives";
import {
  rowTransformConfigSchema,
  type RowTransformConfig,
  type RowTransformInputConfig,
} from "./row-transform-engine-types";
import { filterRows, sortRows } from "./row-transform-filter-sort";
import { groupRows, pivotRows } from "./row-transform-group-pivot";
import { lookupRows } from "./row-transform-lookup";
import { formatRows, normalizeRows } from "./row-transform-normalize-format";
import { dateBucketRows, dedupeRows, flattenRows, projectRow } from "./row-transform-projection";
import { resolveObjectRows } from "./row-transform-utils";

export interface RowTransformEngineInputs {
  readonly data?: JsonValue;
  readonly lookupData?: JsonValue;
}

export interface RowTransformEngineOutput {
  readonly rows: JsonObject[];
  readonly all: JsonObject[];
}

export function runRowTransform(
  configInput: RowTransformInputConfig | RowTransformConfig,
  inputs: RowTransformEngineInputs,
): RowTransformEngineOutput {
  const config = rowTransformConfigSchema.parse(configInput);
  const rows = resolveObjectRows(inputs.data, config.rowsPath);

  const transformed = (() => {
    switch (config.operation) {
      case "sort":
        return sortRows(rows, config.keys);
      case "filter":
        return filterRows(rows, config.clauses, config.match);
      case "select":
        return rows.map((row) => projectRow(row, config.fields));
      case "lookup":
        return lookupRows(
          rows,
          resolveObjectRows(inputs.lookupData, config.lookupRowsPath),
          config,
        );
      case "group":
        return groupRows(rows, config.groupByFields, config.countField, config.aggregates);
      case "pivot":
        return pivotRows(rows, config);
      case "flatten":
        return flattenRows(rows, config.field, config.outputField, config.keepEmpty);
      case "dedupe":
        return dedupeRows(rows, config.keyFields, config.keep);
      case "dateBucket":
        return dateBucketRows(rows, config.field, config.outputField, config.granularity);
      case "normalize":
        return normalizeRows(rows, config.fields);
      case "format":
        return formatRows(rows, config.fields);
      default:
        return assertNever(config);
    }
  })();

  return { rows: transformed, all: transformed };
}

function assertNever(value: never): never {
  throw new Error(`Unsupported row transform operation: ${JSON.stringify(value)}`);
}

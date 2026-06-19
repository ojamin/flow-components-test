import type { JsonObject } from "./schema-primitives.js";
import type { RowAggregateOperation, RowTransformConfig } from "./row-transform-engine-types.js";
export declare function groupRows(rows: readonly JsonObject[], groupByFields: readonly string[], countField: string, aggregates: readonly {
    readonly sourceField?: string;
    readonly operation: RowAggregateOperation;
    readonly outputField: string;
}[]): JsonObject[];
export declare function pivotRows(rows: readonly JsonObject[], config: Extract<RowTransformConfig, {
    operation: "pivot";
}>): JsonObject[];

import type { JsonObject } from "./schema-primitives.js";
import type { RowTransformConfig } from "./row-transform-engine-types.js";
export declare function lookupRows(rows: readonly JsonObject[], lookupRowsData: readonly JsonObject[], config: Extract<RowTransformConfig, {
    operation: "lookup";
}>): JsonObject[];

import type { JsonObject, JsonValue } from "./schema-primitives.js";
import type { RowFilterOperator } from "./row-transform-engine-types.js";
export declare function sortRows(rows: readonly JsonObject[], keys: readonly {
    readonly field: string;
    readonly direction: "asc" | "desc";
}[]): JsonObject[];
export declare function filterRows(rows: readonly JsonObject[], clauses: readonly {
    readonly field: string;
    readonly operator: RowFilterOperator;
    readonly value?: JsonValue;
}[], match: "all" | "any"): JsonObject[];

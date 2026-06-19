import type { JsonObject } from "./schema-primitives.js";
export declare function projectRow(row: JsonObject, fields: readonly {
    readonly sourceField: string;
    readonly outputField?: string;
}[]): JsonObject;
export declare function flattenRows(rows: readonly JsonObject[], field: string, outputField: string | undefined, keepEmpty: boolean): JsonObject[];
export declare function dedupeRows(rows: readonly JsonObject[], keyFields: readonly string[], keep: "first" | "last"): JsonObject[];
export declare function dateBucketRows(rows: readonly JsonObject[], field: string, outputField: string | undefined, granularity: "hour" | "day" | "week" | "month" | "year"): JsonObject[];

import type { JsonObject } from "./schema-primitives.js";
export declare function normalizeRows(rows: readonly JsonObject[], fields: readonly {
    readonly sourceField: string;
    readonly outputField?: string;
    readonly method: "minMax" | "zScore";
}[]): JsonObject[];
export declare function formatRows(rows: readonly JsonObject[], fields: readonly {
    readonly sourceField: string;
    readonly outputField?: string;
    readonly format: string;
    readonly decimals: number;
}[]): JsonObject[];

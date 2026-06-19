/**
 * Package-owned chart data adapter helpers.
 *
 * Self-contained port of src/lib/chart-data-adapters.ts for package-hosted
 * chart components. No @/ host imports; uses structured-data-helpers for
 * path resolution and row validation.
 */
import { type JsonObject } from "./structured-data-helpers.js";
import type { JsonValue } from "./schema-primitives.js";
export type ChartFieldRole = "x" | "y" | "label" | "value";
export type ChartAdapterTone = "ready" | "loading" | "empty" | "error";
export interface ChartAdapterState {
    tone: ChartAdapterTone;
    title: string | null;
    description: string | null;
}
export interface ChartRowsLookupResult {
    ok: boolean;
    error: string | null;
    pathLabel: string;
    rows: JsonObject[];
    state: ChartAdapterState;
}
export interface ServiceChartRowsLookupResult {
    ok: boolean;
    error: string | null;
    pathLabel: string;
    rows: JsonValue[];
    state: ChartAdapterState;
}
export interface ChartRowsPathOption {
    path: string;
    pathLabel: string;
    label: string;
    rowCount: number;
    fieldCount?: number;
}
export interface ChartRowsPathOptionsConfig {
    includeFieldCount?: boolean;
}
export interface ChartFieldOption {
    path: string;
    label: string;
    sampleValue: string | null;
    availableRowCount: number;
    numericRowCount: number;
    categoricalRowCount: number;
    supportedRoles: readonly ChartFieldRole[];
}
export interface ChartFieldSelection {
    role: ChartFieldRole;
    path: string;
}
export interface ChartSlice {
    label: string;
    value: number;
}
export interface ChartMappingResult<T> {
    ok: boolean;
    error: string | null;
    data: T[];
    totalRowCount: number;
    skippedRowCount: number;
    state: ChartAdapterState;
}
export declare function resolveChartRows(sourceValue: JsonValue | undefined, rowsPath: string): ChartRowsLookupResult;
export declare function resolveServiceChartRows(sourceValue: JsonValue | undefined, rowsPath: string): ServiceChartRowsLookupResult;
export declare function validateServiceChartRows(value: JsonValue | undefined, rowsPath: string): {
    ok: true;
    rows: JsonObject[];
} | {
    ok: false;
    error: string;
};
export declare function deriveChartRowsPathOptions(sourceValue: JsonValue | undefined, config?: ChartRowsPathOptionsConfig): ChartRowsPathOption[];
export declare function formatChartRowsPathOptionSummary(option: ChartRowsPathOption): string;
export declare function deriveChartFieldOptions(rows: readonly JsonObject[]): ChartFieldOption[];
export declare function deriveSelectedChartFieldOptions(rows: readonly JsonObject[], selections: readonly ChartFieldSelection[]): ChartFieldOption[];
export declare function filterChartFieldOptions(options: readonly ChartFieldOption[], role: ChartFieldRole): ChartFieldOption[];
export declare function formatChartFieldOptionSummary(option: ChartFieldOption): string;
export declare function validateChartFieldSelection(options: readonly ChartFieldOption[], role: ChartFieldRole, fieldPath: string): {
    readonly ok: false;
    readonly error: string;
    readonly option?: undefined;
} | {
    readonly ok: true;
    readonly error: null;
    readonly option: ChartFieldOption;
};
export declare function suggestChartFieldPath(options: readonly ChartFieldOption[], role: ChartFieldRole, fieldPath: string): string;
export declare function mapRowsToChartSlices(rows: readonly JsonObject[], labelField: string, valueField: string, options?: ChartFieldOption[]): ChartMappingResult<ChartSlice>;

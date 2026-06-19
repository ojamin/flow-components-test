/**
 * Structured-data helpers for table and similar data-viewer components.
 *
 * Package-owned, self-contained port of the app's structured-data-viewers
 * lib. No @/ host imports; only primitive dot-notation path resolution is
 * needed by table rowsPath (no wildcards or array-index tokens required).
 */
import type { JsonValue } from "./schema-primitives.js";
export type JsonObject = {
    [key: string]: JsonValue;
};
export type StructuredKeyLabelTransform = "none" | "start-case" | "uppercase";
export type StructuredTableColumnsMode = "auto" | "selected";
export interface StructuredPathResolution {
    ok: boolean;
    error: string | null;
    pathLabel: string;
    value: JsonValue | undefined;
}
export interface TableRowsValidationResult {
    ok: boolean;
    error: string | null;
    rows: JsonObject[];
}
export interface TableRowsValidationOptions {
    /** Zero-based row offset for validating a bounded window. */
    startIndex?: number;
    /** Maximum number of rows to validate from startIndex. Omit to validate all rows. */
    maxRows?: number;
}
export interface TableMetadataDerivationOptions {
    columnsMode: StructuredTableColumnsMode;
    selectedColumns: readonly string[];
    /** Zero-based visible row offset for selected-column rendering. */
    visibleStartIndex?: number;
    /** Visible row count for selected-column rendering. */
    visibleRowCount?: number;
}
export interface TableMetadataDerivationResult {
    ok: boolean;
    error: string | null;
    columns: string[];
    rows: JsonObject[];
    rowCount: number;
    validatedRange: {
        startIndex: number;
        rowCount: number;
    } | null;
}
/** Serialize a JSON value to a compact single-line string, truncating at maxLength. */
export declare function formatCompactJsonValue(value: JsonValue, maxLength?: number): string;
/** Resolve a rowsPath string against a data payload, returning a typed resolution result. */
export declare function resolveStructuredDataPath(sourceValue: JsonValue | undefined, path: string): StructuredPathResolution;
/** Exported type-guard — also used by select-options and other data-viewer components. */
export declare function isJsonObjectRecord(value: unknown): value is JsonObject;
/**
 * Resolve a dot-notation path against a JSON value and return a minimal ok/value result.
 * Used by select-options and other components that need a lightweight path lookup without
 * the full StructuredPathResolution envelope.
 */
export declare function resolveJsonPath(source: JsonValue, path: string): {
    ok: boolean;
    value?: JsonValue;
};
/** Return the discriminated kind of a JSON value ("array" | "object" | "null" | primitive typeof). */
export declare function getJsonValueKind(value: JsonValue): string;
/** Serialize a primitive JSON value to a display string (strings are JSON-quoted). */
export declare function formatJsonPrimitive(value: JsonValue): string;
/** Pretty-print a JSON value with 2-space indent. */
export declare function stringifyJsonValue(value: JsonValue): string;
/**
 * Validate that a resolved value is an array of row objects.
 *
 * Callers rendering selected columns can pass a visible-row window to avoid a full
 * object-shape scan when no auto column discovery is needed. Auto-column callers
 * should keep the default full validation so derived output semantics are unchanged.
 */
export declare function validateTableRows(value: JsonValue | undefined, options?: TableRowsValidationOptions): TableRowsValidationResult;
/**
 * Derive table column keys from row data.
 * In "auto" mode all keys from all rows are unioned in first-seen order.
 * In "selected" mode the configured column list is returned deduplicated.
 */
export declare function deriveTableColumns(rows: readonly JsonObject[], mode: StructuredTableColumnsMode, selectedColumns: readonly string[]): string[];
/**
 * Derive table metadata in one package-safe pass for cache/worker integration.
 *
 * Auto mode intentionally validates and scans the full row set to preserve the
 * current first-seen column-union semantics. Selected mode derives columns from
 * config only and validates just the requested visible window (or no row
 * objects for metadata-only calls) so large cached datasets do not need a full
 * row scan during render pagination.
 */
export declare function deriveTableMetadata(value: JsonValue | undefined, options: TableMetadataDerivationOptions): TableMetadataDerivationResult;
/** Format a snake_case / camelCase / dot-separated key as a display label. */
export declare function formatStructuredKeyLabel(key: string, transform: StructuredKeyLabelTransform): string;
/** Return true when a JSON value is considered blank (undefined, null, or empty string). */
export declare function isBlankStructuredValue(value: JsonValue | undefined): boolean;

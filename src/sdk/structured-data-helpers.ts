/**
 * Structured-data helpers for table and similar data-viewer components.
 *
 * Package-owned, self-contained port of the app's structured-data-viewers
 * lib. No @/ host imports; only primitive dot-notation path resolution is
 * needed by table rowsPath (no wildcards or array-index tokens required).
 */

import type { JsonValue } from "./schema-primitives";

// Local JsonObject alias — same shape as the app's domain type.
export type JsonObject = { [key: string]: JsonValue };

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
  validatedRange: { startIndex: number; rowCount: number } | null;
}

/** Serialize a JSON value to a compact single-line string, truncating at maxLength. */
export function formatCompactJsonValue(value: JsonValue, maxLength = 96): string {
  const serialized = JSON.stringify(value);

  if (serialized.length <= maxLength) {
    return serialized;
  }

  return `${serialized.slice(0, maxLength - 1)}…`;
}

/**
 * Resolve a dot-notation path against a JSON value.
 * Handles property chains only (e.g. "rows", "data.items").
 * Empty path returns the source value as-is (root).
 */
function resolveDotPath(
  source: JsonValue,
  path: string,
): { ok: boolean; value?: JsonValue; error?: string } {
  const segments = path.split(".");
  let current: JsonValue = source;

  for (const segment of segments) {
    if (current === null || typeof current !== "object" || Array.isArray(current)) {
      return { ok: false, error: `Could not resolve path "${path}".` };
    }

    if (!Object.prototype.hasOwnProperty.call(current, segment)) {
      return {
        ok: false,
        error: `Binding path could not resolve property '${segment}'.`,
      };
    }

    current = (current as JsonObject)[segment] as JsonValue;
  }

  return { ok: true, value: current };
}

/** Resolve a rowsPath string against a data payload, returning a typed resolution result. */
export function resolveStructuredDataPath(
  sourceValue: JsonValue | undefined,
  path: string,
): StructuredPathResolution {
  const normalizedPath = path.trim();
  const pathLabel = normalizedPath.length > 0 ? normalizedPath : "(root)";

  if (sourceValue === undefined) {
    return {
      ok: false,
      error: "Connect data to inspect this view.",
      pathLabel,
      value: undefined,
    };
  }

  if (normalizedPath.length === 0) {
    return {
      ok: true,
      error: null,
      pathLabel,
      value: sourceValue,
    };
  }

  const result = resolveDotPath(sourceValue, normalizedPath);

  if (!result.ok) {
    return {
      ok: false,
      error: result.error ?? `Could not resolve path "${normalizedPath}".`,
      pathLabel,
      value: undefined,
    };
  }

  return {
    ok: true,
    error: null,
    pathLabel,
    value: result.value,
  };
}

/** Exported type-guard — also used by select-options and other data-viewer components. */
export function isJsonObjectRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Resolve a dot-notation path against a JSON value and return a minimal ok/value result.
 * Used by select-options and other components that need a lightweight path lookup without
 * the full StructuredPathResolution envelope.
 */
export function resolveJsonPath(
  source: JsonValue,
  path: string,
): { ok: boolean; value?: JsonValue } {
  const normalizedPath = path.trim();

  if (normalizedPath.length === 0) {
    return { ok: true, value: source };
  }

  return resolveDotPath(source, normalizedPath);
}

/** Return the discriminated kind of a JSON value ("array" | "object" | "null" | primitive typeof). */
export function getJsonValueKind(value: JsonValue): string {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  if (typeof value === "object") return "object";
  return typeof value;
}

/** Serialize a primitive JSON value to a display string (strings are JSON-quoted). */
export function formatJsonPrimitive(value: JsonValue): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (value === null) return "null";
  return String(value);
}

/** Pretty-print a JSON value with 2-space indent. */
export function stringifyJsonValue(value: JsonValue): string {
  return JSON.stringify(value, null, 2);
}

/**
 * Validate that a resolved value is an array of row objects.
 *
 * Callers rendering selected columns can pass a visible-row window to avoid a full
 * object-shape scan when no auto column discovery is needed. Auto-column callers
 * should keep the default full validation so derived output semantics are unchanged.
 */
export function validateTableRows(
  value: JsonValue | undefined,
  options: TableRowsValidationOptions = {},
): TableRowsValidationResult {
  if (!Array.isArray(value)) {
    return {
      ok: false,
      error: "Rows path must resolve to an array of objects.",
      rows: [],
    };
  }

  const startIndex = Math.max(0, Math.floor(options.startIndex ?? 0));
  const hasBoundedWindow = options.maxRows !== undefined;
  const endIndex = hasBoundedWindow
    ? Math.min(value.length, startIndex + Math.max(0, Math.floor(options.maxRows ?? 0)))
    : value.length;
  const rowsToValidate = hasBoundedWindow ? value.slice(startIndex, endIndex) : value;
  const invalidRowIndex = rowsToValidate.findIndex((row) => !isJsonObjectRecord(row));

  if (invalidRowIndex >= 0) {
    return {
      ok: false,
      error: `Row ${startIndex + invalidRowIndex + 1} must be an object to render a table.`,
      rows: [],
    };
  }

  return {
    ok: true,
    error: null,
    rows: rowsToValidate as JsonObject[],
  };
}

/**
 * Derive table column keys from row data.
 * In "auto" mode all keys from all rows are unioned in first-seen order.
 * In "selected" mode the configured column list is returned deduplicated.
 */
export function deriveTableColumns(
  rows: readonly JsonObject[],
  mode: StructuredTableColumnsMode,
  selectedColumns: readonly string[],
): string[] {
  if (mode === "selected") {
    return Array.from(new Set(selectedColumns.map((column) => column.trim()).filter(Boolean)));
  }

  const seen = new Set<string>();
  const columns: string[] = [];

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    });
  });

  return columns;
}

/**
 * Derive table metadata in one package-safe pass for cache/worker integration.
 *
 * Auto mode intentionally validates and scans the full row set to preserve the
 * current first-seen column-union semantics. Selected mode derives columns from
 * config only and validates just the requested visible window (or no row
 * objects for metadata-only calls) so large cached datasets do not need a full
 * row scan during render pagination.
 */
export function deriveTableMetadata(
  value: JsonValue | undefined,
  options: TableMetadataDerivationOptions,
): TableMetadataDerivationResult {
  const rowCount = Array.isArray(value) ? value.length : 0;
  const validationOptions = createTableValidationOptions(rowCount, options);
  const rowsValidation = validateTableRows(value, validationOptions ?? {});

  if (!rowsValidation.ok) {
    return {
      ok: false,
      error: rowsValidation.error,
      columns: [],
      rows: [],
      rowCount,
      validatedRange: describeValidatedRange(rowCount, validationOptions),
    };
  }

  return {
    ok: true,
    error: null,
    columns: deriveTableColumns(rowsValidation.rows, options.columnsMode, options.selectedColumns),
    rows: rowsValidation.rows,
    rowCount,
    validatedRange: describeValidatedRange(rowCount, validationOptions),
  };
}

function createTableValidationOptions(
  rowCount: number,
  options: TableMetadataDerivationOptions,
): TableRowsValidationOptions | undefined {
  if (options.columnsMode === "auto") {
    return undefined;
  }

  const startIndex = Math.max(0, Math.floor(options.visibleStartIndex ?? 0));
  const maxRows = Math.max(0, Math.floor(options.visibleRowCount ?? 0));

  return { startIndex, maxRows };
}

function describeValidatedRange(
  rowCount: number,
  options: TableRowsValidationOptions | undefined,
): { startIndex: number; rowCount: number } | null {
  if (options === undefined) {
    return rowCount > 0 ? { startIndex: 0, rowCount } : null;
  }

  const startIndex = Math.max(0, Math.floor(options.startIndex ?? 0));
  const maxRows = Math.max(0, Math.floor(options.maxRows ?? rowCount));

  return {
    startIndex,
    rowCount: Math.max(0, Math.min(rowCount, startIndex + maxRows) - startIndex),
  };
}

/** Format a snake_case / camelCase / dot-separated key as a display label. */
export function formatStructuredKeyLabel(
  key: string,
  transform: StructuredKeyLabelTransform,
): string {
  if (transform === "none") {
    return key;
  }

  const normalized = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length === 0) {
    return key;
  }

  if (transform === "uppercase") {
    return normalized.toUpperCase();
  }

  return normalized
    .split(" ")
    .map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1).toLowerCase()}`)
    .join(" ");
}

/** Return true when a JSON value is considered blank (undefined, null, or empty string). */
export function isBlankStructuredValue(value: JsonValue | undefined): boolean {
  return (
    value === undefined || value === null || (typeof value === "string" && value.trim() === "")
  );
}

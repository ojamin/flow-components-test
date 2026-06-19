/**
 * Package-owned chart data adapter helpers.
 *
 * Self-contained port of src/lib/chart-data-adapters.ts for package-hosted
 * chart components. No @/ host imports; uses structured-data-helpers for
 * path resolution and row validation.
 */

import {
  formatJsonPrimitive,
  formatStructuredKeyLabel,
  resolveStructuredDataPath,
  validateTableRows,
  type JsonObject,
} from "./structured-data-helpers";

import type { JsonValue } from "./schema-primitives";
import { getDataTypeSchema } from "./data-types";

function getRequiredDataTypeSchema(typeId: string) {
  const schema = getDataTypeSchema(typeId);
  if (!schema) throw new Error(`Missing canonical data type schema "${typeId}".`);
  return schema;
}

const chartSliceSchema = getRequiredDataTypeSchema("chart-slices");

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

interface FieldStats {
  path: string;
  label: string;
  sampleValue: string | null;
  availableRowCount: number;
  numericRowCount: number;
  categoricalRowCount: number;
}

function createState(
  tone: ChartAdapterTone,
  title: string | null,
  description: string | null,
): ChartAdapterState {
  return { tone, title, description };
}

function formatChartFieldLabel(path: string) {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .map((segment) => formatStructuredKeyLabel(segment, "start-case"))
    .join(" · ");
}

function formatChartRowsPathLabel(path: string) {
  return path.trim().length > 0 ? formatChartFieldLabel(path) : "Root array";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isCategoricalValue(value: unknown) {
  return (
    value === true ||
    value === false ||
    isFiniteNumber(value) ||
    (typeof value === "string" && value.trim().length > 0)
  );
}

function collectRowFieldStats(
  value: JsonValue,
  path: string,
  rowPaths: Set<string>,
  statsByPath: Map<string, FieldStats>,
) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectRowFieldStats(item, `${path}[${index}]`, rowPaths, statsByPath);
    });
    return;
  }

  if (value !== null && typeof value === "object") {
    Object.entries(value).forEach(([key, childValue]) => {
      collectRowFieldStats(
        childValue,
        path.length > 0 ? `${path}.${key}` : key,
        rowPaths,
        statsByPath,
      );
    });
    return;
  }

  if (path.length === 0 || rowPaths.has(path)) {
    return;
  }

  rowPaths.add(path);

  const existing = statsByPath.get(path);
  const stats: FieldStats =
    existing ??
    ({
      path,
      label: formatChartFieldLabel(path),
      sampleValue: null,
      availableRowCount: 0,
      numericRowCount: 0,
      categoricalRowCount: 0,
    } satisfies FieldStats);

  stats.availableRowCount += 1;

  if (stats.sampleValue === null) {
    stats.sampleValue = formatJsonPrimitive(value);
  }

  if (isFiniteNumber(value)) {
    stats.numericRowCount += 1;
  }

  if (isCategoricalValue(value)) {
    stats.categoricalRowCount += 1;
  }

  if (!existing) {
    statsByPath.set(path, stats);
  }
}

function collectSelectedRowFieldStats(
  row: JsonObject,
  selections: readonly ChartFieldSelection[],
  statsByPath: Map<string, FieldStats>,
) {
  const rowPaths = new Set<string>();

  selections.forEach((selection) => {
    const path = normalizeFieldPath(selection.path);
    if (path.length === 0 || rowPaths.has(path)) {
      return;
    }

    const resolution = resolveChartFieldPath(row, path);
    if (!resolution.ok) {
      return;
    }

    const value = resolution.value;
    if (
      value === undefined ||
      Array.isArray(value) ||
      (value !== null && typeof value === "object")
    ) {
      return;
    }

    rowPaths.add(path);

    const existing = statsByPath.get(path);
    const stats =
      existing ??
      ({
        path,
        label: formatChartFieldLabel(path),
        sampleValue: null,
        availableRowCount: 0,
        numericRowCount: 0,
        categoricalRowCount: 0,
      } satisfies FieldStats);

    stats.availableRowCount += 1;

    if (stats.sampleValue === null) {
      stats.sampleValue = formatJsonPrimitive(value);
    }

    if (isFiniteNumber(value)) {
      stats.numericRowCount += 1;
    }

    if (isCategoricalValue(value)) {
      stats.categoricalRowCount += 1;
    }

    if (!existing) {
      statsByPath.set(path, stats);
    }
  });
}

function getSupportedChartRoles(stats: FieldStats): ChartFieldRole[] {
  const roles = new Set<ChartFieldRole>();

  if (stats.categoricalRowCount > 0) {
    roles.add("x");
    roles.add("label");
  }

  if (stats.numericRowCount > 0) {
    roles.add("x");
    roles.add("y");
    roles.add("label");
    roles.add("value");
  }

  return Array.from(roles);
}

function getRoleSelectionMessage(role: ChartFieldRole) {
  switch (role) {
    case "x":
      return {
        missing: "Choose an X field before this chart can render.",
        invalid:
          "The X field must resolve to text, booleans, or finite numbers in the current rows.",
      };
    case "y":
      return {
        missing: "Choose a Y field before this chart can render.",
        invalid: "The Y field must resolve to finite numbers in the current rows.",
      };
    case "label":
      return {
        missing: "Choose a label field before this chart can render.",
        invalid:
          "The label field must resolve to text, booleans, or finite numbers in the current rows.",
      };
    default:
      return {
        missing: "Choose a value field before this chart can render.",
        invalid: "The value field must resolve to finite numbers in the current rows.",
      };
  }
}

function normalizeFieldPath(path: string) {
  return path.trim();
}

/**
 * Tokenize a chart field path into property/index access segments.
 * Handles dot-notation and bracket-index notation produced by collectRowFieldStats.
 * E.g. "a.b[0].c" → ["a", "b", "0", "c"]
 */
function tokenizeChartFieldPath(path: string): string[] {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
}

/**
 * Resolve a chart field path against a row value.
 * Mirrors the field-path resolution behavior of the app's resolvePathValue for
 * the simple path grammar produced by collectRowFieldStats (dot-notation keys
 * and numeric bracket indexes).
 */
function resolveChartFieldPath(row: JsonObject, path: string): { ok: boolean; value?: JsonValue } {
  const tokens = tokenizeChartFieldPath(path);

  if (tokens.length === 0) {
    return { ok: false };
  }

  let current: JsonValue = row;

  for (const token of tokens) {
    if (current === null) {
      return { ok: false };
    }

    if (Array.isArray(current)) {
      const index = Number(token);

      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return { ok: false };
      }

      current = current[index] as JsonValue;
    } else if (typeof current === "object") {
      if (!Object.prototype.hasOwnProperty.call(current, token)) {
        return { ok: false };
      }

      current = (current as JsonObject)[token] as JsonValue;
    } else {
      return { ok: false };
    }
  }

  return { ok: true, value: current };
}

function toChartLabelValue(value: unknown) {
  if (isFiniteNumber(value)) {
    return String(value);
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  return null;
}

function finalizeChartMapping<T>(
  data: T[],
  totalRowCount: number,
  schemaErrorMessage: string,
  schema: { safeParse(value: unknown): { success: boolean } },
): ChartMappingResult<T> {
  if (data.length === 0) {
    return {
      ok: false,
      error: "No rows produced chartable values for the selected fields.",
      data,
      totalRowCount,
      skippedRowCount: totalRowCount,
      state: createState(
        "empty",
        "No chartable rows",
        "The selected fields are valid, but no row currently produces a complete chart point.",
      ),
    };
  }

  if (!schema.safeParse(data).success) {
    return {
      ok: false,
      error: schemaErrorMessage,
      data: [],
      totalRowCount,
      skippedRowCount: totalRowCount,
      state: createState("error", "Chart data is invalid", schemaErrorMessage),
    };
  }

  return {
    ok: true,
    error: null,
    data,
    totalRowCount,
    skippedRowCount: totalRowCount - data.length,
    state: createState("ready", null, null),
  };
}

export function resolveChartRows(
  sourceValue: JsonValue | undefined,
  rowsPath: string,
): ChartRowsLookupResult {
  if (sourceValue === undefined) {
    const pathLabel = formatChartRowsPathLabel(rowsPath);

    return {
      ok: false,
      error: null,
      pathLabel,
      rows: [],
      state: createState(
        "loading",
        "Loading chart data",
        `Waiting for data at ${pathLabel} so the chart preview can render as soon as rows arrive.`,
      ),
    };
  }

  const pathResolution = resolveStructuredDataPath(sourceValue, rowsPath);

  if (!pathResolution.ok) {
    return {
      ok: false,
      error: pathResolution.error,
      pathLabel: pathResolution.pathLabel,
      rows: [],
      state: createState("error", "Rows path unavailable", pathResolution.error),
    };
  }

  const rowsValidation = validateTableRows(pathResolution.value);

  if (!rowsValidation.ok) {
    return {
      ok: false,
      error: rowsValidation.error,
      pathLabel: pathResolution.pathLabel,
      rows: [],
      state: createState("error", "Rows path must resolve to chart rows", rowsValidation.error),
    };
  }

  if (rowsValidation.rows.length === 0) {
    return {
      ok: false,
      error: null,
      pathLabel: pathResolution.pathLabel,
      rows: rowsValidation.rows,
      state: createState(
        "empty",
        "No rows to chart",
        `Resolved ${pathResolution.pathLabel}, but the array is empty.`,
      ),
    };
  }

  return {
    ok: true,
    error: null,
    pathLabel: pathResolution.pathLabel,
    rows: rowsValidation.rows,
    state: createState("ready", null, null),
  };
}

export function resolveServiceChartRows(
  sourceValue: JsonValue | undefined,
  rowsPath: string,
): ServiceChartRowsLookupResult {
  if (sourceValue === undefined) {
    const pathLabel = formatChartRowsPathLabel(rowsPath);

    return {
      ok: false,
      error: null,
      pathLabel,
      rows: [],
      state: createState(
        "loading",
        "Loading chart data",
        `Waiting for data at ${pathLabel} so the chart preview can render as soon as rows arrive.`,
      ),
    };
  }

  const pathResolution = resolveStructuredDataPath(sourceValue, rowsPath);

  if (!pathResolution.ok) {
    return {
      ok: false,
      error: pathResolution.error,
      pathLabel: pathResolution.pathLabel,
      rows: [],
      state: createState("error", "Rows path unavailable", pathResolution.error),
    };
  }

  if (!Array.isArray(pathResolution.value)) {
    const error = "Rows path must resolve to an array of objects.";

    return {
      ok: false,
      error,
      pathLabel: pathResolution.pathLabel,
      rows: [],
      state: createState("error", "Rows path must resolve to chart rows", error),
    };
  }

  if (pathResolution.value.length === 0) {
    return {
      ok: false,
      error: null,
      pathLabel: pathResolution.pathLabel,
      rows: pathResolution.value,
      state: createState(
        "empty",
        "No rows to chart",
        `Resolved ${pathResolution.pathLabel}, but the array is empty.`,
      ),
    };
  }

  return {
    ok: true,
    error: null,
    pathLabel: pathResolution.pathLabel,
    rows: pathResolution.value,
    state: createState("ready", null, null),
  };
}

export function validateServiceChartRows(
  value: JsonValue | undefined,
  rowsPath: string,
): { ok: true; rows: JsonObject[] } | { ok: false; error: string } {
  const rowsValidation = validateTableRows(value);
  if (rowsValidation.ok) {
    return { ok: true, rows: rowsValidation.rows };
  }

  const pathLabel = formatServiceRowsPathLabel(rowsPath);
  const reason = rowsValidation.error ?? "Rows must be an array of row objects.";
  return { ok: false, error: `Rows at ${pathLabel} are invalid: ${reason}` };
}

function formatServiceRowsPathLabel(rowsPath: string): string {
  const normalizedPath = rowsPath.trim();
  if (normalizedPath.length === 0 || normalizedPath === "__root__" || normalizedPath === "$") {
    return "Root array";
  }
  if (normalizedPath.startsWith("$.")) {
    return formatChartRowsPathLabel(normalizedPath.slice(2));
  }
  return formatChartRowsPathLabel(normalizedPath);
}

function collectChartRowsPathOptions(
  value: JsonValue | undefined,
  path: string,
  options: ChartRowsPathOption[],
  config: Required<ChartRowsPathOptionsConfig>,
) {
  if (Array.isArray(value)) {
    const rowsValidation = validateTableRows(value);

    if (rowsValidation.ok) {
      options.push({
        path,
        pathLabel: path.trim().length > 0 ? path : "(root)",
        label: formatChartRowsPathLabel(path),
        rowCount: rowsValidation.rows.length,
        ...(config.includeFieldCount
          ? { fieldCount: deriveChartFieldOptions(rowsValidation.rows).length }
          : {}),
      });
      return;
    }

    value.forEach((item, index) => {
      if (Array.isArray(item) || (item !== null && typeof item === "object")) {
        collectChartRowsPathOptions(item, `${path}[${index}]`, options, config);
      }
    });
    return;
  }

  if (value !== null && typeof value === "object") {
    Object.entries(value).forEach(([key, childValue]) => {
      collectChartRowsPathOptions(
        childValue,
        path.length > 0 ? `${path}.${key}` : key,
        options,
        config,
      );
    });
  }
}

export function deriveChartRowsPathOptions(
  sourceValue: JsonValue | undefined,
  config: ChartRowsPathOptionsConfig = {},
) {
  if (sourceValue === undefined) {
    return [] satisfies ChartRowsPathOption[];
  }

  const options: ChartRowsPathOption[] = [];
  const resolvedConfig = { includeFieldCount: config.includeFieldCount ?? true };

  collectChartRowsPathOptions(sourceValue, "", options, resolvedConfig);

  return Array.from(new Map(options.map((option) => [option.path, option])).values()).sort(
    (a, b) => {
      if (a.path.length === 0) {
        return -1;
      }

      if (b.path.length === 0) {
        return 1;
      }

      return a.path.length - b.path.length || a.path.localeCompare(b.path);
    },
  );
}

export function formatChartRowsPathOptionSummary(option: ChartRowsPathOption) {
  const details = [`${option.rowCount} rows`];
  if (option.fieldCount !== undefined) {
    details.push(`${option.fieldCount} fields`);
  }
  return `${option.label} · ${details.join(" · ")}`;
}

export function deriveChartFieldOptions(rows: readonly JsonObject[]): ChartFieldOption[] {
  const statsByPath = new Map<string, FieldStats>();

  rows.forEach((row) => {
    const rowPaths = new Set<string>();
    collectRowFieldStats(row, "", rowPaths, statsByPath);
  });

  return Array.from(statsByPath.values()).map((stats) => ({
    path: stats.path,
    label: stats.label,
    sampleValue: stats.sampleValue,
    availableRowCount: stats.availableRowCount,
    numericRowCount: stats.numericRowCount,
    categoricalRowCount: stats.categoricalRowCount,
    supportedRoles: getSupportedChartRoles(stats),
  }));
}

export function deriveSelectedChartFieldOptions(
  rows: readonly JsonObject[],
  selections: readonly ChartFieldSelection[],
): ChartFieldOption[] {
  const selectedPaths = Array.from(
    new Map(
      selections
        .map((selection) => [normalizeFieldPath(selection.path), selection] as const)
        .filter(([path]) => path.length > 0),
    ).values(),
  );
  const statsByPath = new Map<string, FieldStats>();

  rows.forEach((row) => {
    collectSelectedRowFieldStats(row, selectedPaths, statsByPath);
  });

  return selectedPaths.flatMap((selection) => {
    const stats = statsByPath.get(normalizeFieldPath(selection.path));
    if (!stats) return [];

    return [
      {
        path: stats.path,
        label: stats.label,
        sampleValue: stats.sampleValue,
        availableRowCount: stats.availableRowCount,
        numericRowCount: stats.numericRowCount,
        categoricalRowCount: stats.categoricalRowCount,
        supportedRoles: getSupportedChartRoles(stats),
      } satisfies ChartFieldOption,
    ];
  });
}

export function filterChartFieldOptions(
  options: readonly ChartFieldOption[],
  role: ChartFieldRole,
) {
  return options.filter((option) => option.supportedRoles.includes(role));
}

export function formatChartFieldOptionSummary(option: ChartFieldOption) {
  const details = [`${option.availableRowCount} rows`];

  if (option.sampleValue !== null) {
    details.unshift(`sample ${option.sampleValue}`);
  }

  return `${option.label} · ${details.join(" · ")}`;
}

export function validateChartFieldSelection(
  options: readonly ChartFieldOption[],
  role: ChartFieldRole,
  fieldPath: string,
) {
  const normalizedFieldPath = normalizeFieldPath(fieldPath);
  const roleMessages = getRoleSelectionMessage(role);

  if (normalizedFieldPath.length === 0) {
    return { ok: false, error: roleMessages.missing } as const;
  }

  const option = options.find((candidate) => candidate.path === normalizedFieldPath);

  if (!option) {
    return {
      ok: false,
      error: `The current rows do not expose "${normalizedFieldPath}" as a selectable field yet.`,
    } as const;
  }

  if (!option.supportedRoles.includes(role)) {
    return { ok: false, error: roleMessages.invalid } as const;
  }

  return { ok: true, error: null, option } as const;
}

export function suggestChartFieldPath(
  options: readonly ChartFieldOption[],
  role: ChartFieldRole,
  fieldPath: string,
) {
  const validation = validateChartFieldSelection(options, role, fieldPath);

  if (validation.ok) {
    return validation.option.path;
  }

  return filterChartFieldOptions(options, role)[0]?.path ?? "";
}

export function mapRowsToChartSlices(
  rows: readonly JsonObject[],
  labelField: string,
  valueField: string,
  options = deriveSelectedChartFieldOptions(rows, [
    { role: "label", path: labelField },
    { role: "value", path: valueField },
  ]),
): ChartMappingResult<ChartSlice> {
  const labelValidation = validateChartFieldSelection(options, "label", labelField);

  if (!labelValidation.ok) {
    return {
      ok: false,
      error: labelValidation.error,
      data: [],
      totalRowCount: rows.length,
      skippedRowCount: rows.length,
      state: createState("error", "Choose a valid label field", labelValidation.error),
    };
  }

  const valueValidation = validateChartFieldSelection(options, "value", valueField);

  if (!valueValidation.ok) {
    return {
      ok: false,
      error: valueValidation.error,
      data: [],
      totalRowCount: rows.length,
      skippedRowCount: rows.length,
      state: createState("error", "Choose a valid value field", valueValidation.error),
    };
  }

  const data = rows.flatMap((row) => {
    const labelResolution = resolveChartFieldPath(row, normalizeFieldPath(labelField));
    const valueResolution = resolveChartFieldPath(row, normalizeFieldPath(valueField));
    const labelValue = labelResolution.ok ? toChartLabelValue(labelResolution.value) : null;
    const value =
      valueResolution.ok && isFiniteNumber(valueResolution.value) ? valueResolution.value : null;

    return labelValue !== null && value !== null ? [{ label: labelValue, value }] : [];
  });

  return finalizeChartMapping(
    data,
    rows.length,
    "Mapped chart slices must contain a non-empty label and a finite numeric value.",
    chartSliceSchema,
  );
}

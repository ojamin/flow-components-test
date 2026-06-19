import {
  deriveChartFieldOptions,
  deriveSelectedChartFieldOptions,
  mapRowsToChartSlices,
  validateChartFieldSelection,
  type ChartFieldOption,
  type ChartFieldSelection,
  type ChartMappingResult,
} from "./chart-data-helpers";
import { getDataTypeSchema } from "./data-types";
import type {
  DatasetChartFieldOption,
  DatasetChartSeriesMapping,
} from "./runtime-services/dataset-derivation-service";
import type { JsonObject, JsonValue } from "./schema-primitives";

interface ChartSeriesPoint {
  x: string | number;
  y: number;
  xLabel: string | null;
}

export interface DatasetChartFieldOptionsDerivationOptions {
  readonly selections?: readonly ChartFieldSelection[];
}

export type DatasetChartSeriesMappingConfig =
  | {
      readonly kind: "xy";
      readonly xField: string;
      readonly yField: string;
      readonly fieldOptions?: readonly ChartFieldOption[];
      readonly maxMappedRows?: number;
      readonly totalRowCount?: number;
    }
  | {
      readonly kind: "slice";
      readonly labelField: string;
      readonly valueField: string;
      readonly fieldOptions?: readonly ChartFieldOption[];
      readonly totalRowCount?: number;
    };

const chartSeriesXySchema = getRequiredDataTypeSchema("chart-series-xy");

function getRequiredDataTypeSchema(typeId: string) {
  const schema = getDataTypeSchema(typeId);
  if (!schema) throw new Error(`Missing canonical data type schema "${typeId}".`);
  return schema;
}

function normalizeFieldPath(path: string): string {
  return path.trim();
}

function createState(
  tone: ChartMappingResult<unknown>["state"]["tone"],
  title: string | null,
  description: string | null,
): ChartMappingResult<unknown>["state"] {
  return { tone, title, description };
}

function tokenizeChartFieldPath(path: string): string[] {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
}

function resolveChartFieldPath(row: JsonObject, path: string): { ok: boolean; value?: JsonValue } {
  const tokens = tokenizeChartFieldPath(path);
  if (tokens.length === 0) return { ok: false };

  let current: JsonValue = row;
  for (const token of tokens) {
    if (current === null) return { ok: false };

    if (Array.isArray(current)) {
      const index = Number(token);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) return { ok: false };
      current = current[index] as JsonValue;
    } else if (typeof current === "object") {
      if (!Object.prototype.hasOwnProperty.call(current, token)) return { ok: false };
      current = (current as JsonObject)[token] as JsonValue;
    } else {
      return { ok: false };
    }
  }

  return { ok: true, value: current };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toChartXValue(value: unknown): string | number | null {
  if (isFiniteNumber(value)) return value;

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === "boolean") return String(value);

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

function mapRowsToChartSeriesXy(
  rows: readonly JsonObject[],
  xField: string,
  yField: string,
  options = deriveSelectedChartFieldOptions(rows, [
    { role: "x", path: xField },
    { role: "y", path: yField },
  ]),
  maxMappedRows?: number,
  totalRowCount = rows.length,
): ChartMappingResult<ChartSeriesPoint> {
  const xValidation = validateChartFieldSelection(options, "x", xField);
  if (!xValidation.ok) {
    return {
      ok: false,
      error: xValidation.error,
      data: [],
      totalRowCount,
      skippedRowCount: totalRowCount,
      state: createState("error", "Choose a valid X field", xValidation.error),
    };
  }

  const yValidation = validateChartFieldSelection(options, "y", yField);
  if (!yValidation.ok) {
    return {
      ok: false,
      error: yValidation.error,
      data: [],
      totalRowCount,
      skippedRowCount: totalRowCount,
      state: createState("error", "Choose a valid Y field", yValidation.error),
    };
  }

  const mappedPointLimit =
    typeof maxMappedRows === "number" && Number.isFinite(maxMappedRows) && maxMappedRows > 0
      ? Math.floor(maxMappedRows)
      : null;
  const resolvedPoints: Array<{ x: string | number; y: number }> = [];

  for (const row of rows) {
    if (mappedPointLimit !== null && resolvedPoints.length >= mappedPointLimit) {
      break;
    }

    const xResolution = resolveChartFieldPath(row, normalizeFieldPath(xField));
    const yResolution = resolveChartFieldPath(row, normalizeFieldPath(yField));
    const xValue = xResolution.ok ? toChartXValue(xResolution.value) : null;
    const yValue = yResolution.ok && isFiniteNumber(yResolution.value) ? yResolution.value : null;

    if (xValue !== null && yValue !== null) {
      resolvedPoints.push({ x: xValue, y: yValue });
    }
  }

  const usesOrdinalXAxis = resolvedPoints.some((point) => typeof point.x !== "number");
  const data = resolvedPoints.map((point, index) =>
    usesOrdinalXAxis
      ? { x: index, y: point.y, xLabel: String(point.x) }
      : { x: point.x, y: point.y, xLabel: null },
  );

  return finalizeChartMapping(
    data,
    totalRowCount,
    "Mapped chart points must contain a string-or-number X value and a finite numeric Y value.",
    chartSeriesXySchema,
  );
}

function toDatasetChartFieldOption(option: ChartFieldOption): DatasetChartFieldOption {
  return {
    id: option.path,
    path: option.path,
    label: option.label,
    sampleValue: option.sampleValue,
    availableRowCount: option.availableRowCount,
    numericRowCount: option.numericRowCount,
    categoricalRowCount: option.categoricalRowCount,
    supportedRoles: [...option.supportedRoles],
  };
}

export function deriveDatasetChartFieldOptions(
  rows: readonly JsonObject[],
  options: DatasetChartFieldOptionsDerivationOptions = {},
): DatasetChartFieldOption[] {
  const chartOptions = options.selections
    ? deriveSelectedChartFieldOptions(rows, options.selections)
    : deriveChartFieldOptions(rows);

  return chartOptions.map(toDatasetChartFieldOption);
}

export function deriveDatasetChartSeriesMapping(
  rows: readonly JsonObject[],
  config: DatasetChartSeriesMappingConfig,
): DatasetChartSeriesMapping {
  if (config.kind === "xy") {
    const result = mapRowsToChartSeriesXy(
      rows,
      config.xField,
      config.yField,
      [
        ...(config.fieldOptions ??
          deriveSelectedChartFieldOptions(rows, [
            { role: "x", path: config.xField },
            { role: "y", path: config.yField },
          ])),
      ],
      config.maxMappedRows,
      config.totalRowCount,
    );

    return {
      kind: "xy",
      ok: result.ok,
      error: result.error,
      data: result.data,
      fields: { x: config.xField, y: config.yField },
      totalRowCount: result.totalRowCount,
      skippedRowCount: result.skippedRowCount,
      state: result.state,
    };
  }

  const result = mapRowsToChartSlices(rows, config.labelField, config.valueField, [
    ...(config.fieldOptions ??
      deriveSelectedChartFieldOptions(rows, [
        { role: "label", path: config.labelField },
        { role: "value", path: config.valueField },
      ])),
  ]);
  const totalRowCount = config.totalRowCount ?? result.totalRowCount;

  return {
    kind: "slice",
    ok: result.ok,
    error: result.error,
    data: result.data,
    fields: { label: config.labelField, value: config.valueField },
    totalRowCount,
    skippedRowCount: Math.max(0, totalRowCount - result.data.length),
    state: result.state,
  };
}

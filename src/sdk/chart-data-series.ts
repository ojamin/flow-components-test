import type { JsonObject } from "./structured-data-helpers";
import type { JsonValue } from "./schema-primitives";
import { getDataTypeSchema } from "./data-types";
import {
  deriveChartFieldOptions,
  validateChartFieldSelection,
  type ChartAdapterState,
  type ChartFieldOption,
  type ChartMappingResult,
} from "./chart-data-helpers";

export interface ChartSeriesPoint {
  x: string | number;
  y: number;
  xLabel: string | null;
}

function getRequiredDataTypeSchema(typeId: string) {
  const schema = getDataTypeSchema(typeId);
  if (!schema) throw new Error(`Missing canonical data type schema "${typeId}".`);
  return schema;
}

const chartSeriesXySchema = getRequiredDataTypeSchema("chart-series-xy");

function createState(
  tone: ChartAdapterState["tone"],
  title: string | null,
  description: string | null,
): ChartAdapterState {
  return { tone, title, description };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeFieldPath(path: string) {
  return path.trim();
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

function toChartXValue(value: unknown) {
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

export function mapRowsToChartSeriesXy(
  rows: readonly JsonObject[],
  xField: string,
  yField: string,
  options: readonly ChartFieldOption[] = deriveChartFieldOptions(rows),
): ChartMappingResult<ChartSeriesPoint> {
  const xValidation = validateChartFieldSelection(options, "x", xField);
  if (!xValidation.ok) {
    return {
      ok: false,
      error: xValidation.error,
      data: [],
      totalRowCount: rows.length,
      skippedRowCount: rows.length,
      state: createState("error", "Choose a valid X field", xValidation.error),
    };
  }

  const yValidation = validateChartFieldSelection(options, "y", yField);
  if (!yValidation.ok) {
    return {
      ok: false,
      error: yValidation.error,
      data: [],
      totalRowCount: rows.length,
      skippedRowCount: rows.length,
      state: createState("error", "Choose a valid Y field", yValidation.error),
    };
  }

  const resolvedPoints = rows.flatMap((row) => {
    const xResolution = resolveChartFieldPath(row, normalizeFieldPath(xField));
    const yResolution = resolveChartFieldPath(row, normalizeFieldPath(yField));
    const xValue = xResolution.ok ? toChartXValue(xResolution.value) : null;
    const yValue = yResolution.ok && isFiniteNumber(yResolution.value) ? yResolution.value : null;

    return xValue !== null && yValue !== null ? [{ x: xValue, y: yValue }] : [];
  });
  const usesOrdinalXAxis = resolvedPoints.some((point) => typeof point.x !== "number");
  const data = resolvedPoints.map((point, index) =>
    usesOrdinalXAxis
      ? {
          x: index,
          y: point.y,
          xLabel: String(point.x),
        }
      : {
          x: point.x,
          y: point.y,
          xLabel: null,
        },
  );

  return finalizeChartMapping(
    data,
    rows.length,
    "Mapped chart points must contain a string-or-number X value and a finite numeric Y value.",
    chartSeriesXySchema,
  );
}

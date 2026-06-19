import type { JsonObject } from "./structured-data-helpers.js";
import { type ChartFieldOption, type ChartMappingResult } from "./chart-data-helpers.js";
export interface ChartSeriesPoint {
    x: string | number;
    y: number;
    xLabel: string | null;
}
export declare function mapRowsToChartSeriesXy(rows: readonly JsonObject[], xField: string, yField: string, options?: readonly ChartFieldOption[]): ChartMappingResult<ChartSeriesPoint>;

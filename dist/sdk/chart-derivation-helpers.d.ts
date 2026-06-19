import { type ChartFieldOption, type ChartFieldSelection } from "./chart-data-helpers.js";
import type { DatasetChartFieldOption, DatasetChartSeriesMapping } from "./runtime-services/dataset-derivation-service.js";
import type { JsonObject } from "./schema-primitives.js";
export interface DatasetChartFieldOptionsDerivationOptions {
    readonly selections?: readonly ChartFieldSelection[];
}
export type DatasetChartSeriesMappingConfig = {
    readonly kind: "xy";
    readonly xField: string;
    readonly yField: string;
    readonly fieldOptions?: readonly ChartFieldOption[];
    readonly maxMappedRows?: number;
    readonly totalRowCount?: number;
} | {
    readonly kind: "slice";
    readonly labelField: string;
    readonly valueField: string;
    readonly fieldOptions?: readonly ChartFieldOption[];
    readonly totalRowCount?: number;
};
export declare function deriveDatasetChartFieldOptions(rows: readonly JsonObject[], options?: DatasetChartFieldOptionsDerivationOptions): DatasetChartFieldOption[];
export declare function deriveDatasetChartSeriesMapping(rows: readonly JsonObject[], config: DatasetChartSeriesMappingConfig): DatasetChartSeriesMapping;

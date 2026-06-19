import type { InjectionKey } from "vue";
export interface SchemaFormPerformancePhaseDimensions {
    counts?: Record<string, number | undefined>;
}
export type SchemaFormPerformancePhaseRecorder = <TValue>(phaseName: string, operation: () => TValue, dimensions?: () => SchemaFormPerformancePhaseDimensions) => TValue;
export declare const schemaFormPerformanceDiagnosticsKey: InjectionKey<SchemaFormPerformancePhaseRecorder>;

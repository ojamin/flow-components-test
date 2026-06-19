import type { OutputPortDefinition, PortOutputMap } from "./component-definition-types.js";
export declare function safeParseDataTypeValue<TValue = unknown>(typeId: string, value: unknown): {
    success: false;
    error: Error;
    value?: undefined;
} | {
    success: true;
    value: TValue;
    error?: undefined;
};
export declare function parseDataTypeValue<TValue = unknown>(typeId: string, value: unknown): TValue;
export declare function shapePortOutputs<const TOutputs extends readonly OutputPortDefinition[]>(outputDefinitions: TOutputs, outputs: Record<string, unknown>): PortOutputMap<TOutputs>;

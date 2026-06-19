import type { JsonObject, JsonValue } from "./schema-primitives.js";
import { type RowTransformConfig, type RowTransformInputConfig } from "./row-transform-engine-types.js";
export interface RowTransformEngineInputs {
    readonly data?: JsonValue;
    readonly lookupData?: JsonValue;
}
export interface RowTransformEngineOutput {
    readonly rows: JsonObject[];
    readonly all: JsonObject[];
}
export declare function runRowTransform(configInput: RowTransformInputConfig | RowTransformConfig, inputs: RowTransformEngineInputs): RowTransformEngineOutput;

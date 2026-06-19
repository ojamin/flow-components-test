import type { ComponentParams, ParamDescriptor } from "./component-definition.js";
import type { JsonValue } from "./schema-primitives.js";
export type ParamSchemaProjectionType = "string" | "number" | "integer" | "boolean" | "object" | "array" | "enum" | "null" | "unknown";
export interface ParamSchemaProjection {
    type: ParamSchemaProjectionType;
    schemaTypes?: readonly string[];
    properties?: Record<string, ParamSchemaProjection>;
    items?: ParamSchemaProjection;
    required?: readonly string[];
    enumValues?: readonly JsonValue[];
    defaultValue?: JsonValue;
    placeholder?: string;
    description?: string;
}
export declare function projectComponentParamSchemas(params: ComponentParams): Record<string, ParamSchemaProjection>;
export declare function projectParamSchema(descriptor: ParamDescriptor): ParamSchemaProjection;

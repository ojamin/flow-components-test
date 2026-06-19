import type { InputPortDefinition, OutputPortDefinition } from "./component-definition.js";
import type { JsonValue } from "./schema-primitives.js";
export declare const transformOperationIds: readonly ["sort", "filter", "select", "lookup", "group", "pivot", "flatten", "dedupe", "dateBucket", "normalize", "format"];
export type TransformOperationId = (typeof transformOperationIds)[number];
export declare const rowTransformInputTypeIds: readonly ["table-rows", "json-array", "all-data"];
export declare const rowTransformOutputTypeIds: {
    readonly rows: "table-rows";
    readonly all: "all-data";
};
export declare const transformFieldPickerRoles: readonly ["row-source", "field", "numeric-field", "date-field", "group-key", "join-key", "sort-key", "projection", "format-target"];
export type TransformFieldPickerRole = (typeof transformFieldPickerRoles)[number];
export interface TransformFieldPickerHint {
    readonly id: string;
    readonly role: TransformFieldPickerRole;
    readonly label?: string;
    readonly pathConfigKey?: string;
    readonly rowsPathConfigKey?: string;
    readonly allowMultiple?: boolean;
}
export interface RowTransformContract {
    readonly operation: TransformOperationId;
    readonly inputs: readonly InputPortDefinition[];
    readonly outputs: readonly OutputPortDefinition[];
    readonly fieldPickers: readonly TransformFieldPickerHint[];
}
export interface CreateRowTransformContractOptions {
    readonly operation: TransformOperationId;
    readonly inputId?: string;
    readonly inputLabel?: string;
    readonly includeLookupInput?: boolean;
    readonly lookupInputId?: string;
    readonly lookupInputLabel?: string;
    readonly rowsOutputId?: string;
    readonly rowsOutputLabel?: string;
    readonly allOutputId?: string;
    readonly allOutputLabel?: string;
    readonly fieldPickers?: readonly TransformFieldPickerHint[];
}
export type RowFieldValueKind = "string" | "number" | "boolean" | "date" | "null" | "json" | "mixed";
export interface RowFieldMetadata {
    readonly path: string;
    readonly label: string;
    readonly kind: RowFieldValueKind;
    readonly occurrences: number;
    readonly sampleValues: readonly JsonValue[];
}
export declare function createRowTransformInputPort(options?: {
    readonly id?: string;
    readonly label?: string;
    readonly required?: boolean;
}): InputPortDefinition;
export declare function createLookupInputPort(options?: {
    readonly id?: string;
    readonly label?: string;
    readonly required?: boolean;
}): InputPortDefinition;
export declare function createRowTransformOutputPorts(options?: {
    readonly rowsId?: string;
    readonly rowsLabel?: string;
    readonly allId?: string;
    readonly allLabel?: string;
}): readonly OutputPortDefinition[];
export declare function createRowTransformContract(options: CreateRowTransformContractOptions): RowTransformContract;
export declare function resolveRowSource(data: JsonValue | undefined, rowsPath?: string): readonly JsonValue[];
export declare function readRowField(row: JsonValue, path: string): JsonValue | undefined;
export declare function deriveOutputFieldName(path: string, fallback?: string): string;
export declare function createStableRowKey(row: JsonValue, keyFields?: readonly string[]): string;
export declare function inferRowFieldMetadata(rows: readonly JsonValue[]): readonly RowFieldMetadata[];

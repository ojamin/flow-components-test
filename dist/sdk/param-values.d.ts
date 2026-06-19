import type { ComponentParams, InputPortDefinition, ParamBindSource, ParamDescriptor } from "./component-definition.js";
export type ParamValueState = {
    mode: "literal";
    value: unknown;
} | {
    mode: "bind";
    input: string;
    path: string;
    fallback?: unknown;
};
export type ParamValuesState = Record<string, ParamValueState>;
export interface ResolveParamValuesOptions {
    params: ComponentParams;
    state: ParamValuesState | undefined;
    inputValues: Record<string, unknown>;
    inputPorts: readonly InputPortDefinition[];
    defaults: Record<string, unknown>;
}
export interface ResolveParamIssue {
    key: string;
    reason: "not-bindable" | "stale-input" | "disallowed-input" | "invalid-path" | "missing-value";
    message: string;
}
export interface ResolveParamValuesResult {
    values: Record<string, unknown>;
    issues: readonly ResolveParamIssue[];
}
export declare function isValidJsonPath(path: string): boolean;
export declare function resolveParamValues({ params, state, inputValues, inputPorts, defaults, }: ResolveParamValuesOptions): ResolveParamValuesResult;
export declare function resolveAllowedParamBindSources(descriptor: ParamDescriptor, inputPorts: readonly InputPortDefinition[]): readonly ParamBindSource[];

import type { ComponentDefinition, ParamValuesState } from "../sdk/public-sdk.js";
type StaticComponentDefinition = ComponentDefinition<any>;
export interface StaticComponentResolutionOptions {
    inputs?: Record<string, unknown>;
    paramValues?: ParamValuesState;
}
export declare function collectParamContractIssues(definition: StaticComponentDefinition, config: Record<string, unknown>, issues: string[]): void;
export declare function parseComponentConfig(definition: StaticComponentDefinition, config?: unknown): Record<string, unknown>;
export declare function resolveComponentConfig(definition: StaticComponentDefinition, config: unknown, options: StaticComponentResolutionOptions): Record<string, unknown>;
export declare function assertNoRawConfigStateProps(rawProps: Record<string, unknown>, context: string): void;
export {};

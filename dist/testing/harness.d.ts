import { type MountingOptions, type VueWrapper } from "@vue/test-utils";
import type { Component as VueComponent } from "vue";
import type { ComponentDefinition, ParamValuesState, StaticComponentTransformContext, StaticComponentTransformModule } from "../sdk/public-sdk.js";
import { type StaticComponentResolutionOptions } from "./config-resolution.js";
type MaybePromise<TValue> = TValue | Promise<TValue>;
type StaticComponentDefinition = ComponentDefinition<any>;
export interface StaticComponentContractCase {
    name: string;
    config?: Record<string, unknown>;
    check?: (context: StaticComponentContractCaseContext) => MaybePromise<void>;
}
export interface StaticComponentContractCaseContext {
    definition: StaticComponentDefinition;
    config: Record<string, unknown>;
}
export interface StaticComponentRenderCase {
    name: string;
    timeout?: number;
    paramValues?: ParamValuesState;
    inputs?: Record<string, unknown>;
    mountOptions?: StaticComponentMountOptions;
    check?: (context: StaticComponentRenderCaseContext) => MaybePromise<void>;
}
export interface StaticComponentRenderCaseContext {
    definition: StaticComponentDefinition;
    config: Record<string, unknown>;
    wrapper: VueWrapper;
    capturedEvents: CapturedComponentEvent[];
}
export interface CapturedComponentEvent {
    eventId: string;
    payload: unknown;
}
export type StaticComponentRendererWrapper = VueWrapper & {
    capturedEvents: CapturedComponentEvent[];
    resolvedConfig: Record<string, unknown>;
};
export interface StaticComponentTransformCase {
    name: string;
    config?: Record<string, unknown>;
    paramValues?: ParamValuesState;
    inputs?: Record<string, unknown>;
    check?: (context: StaticComponentTransformCaseContext) => MaybePromise<void>;
}
export interface StaticComponentTransformCaseContext {
    definition: StaticComponentDefinition;
    config: Record<string, unknown>;
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
    context: StaticComponentTransformContext<Record<string, unknown>>;
}
export interface StaticComponentMountOptions {
    props?: Record<string, unknown>;
    slots?: MountingOptions<unknown>["slots"];
}
interface LoadedStaticComponentModules {
    renderer: VueComponent;
    configPanel: VueComponent;
    transformModule: StaticComponentTransformModule;
}
export declare function describeStaticComponentContract(definition: StaticComponentDefinition, cases?: readonly StaticComponentContractCase[]): void;
export declare function describeStaticComponentRenderer(definition: StaticComponentDefinition, cases?: readonly StaticComponentRenderCase[]): void;
export declare function describeStaticComponentTransform(definition: StaticComponentDefinition, cases?: readonly StaticComponentTransformCase[]): void;
export declare function loadStaticComponentModules(definition: StaticComponentDefinition): Promise<LoadedStaticComponentModules>;
export declare function mountStaticComponentRenderer(definition: StaticComponentDefinition, options?: StaticComponentMountOptions, resolutionOptions?: StaticComponentResolutionOptions): Promise<StaticComponentRendererWrapper>;
export declare function mountStaticComponentConfigPanel(definition: StaticComponentDefinition, options?: StaticComponentMountOptions): Promise<VueWrapper<any, any>>;
export declare function executeStaticTransformCase(definition: StaticComponentDefinition, transformCase: StaticComponentTransformCase): Promise<{
    definition: StaticComponentDefinition;
    config: Record<string, unknown>;
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
    context: StaticComponentTransformContext<Record<string, unknown>, Record<string, unknown>, unknown>;
}>;
export declare function assertStaticComponentContract(definition: StaticComponentDefinition, config?: Record<string, unknown>): Promise<void>;
export {};

import type { StaticComponentTransformModule, TransformContext } from "./component-definition-types.js";
export declare function createPassthroughTransform(): Promise<StaticComponentTransformModule>;
export declare function createTransformContext<TConfig extends Record<string, unknown>, TInputs extends Record<string, unknown>>(config: TConfig, inputs: TInputs): TransformContext<TConfig, TInputs>;
export declare function getTransformInput<TValue = unknown>(context: TransformContext, portId: string): TValue | undefined;
export declare function requireTransformInput<TValue = unknown>(context: TransformContext, portId: string): TValue;

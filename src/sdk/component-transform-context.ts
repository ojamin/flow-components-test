import { z } from "zod";

import { jsonValueSchema } from "./schema-primitives";
import type {
  StaticComponentTransformModule,
  TransformContext,
} from "./component-definition-types";

export function createPassthroughTransform(): Promise<StaticComponentTransformModule> {
  return Promise.resolve({
    outputSchema: z.object({ all: jsonValueSchema.optional() }),
    transform: ({ inputs }) =>
      Object.prototype.hasOwnProperty.call(inputs, "data") ? { all: inputs.data } : {},
  });
}

export function createTransformContext<
  TConfig extends Record<string, unknown>,
  TInputs extends Record<string, unknown>,
>(config: TConfig, inputs: TInputs): TransformContext<TConfig, TInputs> {
  return { config, inputs };
}

export function getTransformInput<TValue = unknown>(
  context: TransformContext,
  portId: string,
): TValue | undefined {
  return context.inputs[portId] as TValue | undefined;
}

export function requireTransformInput<TValue = unknown>(
  context: TransformContext,
  portId: string,
): TValue {
  if (!(portId in context.inputs)) {
    throw new Error(`Missing required transform input "${portId}".`);
  }

  return context.inputs[portId] as TValue;
}

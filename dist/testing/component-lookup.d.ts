import type { ComponentDefinition } from "../sdk/public-sdk.js";
export declare function loadBuiltInComponentDefinition(componentId: string): Promise<ComponentDefinition<import("zod").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>> | undefined>;
export declare function loadRequiredBuiltInComponentDefinition(componentId: string): Promise<ComponentDefinition<import("zod").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>>>;

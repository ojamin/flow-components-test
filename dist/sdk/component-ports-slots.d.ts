import type { ZodTypeAny } from "zod";
import type { ComponentConfig, ComponentConfigInput, ComponentDefinition, ResolvedPorts, SlotDefinition } from "./component-definition-types.js";
export declare function resolveComponentPorts<TSchema extends ZodTypeAny>(definition: ComponentDefinition<TSchema>, config?: ComponentConfigInput<TSchema> | ComponentConfig<TSchema>): ResolvedPorts;
export declare function resolveComponentSlots<TSchema extends ZodTypeAny>(definition: ComponentDefinition<TSchema>, config?: ComponentConfigInput<TSchema> | ComponentConfig<TSchema>): SlotDefinition[];

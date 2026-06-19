import type { ZodTypeAny } from "zod";
import type { ComponentConfig, ComponentConfigInput, ComponentDefinition, ComponentDefinitionInput } from "./component-definition-types.js";
export declare function parseComponentConfig<TSchema extends ZodTypeAny>(schema: TSchema, config: ComponentConfigInput<TSchema> | ComponentConfig<TSchema>): ComponentConfig<TSchema>;
export declare function defineConfigDefaults<TSchema extends ZodTypeAny>(schema: TSchema): ComponentConfig<TSchema>;
export declare function resolveFixtureData(definition: ComponentDefinition): Promise<unknown>;
export declare function resolveFixtureVariants(definition: ComponentDefinition): Promise<Record<string, unknown>>;
export declare function defineComponent<TSchema extends ZodTypeAny>(definition: ComponentDefinitionInput<TSchema>): ComponentDefinition<TSchema>;

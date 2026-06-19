export declare const componentDefinition: import("@flow-builder/components/sdk").ComponentDefinition<import("zod").ZodObject<{
    brand: import("zod").ZodDefault<import("zod").ZodString>;
    edition: import("zod").ZodDefault<import("zod").ZodString>;
    timestamp: import("zod").ZodDefault<import("zod").ZodString>;
    freshness: import("zod").ZodDefault<import("zod").ZodString>;
    mode: import("zod").ZodDefault<import("zod").ZodEnum<{
        producer: "producer";
        air: "air";
        standby: "standby";
    }>>;
    ticker: import("zod").ZodDefault<import("zod").ZodString>;
}, import("zod/v4/core").$strip>>;
export default componentDefinition;

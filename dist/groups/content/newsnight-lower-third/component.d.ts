export declare const componentDefinition: import("@flow-builder/components/sdk").ComponentDefinition<import("zod").ZodObject<{
    eyebrow: import("zod").ZodDefault<import("zod").ZodString>;
    headline: import("zod").ZodDefault<import("zod").ZodString>;
    subline: import("zod").ZodDefault<import("zod").ZodString>;
    tone: import("zod").ZodDefault<import("zod").ZodEnum<{
        neutral: "neutral";
        breaking: "breaking";
        projected: "projected";
        hold: "hold";
    }>>;
}, import("zod/v4/core").$strip>>;
export default componentDefinition;

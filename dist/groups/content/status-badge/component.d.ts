export declare const componentDefinition: import("@flow-builder/components/sdk").ComponentDefinition<import("zod").ZodObject<{
    label: import("zod").ZodDefault<import("zod").ZodString>;
    value: import("zod").ZodDefault<import("zod").ZodString>;
    tone: import("zod").ZodDefault<import("zod").ZodEnum<{
        success: "success";
        warning: "warning";
        neutral: "neutral";
        danger: "danger";
    }>>;
    size: import("zod").ZodDefault<import("zod").ZodEnum<{
        sm: "sm";
        md: "md";
    }>>;
}, import("zod/v4/core").$strip>>;
export default componentDefinition;

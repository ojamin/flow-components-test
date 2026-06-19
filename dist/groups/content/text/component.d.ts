export declare const componentDefinition: import("@flow-builder/components/sdk").ComponentDefinition<import("zod").ZodObject<{
    text: import("zod").ZodDefault<import("zod").ZodString>;
    prose: import("zod").ZodDefault<import("zod").ZodBoolean>;
    align: import("zod").ZodDefault<import("zod").ZodEnum<{
        left: "left";
        right: "right";
        center: "center";
    }>>;
    clampLines: import("zod").ZodDefault<import("zod").ZodEnum<{
        none: "none";
        2: "2";
        3: "3";
        4: "4";
        5: "5";
        6: "6";
    }>>;
}, import("zod/v4/core").$strip>>;
export default componentDefinition;

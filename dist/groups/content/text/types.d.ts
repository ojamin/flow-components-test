import { z } from "zod";
export declare const textParams: {
    text: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    prose: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodBoolean>>;
    align: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodEnum<{
        left: "left";
        right: "right";
        center: "center";
    }>>>;
    clampLines: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodEnum<{
        none: "none";
        2: "2";
        3: "3";
        4: "4";
        5: "5";
        6: "6";
    }>>>;
};
export declare const textConfigSchema: z.ZodObject<{
    text: z.ZodDefault<z.ZodString>;
    prose: z.ZodDefault<z.ZodBoolean>;
    align: z.ZodDefault<z.ZodEnum<{
        left: "left";
        right: "right";
        center: "center";
    }>>;
    clampLines: z.ZodDefault<z.ZodEnum<{
        none: "none";
        2: "2";
        3: "3";
        4: "4";
        5: "5";
        6: "6";
    }>>;
}, z.core.$strip>;
export type TextConfig = z.output<typeof textConfigSchema>;
export declare const textConfigDefaults: import("@flow-builder/components/sdk").ComponentConfig<z.ZodObject<{
    text: z.ZodDefault<z.ZodString>;
    prose: z.ZodDefault<z.ZodBoolean>;
    align: z.ZodDefault<z.ZodEnum<{
        left: "left";
        right: "right";
        center: "center";
    }>>;
    clampLines: z.ZodDefault<z.ZodEnum<{
        none: "none";
        2: "2";
        3: "3";
        4: "4";
        5: "5";
        6: "6";
    }>>;
}, z.core.$strip>>;
export declare const textTransformOutputSchema: z.ZodObject<{
    all: z.ZodOptional<z.ZodType<import("@flow-builder/components/sdk").JsonValue, unknown, z.core.$ZodTypeInternals<import("@flow-builder/components/sdk").JsonValue, unknown>>>;
}, z.core.$strip>;
export interface TextFixtureData {
    emptyStateTitle: string;
    emptyStateHint: string;
}

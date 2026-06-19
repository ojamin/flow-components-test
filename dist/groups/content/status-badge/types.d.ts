import { z } from "zod";
export declare const statusBadgeToneOptions: readonly ["neutral", "success", "warning", "danger"];
export declare const statusBadgeSizeOptions: readonly ["sm", "md"];
export declare const StatusBadgeParams: {
    label: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    value: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    tone: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodEnum<{
        success: "success";
        warning: "warning";
        neutral: "neutral";
        danger: "danger";
    }>>>;
    size: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodEnum<{
        sm: "sm";
        md: "md";
    }>>>;
};
export declare const StatusBadgeConfigSchema: z.ZodObject<{
    label: z.ZodDefault<z.ZodString>;
    value: z.ZodDefault<z.ZodString>;
    tone: z.ZodDefault<z.ZodEnum<{
        success: "success";
        warning: "warning";
        neutral: "neutral";
        danger: "danger";
    }>>;
    size: z.ZodDefault<z.ZodEnum<{
        sm: "sm";
        md: "md";
    }>>;
}, z.core.$strip>;
export type StatusBadgeConfig = z.output<typeof StatusBadgeConfigSchema>;
export declare const StatusBadgeConfigDefaults: import("@flow-builder/components/sdk").ComponentConfig<z.ZodObject<{
    label: z.ZodDefault<z.ZodString>;
    value: z.ZodDefault<z.ZodString>;
    tone: z.ZodDefault<z.ZodEnum<{
        success: "success";
        warning: "warning";
        neutral: "neutral";
        danger: "danger";
    }>>;
    size: z.ZodDefault<z.ZodEnum<{
        sm: "sm";
        md: "md";
    }>>;
}, z.core.$strip>>;
export interface StatusBadgeFixtureData {
    emptyStateTitle: string;
}

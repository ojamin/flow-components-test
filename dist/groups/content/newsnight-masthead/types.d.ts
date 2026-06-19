import { z } from "zod";
export declare const newsroomModeOptions: readonly ["producer", "air", "standby"];
export declare const NewsnightMastheadParams: {
    brand: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    edition: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    timestamp: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    freshness: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    mode: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodEnum<{
        producer: "producer";
        air: "air";
        standby: "standby";
    }>>>;
    ticker: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
};
export declare const NewsnightMastheadConfigSchema: z.ZodObject<{
    brand: z.ZodDefault<z.ZodString>;
    edition: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodDefault<z.ZodString>;
    freshness: z.ZodDefault<z.ZodString>;
    mode: z.ZodDefault<z.ZodEnum<{
        producer: "producer";
        air: "air";
        standby: "standby";
    }>>;
    ticker: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type NewsnightMastheadConfig = z.output<typeof NewsnightMastheadConfigSchema>;
export declare const NewsnightMastheadConfigDefaults: import("@flow-builder/components/sdk").ComponentConfig<z.ZodObject<{
    brand: z.ZodDefault<z.ZodString>;
    edition: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodDefault<z.ZodString>;
    freshness: z.ZodDefault<z.ZodString>;
    mode: z.ZodDefault<z.ZodEnum<{
        producer: "producer";
        air: "air";
        standby: "standby";
    }>>;
    ticker: z.ZodDefault<z.ZodString>;
}, z.core.$strip>>;

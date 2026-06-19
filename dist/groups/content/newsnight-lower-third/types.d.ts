import { z } from "zod";
export declare const lowerThirdToneOptions: readonly ["neutral", "breaking", "projected", "hold"];
export declare const NewsnightLowerThirdParams: {
    eyebrow: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    headline: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    subline: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    tone: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodEnum<{
        neutral: "neutral";
        breaking: "breaking";
        projected: "projected";
        hold: "hold";
    }>>>;
};
export declare const NewsnightLowerThirdConfigSchema: z.ZodObject<{
    eyebrow: z.ZodDefault<z.ZodString>;
    headline: z.ZodDefault<z.ZodString>;
    subline: z.ZodDefault<z.ZodString>;
    tone: z.ZodDefault<z.ZodEnum<{
        neutral: "neutral";
        breaking: "breaking";
        projected: "projected";
        hold: "hold";
    }>>;
}, z.core.$strip>;
export type NewsnightLowerThirdConfig = z.output<typeof NewsnightLowerThirdConfigSchema>;
export declare const NewsnightLowerThirdConfigDefaults: import("@flow-builder/components/sdk").ComponentConfig<z.ZodObject<{
    eyebrow: z.ZodDefault<z.ZodString>;
    headline: z.ZodDefault<z.ZodString>;
    subline: z.ZodDefault<z.ZodString>;
    tone: z.ZodDefault<z.ZodEnum<{
        neutral: "neutral";
        breaking: "breaking";
        projected: "projected";
        hold: "hold";
    }>>;
}, z.core.$strip>>;

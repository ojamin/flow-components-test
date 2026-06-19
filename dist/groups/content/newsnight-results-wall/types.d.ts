import { z } from "zod";
export declare const NewsnightResultsWallParams: {
    raceTitle: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    raceStatus: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    candidateA: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    candidateAVotes: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodNumber>>;
    candidateB: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
    candidateBVotes: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodNumber>>;
    precinctsReporting: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodNumber>>;
    selectedCounty: import("@flow-builder/components/sdk").ParamDescriptor<z.ZodDefault<z.ZodString>>;
};
export declare const NewsnightResultsWallConfigSchema: z.ZodObject<{
    raceTitle: z.ZodDefault<z.ZodString>;
    raceStatus: z.ZodDefault<z.ZodString>;
    candidateA: z.ZodDefault<z.ZodString>;
    candidateAVotes: z.ZodDefault<z.ZodNumber>;
    candidateB: z.ZodDefault<z.ZodString>;
    candidateBVotes: z.ZodDefault<z.ZodNumber>;
    precinctsReporting: z.ZodDefault<z.ZodNumber>;
    selectedCounty: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type NewsnightResultsWallConfig = z.output<typeof NewsnightResultsWallConfigSchema>;
export declare const NewsnightResultsWallConfigDefaults: import("@flow-builder/components/sdk").ComponentConfig<z.ZodObject<{
    raceTitle: z.ZodDefault<z.ZodString>;
    raceStatus: z.ZodDefault<z.ZodString>;
    candidateA: z.ZodDefault<z.ZodString>;
    candidateAVotes: z.ZodDefault<z.ZodNumber>;
    candidateB: z.ZodDefault<z.ZodString>;
    candidateBVotes: z.ZodDefault<z.ZodNumber>;
    precinctsReporting: z.ZodDefault<z.ZodNumber>;
    selectedCounty: z.ZodDefault<z.ZodString>;
}, z.core.$strip>>;

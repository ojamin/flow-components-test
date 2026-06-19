import { z } from "zod";

import {
  defineConfigDefaults,
  param,
  paramsToConfigSchema,
  selectParam,
  type ComponentParams,
} from "@flow-builder/components/sdk";

export const lowerThirdToneOptions = ["neutral", "breaking", "projected", "hold"] as const;

export const NewsnightLowerThirdParams = {
  eyebrow: param(z.string().trim().default("Election Night / Ready for air"), {
    label: "Eyebrow",
    control: { kind: "input", placeholder: "Election Night / Ready for air" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  headline: param(z.string().trim().default("Colorado Governor remains too early to call"), {
    label: "Headline",
    control: { kind: "input", placeholder: "Lower-third headline" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  subline: param(z.string().trim().default("74% reporting / Vega +3.5 / Pueblo batch under verification"), {
    label: "Subline",
    control: { kind: "input", placeholder: "Subline" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  tone: selectParam(z.enum(lowerThirdToneOptions).default("hold"), {
    label: "Tone",
    options: lowerThirdToneOptions,
  }),
} satisfies ComponentParams;

export const NewsnightLowerThirdConfigSchema = paramsToConfigSchema(NewsnightLowerThirdParams);

export type NewsnightLowerThirdConfig = z.output<typeof NewsnightLowerThirdConfigSchema>;

export const NewsnightLowerThirdConfigDefaults = defineConfigDefaults(NewsnightLowerThirdConfigSchema);

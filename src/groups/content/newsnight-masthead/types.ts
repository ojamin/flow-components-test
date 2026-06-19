import { z } from "zod";

import {
  defineConfigDefaults,
  param,
  paramsToConfigSchema,
  selectParam,
  type ComponentParams,
} from "@flow-builder/components/sdk";

export const newsroomModeOptions = ["producer", "air", "standby"] as const;

export const NewsnightMastheadParams = {
  brand: param(z.string().trim().default("NEWSNIGHT LIVE"), {
    label: "Brand",
    control: { kind: "input", placeholder: "NEWSNIGHT LIVE" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  edition: param(z.string().trim().default("Election Desk / Colorado 2026"), {
    label: "Edition",
    control: { kind: "input", placeholder: "Election Desk / Colorado 2026" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  timestamp: param(z.string().trim().default("22:14:08 MT"), {
    label: "Timestamp",
    control: { kind: "input", placeholder: "22:14:08 MT" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  freshness: param(z.string().trim().default("AP + state feeds refreshed 38s ago"), {
    label: "Freshness",
    control: { kind: "input", placeholder: "Data freshness" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  mode: selectParam(z.enum(newsroomModeOptions).default("producer"), {
    label: "Mode",
    options: newsroomModeOptions,
  }),
  ticker: param(
    z
      .string()
      .trim()
      .default(
        "Denver margin narrows to D +18.4 | Mesa County first rural batch posted | Verification hold in Pueblo precinct 14",
      ),
    {
      label: "Ticker items",
      control: { kind: "textarea", placeholder: "Separate ticker items with |" },
      bindable: true,
      bindFrom: [{ input: "data", typeId: "all-data" }],
    },
  ),
} satisfies ComponentParams;

export const NewsnightMastheadConfigSchema = paramsToConfigSchema(NewsnightMastheadParams);

export type NewsnightMastheadConfig = z.output<typeof NewsnightMastheadConfigSchema>;

export const NewsnightMastheadConfigDefaults = defineConfigDefaults(NewsnightMastheadConfigSchema);

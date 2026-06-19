import { z } from "zod";

import {
  defineConfigDefaults,
  param,
  paramsToConfigSchema,
  type ComponentParams,
} from "@flow-builder/components/sdk";

export const NewsnightResultsWallParams = {
  raceTitle: param(z.string().trim().default("Colorado Governor"), {
    label: "Race title",
    control: { kind: "input", placeholder: "Colorado Governor" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  raceStatus: param(z.string().trim().default("Too early to call"), {
    label: "Race status",
    control: { kind: "input", placeholder: "Too early to call" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  candidateA: param(z.string().trim().default("Marisol Vega"), {
    label: "Candidate A",
    control: { kind: "input", placeholder: "Candidate A" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  candidateAVotes: param(z.number().int().nonnegative().default(1284092), {
    label: "Candidate A votes",
    control: { kind: "number", min: 0, step: 1000 },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  candidateB: param(z.string().trim().default("Evan Cross"), {
    label: "Candidate B",
    control: { kind: "input", placeholder: "Candidate B" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  candidateBVotes: param(z.number().int().nonnegative().default(1197840), {
    label: "Candidate B votes",
    control: { kind: "number", min: 0, step: 1000 },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  precinctsReporting: param(z.number().min(0).max(100).default(74), {
    label: "Precincts reporting",
    control: { kind: "number", min: 0, max: 100, step: 1 },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  selectedCounty: param(z.string().trim().default("Jefferson County"), {
    label: "Selected county",
    control: { kind: "input", placeholder: "Jefferson County" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
} satisfies ComponentParams;

export const NewsnightResultsWallConfigSchema = paramsToConfigSchema(NewsnightResultsWallParams);

export type NewsnightResultsWallConfig = z.output<typeof NewsnightResultsWallConfigSchema>;

export const NewsnightResultsWallConfigDefaults = defineConfigDefaults(NewsnightResultsWallConfigSchema);

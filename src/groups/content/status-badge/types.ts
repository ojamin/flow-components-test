import { z } from "zod";

import {
  defineConfigDefaults,
  param,
  paramsToConfigSchema,
  selectParam,
  type ComponentParams,
} from "@flow-builder/components/sdk";

export const statusBadgeToneOptions = ["neutral", "success", "warning", "danger"] as const;
export const statusBadgeSizeOptions = ["sm", "md"] as const;

export const StatusBadgeParams = {
  label: param(z.string().trim().default("System status"), {
    label: "Label",
    control: {
      kind: "input",
      placeholder: "Metric label",
      testId: "status-badge-label-input",
    },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  value: param(z.string().trim().default("Operational"), {
    label: "Value",
    control: {
      kind: "input",
      placeholder: "Displayed status",
      testId: "status-badge-value-input",
    },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  tone: selectParam(z.enum(statusBadgeToneOptions).default("success"), {
    label: "Tone",
    options: statusBadgeToneOptions,
    testId: "status-badge-tone-select",
  }),
  size: selectParam(z.enum(statusBadgeSizeOptions).default("md"), {
    label: "Size",
    options: statusBadgeSizeOptions,
    testId: "status-badge-size-select",
  }),
} satisfies ComponentParams;

export const StatusBadgeConfigSchema = paramsToConfigSchema(StatusBadgeParams);

export type StatusBadgeConfig = z.output<typeof StatusBadgeConfigSchema>;

export const StatusBadgeConfigDefaults = defineConfigDefaults(StatusBadgeConfigSchema);

export interface StatusBadgeFixtureData {
  emptyStateTitle: string;
}

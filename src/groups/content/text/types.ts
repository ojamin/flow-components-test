import { z } from "zod";

import {
  defineConfigDefaults,
  jsonValueSchema,
  param,
  paramsToConfigSchema,
  selectParam,
  type ComponentParams,
} from "@flow-builder/components/sdk";
import { clampLineOptions, contentAlignOptions } from "../../../sdk/content-primitives";

export const textParams = {
  text: param(z.string().trim().default("Your content goes here."), {
    label: "Text",
    control: {
      kind: "textarea",
      rows: 4,
      placeholder: "Enter paragraph text, or bind to a data field…",
      testId: "text-body-input",
    },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  prose: param(z.boolean().default(true), {
    label: "Prose styling",
    helpText:
      "Adds heading sizes, paragraph spacing, and list styles. Off shows plain unstyled text.",
    control: { kind: "boolean", testId: "text-prose-toggle" },
  }),
  align: selectParam(z.enum(contentAlignOptions).default("left"), {
    label: "Alignment",
    options: contentAlignOptions,
    testId: "text-align-select",
  }),
  clampLines: selectParam(z.enum(clampLineOptions).default("none"), {
    label: "Clamp lines",
    options: clampLineOptions,
    helpText:
      "Truncates visible lines at this limit. None renders all content regardless of height.",
    testId: "text-clamp-lines-select",
  }),
} satisfies ComponentParams;

export const textConfigSchema = paramsToConfigSchema(textParams);

export type TextConfig = z.output<typeof textConfigSchema>;

export const textConfigDefaults = defineConfigDefaults(textConfigSchema);

export const textTransformOutputSchema = z.object({
  all: jsonValueSchema.optional(),
});

export interface TextFixtureData {
  emptyStateTitle: string;
  emptyStateHint: string;
}

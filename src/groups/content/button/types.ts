import { z } from "zod";

import {
  defineConfigDefaults,
  jsonValueSchema,
  param,
  paramsToConfigSchema,
  type ComponentParams,
} from "@flow-builder/components/sdk";
import { buttonTargetOptions } from "../../../sdk/content-primitives";

export const contentButtonVariantOptions = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "link",
  "destructive",
] as const;

export const contentButtonSizeOptions = ["xs", "sm", "default", "lg", "icon"] as const;

export const buttonParams = {
  label: param(z.string().default("Learn more"), {
    label: "Label",
    control: {
      kind: "input",
      placeholder: "Learn more",
      testId: "button-label-input",
    },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  href: param(z.string().trim().default(""), {
    label: "Href",
    control: {
      kind: "input",
      placeholder: "https://example.com",
      testId: "button-href-input",
    },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  variant: param(z.enum(contentButtonVariantOptions).default("default"), {
    label: "Variant",
    control: {
      kind: "select",
      options: contentButtonVariantOptions.map((value) => ({
        label: value.charAt(0).toUpperCase() + value.slice(1),
        value,
      })),
    },
  }),
  size: param(z.enum(contentButtonSizeOptions).default("default"), {
    label: "Size",
    control: {
      kind: "select",
      options: contentButtonSizeOptions.map((value) => ({
        label: value.toUpperCase(),
        value,
      })),
    },
  }),
  target: param(z.enum(buttonTargetOptions).default("self"), {
    label: "Target",
    control: {
      kind: "select",
      options: [
        { label: "Same tab", value: "self" },
        { label: "New tab", value: "blank" },
      ],
    },
  }),
  // Optional view-request target: when non-empty, clicking the button also
  // emits a `viewRequested` event with this id as the payload's `activeViewId`.
  // This is the author-facing seam for the Flow-edge control contract
  // (Button/Nav requestedViewId -> ViewStack activeViewId) without forcing the
  // runtime graph to mutate ViewStack state directly.
  requestedViewId: param(z.string().trim().default(""), {
    label: "Requested view ID",
    control: {
      kind: "input",
      placeholder: "details",
      testId: "button-requested-view-id-input",
    },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  leadingIcon: param(z.string().trim().default(""), {
    label: "Leading icon",
    helpText: "Optional Iconify icon name, for example lucide:arrow-right.",
    control: {
      kind: "input",
      placeholder: "lucide:arrow-right",
      testId: "button-leading-icon-input",
    },
  }),
  trailingIcon: param(z.string().trim().default(""), {
    label: "Trailing icon",
    helpText: "Optional Iconify icon name rendered after the label.",
    control: {
      kind: "input",
      placeholder: "lucide:chevron-right",
      testId: "button-trailing-icon-input",
    },
  }),
  accessibleLabel: param(z.string().trim().default(""), {
    label: "Accessible label",
    helpText:
      "Required for icon-only buttons and useful when the visible label needs more context.",
    control: {
      kind: "input",
      placeholder: "Open details",
      testId: "button-accessible-label-input",
    },
  }),
  disabled: param(z.boolean().default(false), {
    label: "Disabled",
    helpText: "Prevents pointer and keyboard activation while keeping the button visible.",
    control: { kind: "boolean" },
  }),
  disabledReason: param(z.string().trim().default(""), {
    label: "Disabled reason",
    helpText: "Optional accessible context for why the button cannot be activated.",
    control: {
      kind: "input",
      placeholder: "Complete the previous step first",
      testId: "button-disabled-reason-input",
    },
  }),
} satisfies ComponentParams;

export const buttonConfigSchema = paramsToConfigSchema(buttonParams);

export type ButtonConfig = z.output<typeof buttonConfigSchema>;

export const buttonConfigDefaults = defineConfigDefaults(buttonConfigSchema);

export const buttonTransformOutputSchema = z.object({
  all: jsonValueSchema.optional(),
});

export interface ButtonFixtureData {
  emptyLabel: string;
}

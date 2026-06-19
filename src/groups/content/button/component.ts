import { z } from "zod";
import {
  createPassthroughTransform,
  defineComponent,
  type ComponentThemeContract,
} from "@flow-builder/components/sdk";

import { viewRequestedPayloadSchema } from "../../../shared/view-container";

import { buttonConfigDefaults, buttonConfigSchema, buttonParams } from "./types";

const clickedPayloadSchema = z.object({ at: z.string().datetime() });

const themeContract: ComponentThemeContract = {
  consumes: [
    {
      propertyKey: "color.accent",
      note: "Interactive accents, highlights, and selected states.",
    },
    {
      propertyKey: "color.accentForeground",
      note: "Text and icons displayed on accent surfaces.",
    },
    {
      propertyKey: "color.border",
      note: "Component borders, dividers, and outlines.",
    },
    {
      propertyKey: "color.input",
      note: "Outline button border color aligned with form/control boundaries.",
    },
    {
      propertyKey: "color.secondary",
      note: "Secondary button surface.",
    },
    {
      propertyKey: "color.secondaryForeground",
      note: "Text and icons displayed on secondary button surfaces.",
    },
    {
      propertyKey: "color.destructive",
      note: "Destructive button surface and critical action emphasis.",
    },
    {
      propertyKey: "color.destructiveForeground",
      note: "Text and icons displayed on destructive button surfaces.",
    },
    {
      propertyKey: "color.focusRing",
      note: "Keyboard focus rings and active outlines.",
    },
    {
      propertyKey: "color.foreground",
      note: "Primary content text and icons.",
    },
    {
      propertyKey: "color.foregroundMuted",
      note: "Secondary labels, helper copy, and empty states.",
    },
    {
      propertyKey: "color.surface",
      note: "Primary component surfaces.",
    },
    {
      propertyKey: "color.surfaceMuted",
      note: "Muted panels, empty states, and hover surfaces.",
    },
  ],
};

export const componentDefinition = defineComponent({
  id: "demo.demo-button",
  version: 1,
  displayName: "Button",
  description: "CTA button with safe-link preview behavior and disabled fallbacks.",
  icon: "square-arrow-out-up-right",
  category: "content",
  renderable: true,
  configSchema: buttonConfigSchema,
  configDefaults: buttonConfigDefaults,
  params: buttonParams,
  themeContract,
  builder: {
    defaultSize: { w: 8, h: 2 },
    minSize: { w: 3, h: 2 },
    resizeX: true,
    resizeY: false,
    heightMode: "content",
    draggable: true,
    wrapperVariant: "default",
  },
  flow: {
    scaffolded: true,
  },
  inputs: [
    {
      id: "data",
      label: "Data",
      mode: "full",
      acceptedTypeIds: ["all-data"],
      required: false,
      allowMultiple: false,
      allowCycle: false,
    },
  ],
  outputs: [
    {
      id: "all",
      label: "All data",
      typeId: "all-data",
    },
    {
      id: "clickedAt",
      label: "Clicked at",
      typeId: "event-timestamp",
    },
    {
      // Event-managed output for the Flow-edge view-control contract. Stays
      // unset until the button emits `viewRequested` with a non-empty payload;
      // the host runtime then projects the requested id onto this output so a
      // Flow edge can feed ViewStack `activeViewId` without direct mutation.
      id: "requestedViewId",
      label: "Requested view ID",
      typeId: "text-value",
    },
  ],
  events: [
    {
      id: "clicked",
      label: "Clicked",
      description: "Emitted when the button is activated.",
      payloadSchema: clickedPayloadSchema,
    },
    {
      id: "viewRequested",
      label: "View requested",
      description:
        "Emitted when the button is activated and a non-empty Requested view ID is configured. Carries the requested view id and optional hash slug for view-container targets.",
      payloadSchema: viewRequestedPayloadSchema,
    },
  ],
  eventOutputs: [
    {
      eventId: "clicked",
      outputId: "clickedAt",
      project: (payload) => clickedPayloadSchema.parse(payload).at,
    },
    {
      // Project the validated `viewRequested` payload's `activeViewId` onto the
      // graph-visible `requestedViewId` output. This is the single seam that
      // turns a control-side event into a Flow-routable value; ViewStack stays
      // unaware of the source and simply consumes its `activeViewId` input.
      eventId: "viewRequested",
      outputId: "requestedViewId",
      project: (payload) => viewRequestedPayloadSchema.parse(payload).activeViewId,
    },
  ],
  renderer: async () => (await import("./Renderer.vue")).default,
  configPanel: async () => (await import("./ConfigPanel.vue")).default,
  transform: createPassthroughTransform,
  fixtureVariants: [
    { id: "default", label: "Default button" },
    { id: "empty", label: "Missing label", appliesTo: "config" },
    { id: "disabled", label: "Disabled action", appliesTo: "config" },
  ],
  stateSupport: {
    empty: true,
    loading: { notApplicable: "Button does not perform component-owned async work." },
    error: {
      notApplicable:
        "Invalid or missing navigation targets render disabled fallbacks, not error UI.",
    },
    disabled: true,
    focus: true,
    keyboard: true,
    responsive: true,
  },
  loadFixtureData: async () => (await import("./fixtures/sample-data.json")).default,
  loadFixtureVariants: async () => ({
    default: (await import("./fixtures/sample-data.json")).default,
    empty: { label: "" },
    disabled: { label: "Action unavailable in this fixture.", href: "" },
  }),
});

export default componentDefinition;

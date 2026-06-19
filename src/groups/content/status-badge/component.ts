import {
  createPassthroughTransform,
  defineComponent,
  type ComponentThemeContract,
} from "@flow-builder/components/sdk";

import { StatusBadgeConfigDefaults, StatusBadgeConfigSchema, StatusBadgeParams } from "./types";

const themeContract: ComponentThemeContract = {
  consumes: [
    {
      propertyKey: "color.accent",
      note: "Success and neutral badge emphasis.",
    },
    {
      propertyKey: "color.border",
      note: "Badge outline and empty-state boundary.",
    },
    {
      propertyKey: "color.destructive",
      note: "Danger status emphasis.",
    },
    {
      propertyKey: "color.foreground",
      note: "Primary label and value text.",
    },
    {
      propertyKey: "color.foregroundMuted",
      note: "Secondary label and empty-state copy.",
    },
    {
      propertyKey: "color.surfaceMuted",
      note: "Muted badge surfaces.",
    },
  ],
};

export const componentDefinition = defineComponent({
  id: "content.status-badge",
  version: 1,
  displayName: "Status Badge",
  description: "Compact status badge for operational labels, counts, and health states.",
  icon: "badge-check",
  category: "content",
  renderable: true,
  configSchema: StatusBadgeConfigSchema,
  configDefaults: StatusBadgeConfigDefaults,
  params: StatusBadgeParams,
  themeContract,
  builder: {
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 3, h: 2 },
    resizeX: true,
    resizeY: false,
    heightMode: "content",
    draggable: true,
    wrapperVariant: "default",
  },
  flow: { scaffolded: true, tint: "content" },
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
  outputs: [{ id: "all", label: "All data", typeId: "all-data" }],
  renderer: async () => (await import("./Renderer.vue")).default,
  configPanel: async () => (await import("./ConfigPanel.vue")).default,
  transform: createPassthroughTransform,
  fixtureVariants: [
    { id: "default", label: "Default status" },
    {
      id: "empty",
      label: "Missing status copy",
      description: "Label and value are both empty.",
      appliesTo: "config",
    },
    {
      id: "warning",
      label: "Warning tone",
      description: "Operational warning state.",
      appliesTo: "config",
    },
  ],
  stateSupport: {
    empty: true,
    loading: { notApplicable: "Status Badge renders already-resolved config and input data." },
    error: { notApplicable: "Status Badge has no component-owned fallible runtime operation." },
    disabled: { notApplicable: "Status Badge is non-interactive." },
    focus: { notApplicable: "Status Badge exposes no focusable renderer surface." },
    keyboard: { notApplicable: "Status Badge exposes no keyboard interaction." },
    responsive: true,
  },
  loadFixtureData: async () => (await import("./fixtures/sample-data.json")).default,
  loadFixtureVariants: async () => ({
    default: (await import("./fixtures/sample-data.json")).default,
    empty: { label: "", value: "" },
    warning: { label: "API latency", value: "Elevated", tone: "warning" },
  }),
});

export default componentDefinition;

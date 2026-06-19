import {
  createPassthroughTransform,
  defineComponent,
  type ComponentThemeContract,
} from "@flow-builder/components/sdk";

import {
  NewsnightMastheadConfigDefaults,
  NewsnightMastheadConfigSchema,
  NewsnightMastheadParams,
} from "./types";

const themeContract: ComponentThemeContract = {
  consumes: [
    { propertyKey: "color.pageBackground", note: "Broadcast masthead base." },
    { propertyKey: "color.foreground", note: "Primary masthead text." },
    { propertyKey: "color.foregroundMuted", note: "Secondary labels and ticker copy." },
    { propertyKey: "color.border", note: "Subtle dividers and control outlines." },
    { propertyKey: "color.destructive", note: "Live and breaking-news emphasis." },
    { propertyKey: "color.accent", note: "Producer-mode and data freshness emphasis." },
  ],
};

export const componentDefinition = defineComponent({
  id: "content.newsnight-masthead",
  version: 1,
  displayName: "Newsnight Masthead",
  description: "Broadcast masthead with live state, producer mode, freshness, and ticker strip.",
  icon: "radio-tower",
  category: "content",
  renderable: true,
  configSchema: NewsnightMastheadConfigSchema,
  configDefaults: NewsnightMastheadConfigDefaults,
  params: NewsnightMastheadParams,
  themeContract,
  builder: {
    defaultSize: { w: 48, h: 9 },
    minSize: { w: 20, h: 6 },
    resizeX: true,
    resizeY: true,
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
  fixtureVariants: [{ id: "default", label: "Broadcast masthead" }],
  stateSupport: {
    empty: { notApplicable: "Masthead always renders from configured broadcast copy." },
    loading: { notApplicable: "Masthead has no component-owned async operation." },
    error: { notApplicable: "Masthead has no component-owned fallible runtime operation." },
    disabled: { notApplicable: "Masthead is display-only." },
    focus: { notApplicable: "Masthead has no focusable renderer controls." },
    keyboard: { notApplicable: "Masthead exposes no keyboard interaction." },
    responsive: true,
  },
  loadFixtureData: async () => (await import("./fixtures/sample-data.json")).default,
});

export default componentDefinition;

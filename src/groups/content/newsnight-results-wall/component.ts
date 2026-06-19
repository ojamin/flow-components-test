import {
  createPassthroughTransform,
  defineComponent,
  type ComponentThemeContract,
} from "@flow-builder/components/sdk";

import {
  NewsnightResultsWallConfigDefaults,
  NewsnightResultsWallConfigSchema,
  NewsnightResultsWallParams,
} from "./types";

const themeContract: ComponentThemeContract = {
  consumes: [
    { propertyKey: "color.pageBackground", note: "Results wall base." },
    { propertyKey: "color.foreground", note: "Primary labels and headline values." },
    { propertyKey: "color.foregroundMuted", note: "Secondary labels and metadata." },
    { propertyKey: "color.border", note: "Dense broadcast panel separation." },
    { propertyKey: "color.destructive", note: "Alerts and Republican-style result accents." },
    { propertyKey: "color.accent", note: "Democratic-style result accents and selected map state." },
  ],
};

export const componentDefinition = defineComponent({
  id: "content.newsnight-results-wall",
  version: 1,
  displayName: "Newsnight Results Wall",
  description: "Full broadcast results wall with race call, map board, newsroom rail, and analytics strip.",
  icon: "panel-top",
  category: "content",
  renderable: true,
  configSchema: NewsnightResultsWallConfigSchema,
  configDefaults: NewsnightResultsWallConfigDefaults,
  params: NewsnightResultsWallParams,
  themeContract,
  builder: {
    defaultSize: { w: 48, h: 74 },
    minSize: { w: 28, h: 42 },
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
  fixtureVariants: [{ id: "default", label: "Newsroom results wall" }],
  stateSupport: {
    empty: { notApplicable: "Results wall ships with configured demo data." },
    loading: { notApplicable: "Results wall has no component-owned async operation." },
    error: { notApplicable: "Results wall has no component-owned fallible runtime operation." },
    disabled: { notApplicable: "Results wall is display-only." },
    focus: { notApplicable: "Results wall has no focusable renderer controls." },
    keyboard: { notApplicable: "Results wall exposes no keyboard interaction." },
    responsive: true,
  },
  loadFixtureData: async () => (await import("./fixtures/sample-data.json")).default,
});

export default componentDefinition;

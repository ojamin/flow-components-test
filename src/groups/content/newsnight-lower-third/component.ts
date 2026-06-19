import {
  createPassthroughTransform,
  defineComponent,
  type ComponentThemeContract,
} from "@flow-builder/components/sdk";

import {
  NewsnightLowerThirdConfigDefaults,
  NewsnightLowerThirdConfigSchema,
  NewsnightLowerThirdParams,
} from "./types";

const themeContract: ComponentThemeContract = {
  consumes: [
    { propertyKey: "color.pageBackground", note: "Preview base." },
    { propertyKey: "color.foreground", note: "Headline text." },
    { propertyKey: "color.foregroundMuted", note: "Secondary copy." },
    { propertyKey: "color.border", note: "Broadcast frame outlines." },
    { propertyKey: "color.destructive", note: "Breaking and hold tones." },
    { propertyKey: "color.accent", note: "Projected and ready tones." },
  ],
};

export const componentDefinition = defineComponent({
  id: "content.newsnight-lower-third",
  version: 1,
  displayName: "Newsnight Lower Third",
  description: "Broadcast lower-third preview with air-readiness and tone states.",
  icon: "captions",
  category: "content",
  renderable: true,
  configSchema: NewsnightLowerThirdConfigSchema,
  configDefaults: NewsnightLowerThirdConfigDefaults,
  params: NewsnightLowerThirdParams,
  themeContract,
  builder: {
    defaultSize: { w: 48, h: 10 },
    minSize: { w: 18, h: 7 },
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
  fixtureVariants: [{ id: "default", label: "Lower-third preview" }],
  stateSupport: {
    empty: { notApplicable: "Lower third always renders from configured copy." },
    loading: { notApplicable: "Lower third has no component-owned async operation." },
    error: { notApplicable: "Lower third has no component-owned fallible runtime operation." },
    disabled: { notApplicable: "Lower third is display-only." },
    focus: { notApplicable: "Lower third has no focusable renderer controls." },
    keyboard: { notApplicable: "Lower third exposes no keyboard interaction." },
    responsive: true,
  },
  loadFixtureData: async () => (await import("./fixtures/sample-data.json")).default,
});

export default componentDefinition;

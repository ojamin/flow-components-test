import {
  createPassthroughTransform,
  defineComponent,
  type ComponentThemeContract,
} from "@flow-builder/components/sdk";

import { textConfigDefaults, textConfigSchema, textParams } from "./types";

const themeContract: ComponentThemeContract = {
  consumes: [
    {
      propertyKey: "color.foreground",
      note: "Primary content text and icons.",
    },
    {
      propertyKey: "color.foregroundMuted",
      note: "Secondary labels, helper copy, and empty states.",
    },
  ],
};

export const componentDefinition = defineComponent({
  id: "demo.demo-text",
  version: 1,
  displayName: "Text",
  description: "Text block with optional prose styling, line clamping, and alignment.",
  icon: "text",
  category: "content",
  renderable: true,
  configSchema: textConfigSchema,
  configDefaults: textConfigDefaults,
  params: textParams,
  themeContract,
  builder: {
    defaultSize: { w: 24, h: 4 },
    minSize: { w: 6, h: 2 },
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
  ],
  renderer: async () => (await import("./Renderer.vue")).default,
  configPanel: async () => (await import("./ConfigPanel.vue")).default,
  transform: createPassthroughTransform,
  fixtureVariants: [
    { id: "default", label: "Default copy" },
    {
      id: "empty",
      label: "Empty copy",
      description: "No text configured or resolved.",
      appliesTo: "config",
    },
    {
      id: "long",
      label: "Long copy",
      description: "Long prose for wrapping and clamping review.",
      appliesTo: "config",
    },
  ],
  stateSupport: {
    empty: true,
    loading: { notApplicable: "Text renders local config or already-resolved input data." },
    error: { notApplicable: "Text has no component-owned async or fallible runtime operation." },
    disabled: { notApplicable: "Text is non-interactive." },
    focus: { notApplicable: "Text exposes no focusable renderer surface." },
    keyboard: { notApplicable: "Text exposes no keyboard interaction." },
    responsive: true,
  },
  loadFixtureData: async () => (await import("./fixtures/sample-data.json")).default,
  loadFixtureVariants: async () => ({
    default: (await import("./fixtures/sample-data.json")).default,
    empty: { text: "" },
    long: {
      text: "Flow Builder text components should wrap long editorial copy without custom styling or layout breakage across responsive previews.",
    },
  }),
});

export default componentDefinition;

import { expect } from "vitest";

import type {
  StaticComponentContractCase,
  StaticComponentRenderCase,
  StaticComponentTransformCase,
} from "../../../../testing";

export const contractCases = [
  {
    name: "declares passthrough output and data input",
    check: ({ definition }) => {
      expect(definition.inputs.map((input) => input.id)).toEqual(["data"]);
      expect(definition.outputs.map((output) => output.id)).toEqual(["all"]);
    },
  },
] as const satisfies readonly StaticComponentContractCase[];

export const renderCases = [
  {
    name: "renders lower-third copy",
    mountOptions: {
      props: {
        config: {
          headline: "Colorado Governor remains too early to call",
          subline: "74% reporting",
        },
      },
    },
    check: ({ wrapper }) => {
      expect(wrapper.text()).toContain("Lower-third preview");
      expect(wrapper.text()).toContain("Colorado Governor remains too early to call");
      expect(wrapper.text()).toContain("74% reporting");
    },
  },
] as const satisfies readonly StaticComponentRenderCase[];

export const transformCases = [
  {
    name: "passes data input to all",
    inputs: { data: { headline: "Ready for air" } },
    check: ({ outputs }) => {
      expect(outputs.all).toEqual({ headline: "Ready for air" });
    },
  },
] as const satisfies readonly StaticComponentTransformCase[];

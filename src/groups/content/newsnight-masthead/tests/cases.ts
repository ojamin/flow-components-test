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
    name: "renders broadcast masthead copy",
    mountOptions: { props: { config: { brand: "NEWSNIGHT LIVE", edition: "Election Desk" } } },
    check: ({ wrapper }) => {
      expect(wrapper.text()).toContain("NEWSNIGHT LIVE");
      expect(wrapper.text()).toContain("Election Desk");
      expect(wrapper.text()).toContain("Breaking");
    },
  },
] as const satisfies readonly StaticComponentRenderCase[];

export const transformCases = [
  {
    name: "passes data input to all",
    inputs: { data: { brand: "NEWSNIGHT LIVE" } },
    check: ({ outputs }) => {
      expect(outputs.all).toEqual({ brand: "NEWSNIGHT LIVE" });
    },
  },
] as const satisfies readonly StaticComponentTransformCase[];

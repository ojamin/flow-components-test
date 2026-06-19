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
    name: "renders configured race wall",
    mountOptions: {
      props: {
        config: {
          raceTitle: "Colorado Governor",
          candidateA: "Marisol Vega",
          candidateB: "Evan Cross",
        },
      },
    },
    check: ({ wrapper }) => {
      expect(wrapper.text()).toContain("Colorado Governor");
      expect(wrapper.text()).toContain("Marisol Vega");
      expect(wrapper.text()).toContain("Evan Cross");
      expect(wrapper.text()).toContain("Newsroom rail");
    },
  },
] as const satisfies readonly StaticComponentRenderCase[];

export const transformCases = [
  {
    name: "passes data input to all",
    inputs: { data: { raceTitle: "Colorado Governor" } },
    check: ({ outputs }) => {
      expect(outputs.all).toEqual({ raceTitle: "Colorado Governor" });
    },
  },
] as const satisfies readonly StaticComponentTransformCase[];

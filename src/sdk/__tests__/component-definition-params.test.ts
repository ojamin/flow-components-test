import { describe, expect, test } from "vitest";
import { z } from "zod";

import { defineComponent, type ComponentDefinitionInput } from "../component-definition";

const baseDefinition = {
  id: "test.no-params",
  version: 1,
  displayName: "No Params",
  icon: "test",
  category: "content",
  renderable: false,
  configSchema: z.object({}),
  configDefaults: {},
  builder: { defaultSize: { w: 1, h: 1 }, minSize: { w: 1, h: 1 } },
  flow: {},
  inputs: [],
  outputs: [],
  loadFixtureData: async () => ({}),
} satisfies Omit<ComponentDefinitionInput<z.ZodObject<Record<string, never>>>, "params">;

describe("defineComponent params contract", () => {
  test("rejects definitions that omit params", () => {
    expect(() =>
      defineComponent(
        baseDefinition as unknown as ComponentDefinitionInput<z.ZodObject<Record<string, never>>>,
      ),
    ).toThrow('Component definition "test.no-params" must declare params');
  });

  test("rejects definitions that declare non-object params", () => {
    expect(() =>
      defineComponent({
        ...baseDefinition,
        params: null,
      } as unknown as ComponentDefinitionInput<z.ZodObject<Record<string, never>>>),
    ).toThrow('Component definition "test.no-params" must declare params');
  });

  test("accepts no-config definitions that declare empty params", () => {
    const definition = defineComponent({
      ...baseDefinition,
      params: {},
    });

    expect(definition.params).toEqual({});
  });
});

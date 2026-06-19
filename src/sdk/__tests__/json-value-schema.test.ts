import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  createPassthroughTransform,
  defineConfigDefaults,
  isoDateTimeSchema,
  jsonArraySchema,
  jsonObjectSchema,
  jsonPrimitiveSchema,
  jsonValueSchema,
  resolveFixtureData,
  resolveFixtureVariants,
  type ComponentDefinition,
} from "../public-sdk";

function createDefinition(
  overrides: Partial<ComponentDefinition> & Pick<ComponentDefinition, "loadFixtureData">,
): ComponentDefinition {
  return {
    id: "content.fixture-test",
    version: 1,
    displayName: "Fixture test",
    icon: "lucide:test-tube",
    category: "content",
    renderable: true,
    slots: [],
    configSchema: z.object({}),
    configDefaults: {},
    params: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [],
    ...overrides,
  };
}

describe("jsonValueSchema", () => {
  it("parses finite JSON primitives and rejects non-finite numbers", () => {
    expect(jsonPrimitiveSchema.parse("value")).toBe("value");
    expect(jsonPrimitiveSchema.parse(1)).toBe(1);
    expect(jsonPrimitiveSchema.parse(true)).toBe(true);
    expect(jsonPrimitiveSchema.parse(null)).toBeNull();

    for (const value of [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN]) {
      expect(jsonPrimitiveSchema.safeParse(value).success).toBe(false);
    }
  });

  it("parses nested objects", () => {
    expect(jsonValueSchema.parse({ a: { b: { c: 1 } } })).toEqual({ a: { b: { c: 1 } } });
    expect(jsonObjectSchema.parse({ a: { b: { c: 1 } } })).toEqual({ a: { b: { c: 1 } } });
  });

  it("parses nested arrays", () => {
    expect(jsonValueSchema.parse([[[1, 2, 3]]])).toEqual([[[1, 2, 3]]]);
    expect(jsonArraySchema.parse([[[1, 2, 3]]])).toEqual([[[1, 2, 3]]]);
  });

  it("rejects non-finite numbers", () => {
    for (const value of [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN]) {
      const result = jsonValueSchema.safeParse(value);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual([]);
      }
    }
  });

  it("preserves Date.parse based ISO datetime validation", () => {
    expect(isoDateTimeSchema.parse("2026-04-29T12:34:56.000Z")).toBe("2026-04-29T12:34:56.000Z");
    expect(isoDateTimeSchema.safeParse("not-a-date").success).toBe(false);
  });
});

describe("defineConfigDefaults", () => {
  it("parses empty config input through the component config parser", () => {
    const configSchema = z.object({ label: z.string().default("Untitled") });

    expect(defineConfigDefaults(configSchema)).toEqual({ label: "Untitled" });
  });
});

describe("createPassthroughTransform", () => {
  it("declares fixture data is not required", async () => {
    const module = await createPassthroughTransform();

    expect(module.requiresFixtureData).toBe(false);
  });

  it("returns no outputs when the data input is missing", async () => {
    const module = await createPassthroughTransform();
    const outputs = await module.transform({ config: {}, inputs: {}, fixtureData: undefined });

    expect(outputs).toEqual({});
  });

  it("ignores inherited data inputs", async () => {
    const inputs = Object.create({ data: "inherited" }) as Record<string, unknown>;
    const module = await createPassthroughTransform();
    const outputs = await module.transform({ config: {}, inputs, fixtureData: undefined });

    expect(outputs).toEqual({});
  });

  it("preserves the data input value identity and shape", async () => {
    const data = { nested: { items: ["alpha", { count: 2 }] } };
    const module = await createPassthroughTransform();

    const outputs = await module.transform({
      config: {},
      inputs: { data },
      fixtureData: undefined,
    });

    expect(outputs).toEqual({ all: data });
    expect(outputs.all).toBe(data);
    expect(module.outputSchema.parse(outputs)).toEqual(outputs);
  });

  it("preserves an own data input even when its value is undefined", async () => {
    const module = await createPassthroughTransform();
    const outputs = await module.transform({
      config: {},
      inputs: { data: undefined },
      fixtureData: undefined,
    });

    expect(outputs).toStrictEqual({ all: undefined });
  });
});

describe("resolveFixtureData", () => {
  it("memoizes fixture loading by component definition object identity", async () => {
    const fixtureData = { title: "Fixture" };
    const loadFixtureData = vi.fn(async () => fixtureData);
    const definition = createDefinition({ loadFixtureData });

    const first = resolveFixtureData(definition);
    const second = resolveFixtureData(definition);

    expect(first).toBe(second);
    await expect(first).resolves.toBe(fixtureData);
    expect(loadFixtureData).toHaveBeenCalledTimes(1);
  });

  it("wraps synchronous fixture loader failures with the component id", async () => {
    const definition = createDefinition({
      id: "content.throwing-fixture",
      loadFixtureData: () => {
        throw new Error("fixture boom");
      },
    });

    await expect(resolveFixtureData(definition)).rejects.toThrow(
      'Failed to load fixture data for component "content.throwing-fixture": fixture boom',
    );
  });

  it("wraps rejected fixture loader failures with the component id", async () => {
    const definition = createDefinition({
      id: "content.rejected-fixture",
      loadFixtureData: async () => Promise.reject("fixture rejected"),
    });

    await expect(resolveFixtureData(definition)).rejects.toThrow(
      'Failed to load fixture data for component "content.rejected-fixture": fixture rejected',
    );
  });
});

describe("resolveFixtureVariants", () => {
  it("memoizes optional fixture variant loading by component definition object identity", async () => {
    const variants = { empty: { rows: [] } };
    const loadFixtureVariants = vi.fn(async () => variants);
    const definition = createDefinition({
      loadFixtureData: async () => undefined,
      loadFixtureVariants,
    });

    const first = resolveFixtureVariants(definition);
    const second = resolveFixtureVariants(definition);

    expect(first).toBe(second);
    await expect(first).resolves.toBe(variants);
    expect(loadFixtureVariants).toHaveBeenCalledTimes(1);
  });

  it("falls back to an empty variant record when a legacy definition only has sample fixture data", async () => {
    const definition = createDefinition({ loadFixtureData: async () => ({ title: "Legacy" }) });

    await expect(resolveFixtureVariants(definition)).resolves.toEqual({});
  });

  it("wraps fixture variant loader failures with the component id", async () => {
    const definition = createDefinition({
      id: "content.throwing-variants",
      loadFixtureData: async () => undefined,
      loadFixtureVariants: () => {
        throw new Error("variant boom");
      },
    });

    await expect(resolveFixtureVariants(definition)).rejects.toThrow(
      'Failed to load fixture variants for component "content.throwing-variants": variant boom',
    );
  });
});

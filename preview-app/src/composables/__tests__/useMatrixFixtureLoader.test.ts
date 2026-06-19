import { describe, expect, it } from "vitest";
import { z } from "zod";

import type { ComponentDefinition } from "@flow-builder/components/sdk";

import { resolveMatrixFixturePayload } from "../useMatrixFixtureLoader";

const configSchema = z.object({ label: z.string().default("Default") });

function createDefinition(): ComponentDefinition<typeof configSchema> {
  return {
    id: "preview.matrix-fixture-loader",
    version: 1,
    displayName: "Matrix Fixture Loader",
    icon: "box",
    category: "content",
    renderable: true,
    slots: [],
    configSchema,
    configDefaults: configSchema.parse({}),
    builder: {},
    flow: {},
    inputs: [],
    outputs: [],
    params: {},
    fixtureVariants: [
      { id: "config", label: "Config", appliesTo: "config" },
      { id: "data", label: "Data" },
    ],
    loadFixtureData: async () => ({ source: "default-fixture" }),
    loadFixtureVariants: async () => ({
      config: { label: "Config preset" },
      data: { source: "selected-data-fixture" },
    }),
  } as ComponentDefinition<typeof configSchema>;
}

describe("resolveMatrixFixturePayload", () => {
  it("keeps config fixture variants out of matrix renderer fixture data", async () => {
    await expect(resolveMatrixFixturePayload(createDefinition(), "config")).resolves.toEqual({
      source: "default-fixture",
    });
  });

  it("continues resolving fixture-data variants as matrix renderer fixture data", async () => {
    await expect(resolveMatrixFixturePayload(createDefinition(), "data")).resolves.toEqual({
      source: "selected-data-fixture",
    });
  });
});

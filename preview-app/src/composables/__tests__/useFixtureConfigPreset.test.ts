import { nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import type { ComponentDefinition } from "@flow-builder/components/sdk";
import {
  resolveSelectedConfigPresetPayload,
  resolveSelectedFixturePayload,
  useFixtureConfigPreset,
  type PreviewFixtureState,
} from "../useFixtureConfigPreset";

const configSchema = z.object({
  label: z.string().default("Default"),
  mode: z.enum(["default", "preset"]).default("default"),
});

function createDefinition(): ComponentDefinition<typeof configSchema> {
  return {
    id: "preview.fixture-config-preset",
    version: 1,
    displayName: "Fixture Config Preset",
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
      { id: "missing", label: "Missing" },
      { id: "data", label: "Data" },
      { id: "object-data", label: "Object Data" },
    ],
    loadFixtureData: async () => ({ items: ["default-fixture"] }),
    loadFixtureVariants: async () => ({
      config: { label: "Preset", mode: "preset" },
      data: ["not-config"],
      "object-data": { label: "Object data", mode: "preset" },
    }),
  } as ComponentDefinition<typeof configSchema>;
}

function createTextLikeDefinition(): ComponentDefinition<typeof configSchema> {
  return {
    ...createDefinition(),
    id: "demo.demo-text",
    displayName: "Text",
    fixtureVariants: [
      { id: "default", label: "Default copy" },
      { id: "long", label: "Long copy", appliesTo: "config" },
    ],
    loadFixtureVariants: async () => ({
      long: { label: "Long copy", mode: "preset" },
    }),
  } as ComponentDefinition<typeof configSchema>;
}

async function flushConfigPresetResolution(): Promise<void> {
  await Promise.resolve();
  await nextTick();
}

describe("useFixtureConfigPreset", () => {
  it("merges selected fixture variants declared as config presets into preview config", async () => {
    const definition = createDefinition();
    const definitionRef = ref<ComponentDefinition | undefined>(definition);
    const configRef = ref<Record<string, unknown> | undefined>({ label: "Controlled" });
    const selectedFixtureVariantIdRef = ref("config");
    const fixtureStateRef = ref<PreviewFixtureState>({
      status: "loaded",
      value: { mode: "preset" },
    });

    const previewConfig = useFixtureConfigPreset({
      definitionRef,
      configRef,
      selectedFixtureVariantIdRef,
      fixtureStateRef,
    });

    await vi.waitFor(() => {
      expect(previewConfig.value).toEqual({ label: "Preset", mode: "preset" });
    });
  });

  it("keeps object fixture data out of preview config without explicit config metadata", () => {
    const definition = createDefinition();
    const configRef = ref<Record<string, unknown> | undefined>({ label: "Controlled" });
    const previewConfig = useFixtureConfigPreset({
      definitionRef: ref<ComponentDefinition | undefined>(definition),
      configRef,
      selectedFixtureVariantIdRef: ref("object-data"),
      fixtureStateRef: ref<PreviewFixtureState>({
        status: "loaded",
        value: { mode: "preset", ignored: "stripped" },
      }),
    });

    expect(previewConfig.value).toBe(configRef.value);
  });

  it("keeps parseable object fixture variants as renderer data unless metadata declares config", async () => {
    const definition = createDefinition();
    const configRef = ref<Record<string, unknown> | undefined>({ label: "Controlled" });
    const fixtureData = await resolveSelectedFixturePayload(definition, "object-data");
    const previewConfig = useFixtureConfigPreset({
      definitionRef: ref<ComponentDefinition | undefined>(definition),
      configRef,
      selectedFixtureVariantIdRef: ref("object-data"),
      fixtureStateRef: ref<PreviewFixtureState>({ status: "loaded", value: fixtureData }),
    });

    await flushConfigPresetResolution();

    expect(fixtureData).toEqual({ label: "Object data", mode: "preset" });
    expect(await resolveSelectedConfigPresetPayload(definition, "object-data")).toBeUndefined();
    expect(previewConfig.value).toBe(configRef.value);
  });

  it("keeps array fixture data out of preview config", () => {
    const definition = createDefinition();
    const configRef = ref<Record<string, unknown> | undefined>({ label: "Controlled" });
    const previewConfig = useFixtureConfigPreset({
      definitionRef: ref<ComponentDefinition | undefined>(definition),
      configRef,
      selectedFixtureVariantIdRef: ref("data"),
      fixtureStateRef: ref<PreviewFixtureState>({ status: "loaded", value: ["not-config"] }),
    });

    expect(previewConfig.value).toBe(configRef.value);
  });

  it("applies non-navigation component fixture variants declared as config presets", async () => {
    const textComponentDefinition = createTextLikeDefinition();
    const selectedFixtureVariantIdRef = ref("long");
    const fixtureStateRef = ref<PreviewFixtureState>({
      status: "loaded",
      value: await resolveSelectedFixturePayload(textComponentDefinition, "long"),
    });

    const previewConfig = useFixtureConfigPreset({
      definitionRef: ref<ComponentDefinition | undefined>(textComponentDefinition),
      configRef: ref<Record<string, unknown> | undefined>({}),
      selectedFixtureVariantIdRef,
      fixtureStateRef,
    });

    await vi.waitFor(() => {
      expect(previewConfig.value).toEqual({ label: "Long copy", mode: "preset" });
    });
  });
});

describe("resolveSelectedFixturePayload", () => {
  it("falls back to default fixture data for omitted variant loader entries", async () => {
    await expect(resolveSelectedFixturePayload(createDefinition(), "missing")).resolves.toEqual({
      items: ["default-fixture"],
    });
  });

  it("uses default fixture data for variants declared as config presets", async () => {
    await expect(resolveSelectedFixturePayload(createDefinition(), "config")).resolves.toEqual({
      items: ["default-fixture"],
    });
  });
});

describe("config-preset fixture separation", () => {
  it("keeps renderer fixture data default while selected config variants still resolve config", async () => {
    const definition = createDefinition();
    const fixtureData = await resolveSelectedFixturePayload(definition, "config");
    const previewConfig = useFixtureConfigPreset({
      definitionRef: ref<ComponentDefinition | undefined>(definition),
      configRef: ref<Record<string, unknown> | undefined>({ label: "Controlled" }),
      selectedFixtureVariantIdRef: ref("config"),
      fixtureStateRef: ref<PreviewFixtureState>({ status: "loaded", value: fixtureData }),
    });

    await flushConfigPresetResolution();

    expect(fixtureData).toEqual({ items: ["default-fixture"] });
    await vi.waitFor(() => {
      expect(previewConfig.value).toEqual({ label: "Preset", mode: "preset" });
    });
  });
});

import { describe, expect, it } from "vitest";
import { z } from "zod";

import type { ComponentManifest } from "../../manifest";
import {
  collectManifestMetadataIssues,
  collectStateSupportMetadataIssues,
  type ComponentDefinition,
  type DataBoundaryMetadata,
  defineComponent,
  findManifestDrift,
} from "../public-sdk";

const configSchema = z.object({});

function createDefinition(overrides: Partial<ComponentDefinition<typeof configSchema>> = {}) {
  return {
    id: "content.heading",
    version: 1,
    displayName: "Heading",
    icon: "lucide:heading-1",
    category: "content",
    renderable: true,
    slots: [],
    configSchema,
    configDefaults: {},
    params: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [],
    loadFixtureData: async () => undefined,
    ...overrides,
  } satisfies ComponentDefinition<typeof configSchema>;
}

function createManifest(overrides: Partial<ComponentManifest> = {}) {
  return {
    schemaVersion: 1,
    id: "content.heading",
    displayName: "Heading",
    group: "content",
    tags: ["typography"],
    version: "1.0.0",
    renderable: true,
    transformKind: "module",
    entry: {
      definition: "definition.ts",
      renderer: "Renderer.vue",
      configPanel: "ConfigPanel.vue",
      transform: "transform.ts",
    },
    ...overrides,
  } satisfies ComponentManifest;
}

describe("findManifestDrift", () => {
  it("returns no issues when manifest, definition, folder group, and taxonomy agree", () => {
    expect(
      findManifestDrift(createDefinition(), createManifest(), { folderGroup: "content" }),
    ).toEqual([]);
  });

  it("reports definition id drift with the documented issue shape", () => {
    expect(
      findManifestDrift(createDefinition({ id: "content.hero" }), createManifest(), {
        folderGroup: "content",
      }),
    ).toEqual([
      {
        componentId: "content.heading",
        field: "id",
        manifestValue: "content.heading",
        definitionValue: "content.hero",
        message: 'Definition id "content.hero" disagrees with manifest id "content.heading"',
      },
    ]);
  });

  it("reports displayName drift", () => {
    expect(
      findManifestDrift(createDefinition({ displayName: "Hero" }), createManifest(), {
        folderGroup: "content",
      }),
    ).toEqual([
      {
        componentId: "content.heading",
        field: "displayName",
        manifestValue: "Heading",
        definitionValue: "Hero",
        message: 'displayName disagrees: manifest="Heading" definition="Hero"',
      },
    ]);
  });

  it("reports major version drift", () => {
    expect(
      findManifestDrift(createDefinition({ version: 2 }), createManifest({ version: "1.7.3" }), {
        folderGroup: "content",
      }),
    ).toEqual([
      {
        componentId: "content.heading",
        field: "version",
        manifestValue: "1.7.3",
        definitionValue: 2,
        message: 'Major version disagrees: manifest="1.7.3" definition="2"',
      },
    ]);
  });

  it("reports renderable drift", () => {
    expect(
      findManifestDrift(createDefinition({ renderable: false }), createManifest(), {
        folderGroup: "content",
      }),
    ).toEqual([
      {
        componentId: "content.heading",
        field: "renderable",
        manifestValue: true,
        definitionValue: false,
        message: "renderable disagrees",
      },
    ]);
  });

  it("reports manifest group drift from the folder group", () => {
    expect(
      findManifestDrift(createDefinition(), createManifest({ group: "layout" }), {
        folderGroup: "content",
      }),
    ).toEqual([
      {
        componentId: "content.heading",
        field: "group",
        manifestValue: "layout",
        definitionValue: "content",
        message: 'manifest.group "layout" must match folder group "content"',
      },
    ]);
  });

  it("reports group-to-category drift using the folder group as canonical", () => {
    expect(
      findManifestDrift(createDefinition({ category: "media" }), createManifest(), {
        folderGroup: "content",
      }),
    ).toEqual([
      {
        componentId: "content.heading",
        field: "category",
        manifestValue: "content",
        definitionValue: "media",
        message:
          'Definition category "media" does not match group→category mapping for "content" (expected "content")',
      },
    ]);
  });

  it("reports a missing category mapping", () => {
    expect(
      findManifestDrift(createDefinition(), createManifest(), {
        folderGroup: "content",
        taxonomy: { groupToCategory: {}, categoryOverrides: {} },
      }),
    ).toEqual([
      {
        componentId: "content.heading",
        field: "category",
        manifestValue: "content",
        definitionValue: "content",
        message: 'No category mapping for folder group "content"',
      },
    ]);
  });

  it("honors category overrides before group-to-category mapping", () => {
    expect(
      findManifestDrift(createDefinition({ category: "media" }), createManifest(), {
        folderGroup: "content",
        taxonomy: { categoryOverrides: { "content.heading": "media" } },
      }),
    ).toEqual([]);
  });

  it("reports category override drift", () => {
    expect(
      findManifestDrift(createDefinition(), createManifest(), {
        folderGroup: "content",
        taxonomy: { categoryOverrides: { "content.heading": "media" } },
      }),
    ).toEqual([
      {
        componentId: "content.heading",
        field: "category",
        manifestValue: "media",
        definitionValue: "content",
        message:
          'Definition category "content" does not match group→category mapping for "content" (expected "media")',
      },
    ]);
  });
});

describe("collectStateSupportMetadataIssues", () => {
  const stateSupport = {
    empty: true,
    loading: { notApplicable: "Renderer has no asynchronous loading state." },
    error: true,
    disabled: { notApplicable: "No interactive controls are exposed." },
    focus: { notApplicable: "No focusable renderer surface is exposed." },
    keyboard: { notApplicable: "No keyboard interaction is exposed." },
    responsive: true,
  } as const;

  it("returns no issues when fixture variants and every required state are documented", () => {
    const definition = createDefinition({
      fixtureVariants: [
        { id: "default", label: "Default" },
        { id: "empty", label: "Empty", description: "No rows." },
      ],
      stateSupport,
    });

    expect(collectStateSupportMetadataIssues([definition])).toEqual([]);
  });

  it("reports non-blocking metadata warnings by default", () => {
    expect(collectStateSupportMetadataIssues([createDefinition()])).toEqual([
      {
        componentId: "content.heading",
        severity: "warning",
        field: "fixtureVariants",
        message:
          "Component definition is missing fixtureVariants metadata for package preview matrix coverage.",
      },
      {
        componentId: "content.heading",
        severity: "warning",
        field: "stateSupport",
        message:
          "Component definition is missing StateSupport metadata for package preview matrix coverage.",
      },
    ]);
  });

  it("can promote metadata gaps to strict errors", () => {
    expect(
      collectStateSupportMetadataIssues([createDefinition()], { strict: true })[0],
    ).toMatchObject({
      componentId: "content.heading",
      severity: "error",
      field: "fixtureVariants",
    });
  });

  it("does not require preview matrix metadata for non-renderable definitions", () => {
    expect(
      collectStateSupportMetadataIssues([
        createDefinition({ id: "data.http-request", renderable: false }),
      ]),
    ).toEqual([]);
  });
});

describe("defineComponent dataBoundary metadata", () => {
  const baseDefinition = createDefinition({ id: "data.test-boundary", renderable: false });

  it("accepts definitions with absent or valid metadata", () => {
    expect(defineComponent(baseDefinition).dataBoundary).toBeUndefined();

    const dataBoundary = {
      directions: ["ingress", "egress"],
      sourceKind: "http",
      supportsRefresh: true,
      supportsCache: true,
      supportsOverride: false,
      supportsPayloadPreview: true,
      supportsPromotion: false,
      metrics: ["bytes", "loadDurationMs", "cacheAgeMs"],
      exportBehavior: "fallback",
    } as const satisfies DataBoundaryMetadata;

    expect(defineComponent({ ...baseDefinition, dataBoundary }).dataBoundary).toEqual(dataBoundary);
  });

  it("rejects empty directions so malformed metadata fails package validation", () => {
    expect(() =>
      defineComponent({
        ...baseDefinition,
        dataBoundary: { directions: [] },
      }),
    ).toThrow(
      'Component definition "data.test-boundary" dataBoundary.directions must not be empty.',
    );
  });

  it("rejects unsupported enum and capability values", () => {
    expect(() =>
      defineComponent({
        ...baseDefinition,
        dataBoundary: { directions: ["sideways"] },
      } as unknown as ComponentDefinition<typeof configSchema>),
    ).toThrow(
      'Component definition "data.test-boundary" dataBoundary.directions contains unsupported value "sideways".',
    );

    expect(() =>
      defineComponent({
        ...baseDefinition,
        dataBoundary: { directions: ["ingress"], supportsCache: "yes" },
      } as unknown as ComponentDefinition<typeof configSchema>),
    ).toThrow(
      'Component definition "data.test-boundary" dataBoundary.supportsCache must be a boolean.',
    );

    expect(() =>
      defineComponent({
        ...baseDefinition,
        dataBoundary: {
          directions: ["ingress"],
          sourceKind: "database",
          exportBehavior: "archive",
          metrics: ["records"],
        },
      } as unknown as ComponentDefinition<typeof configSchema>),
    ).toThrow(
      'Component definition "data.test-boundary" dataBoundary.sourceKind contains unsupported value "database".',
    );
  });

  it("rejects unknown metadata fields so misspelled capabilities fail validation", () => {
    expect(() =>
      defineComponent({
        ...baseDefinition,
        dataBoundary: { directions: ["ingress"], supportsRefesh: true },
      } as unknown as ComponentDefinition<typeof configSchema>),
    ).toThrow(
      'Component definition "data.test-boundary" dataBoundary contains unsupported field "supportsRefesh".',
    );
  });
});

describe("collectManifestMetadataIssues", () => {
  const manifestStateSupport = {
    empty: true,
    loading: { notApplicable: "Renderer has no asynchronous loading state." },
    error: true,
    disabled: { notApplicable: "No interactive controls are exposed." },
    focus: { notApplicable: "No focusable renderer surface is exposed." },
    keyboard: { notApplicable: "No keyboard interaction is exposed." },
    responsive: true,
  } as const;

  it("blocks missing preview matrix metadata for renderable manifests", () => {
    expect(collectManifestMetadataIssues([createManifest()])).toEqual([
      "content.heading manifest is missing fixtureVariants metadata for package preview matrix coverage.",
      "content.heading manifest is missing StateSupport metadata for package preview matrix coverage.",
    ]);
  });

  it("passes complete renderable metadata and excludes non-renderable manifests", () => {
    expect(
      collectManifestMetadataIssues([
        createManifest({
          fixtureVariants: [{ id: "default", label: "Default fixture" }],
          stateSupport: manifestStateSupport,
        }),
        createManifest({ id: "data.http-request", group: "data", renderable: false }),
      ]),
    ).toEqual([]);
  });
});

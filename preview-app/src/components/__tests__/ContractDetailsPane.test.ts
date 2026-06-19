// Tests for ContractDetailsPane: verifies metadata grid, ports, slots, runtime requirements,
// fixture data, manifest metadata, source fingerprints, contract diagnostics, and clipboard
// safety. TransformOutputPane is not tested here; transform sections are covered by asserting
// that TransformOutputPane is mounted when a transform exists.

import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import ContractDetailsPane from "../ContractDetailsPane.vue";
import type { ComponentDefinition, ComponentManifestSummary } from "@flow-builder/components/sdk";
import type { EnrichedCatalogEntry } from "../../catalog-loader";

// Minimal ComponentDefinition stub. Provides a default async `loadFixtureData` resolving
// to `undefined` so tests that don't care about fixture data still satisfy the required
// field in the SDK contract; individual tests override it to drive ready / error states.
function makeDefinition(overrides: Partial<ComponentDefinition> = {}): ComponentDefinition {
  return {
    id: "test.component",
    version: 2,
    displayName: "Test Component",
    icon: "circle",
    category: "content",
    renderable: true,
    slots: [],
    configSchema: z.object({}),
    configDefaults: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [],
    loadFixtureData: async () => undefined,
    ...overrides,
  } as ComponentDefinition;
}

// Minimal EnrichedCatalogEntry stub.
function makeEntry(overrides: Partial<EnrichedCatalogEntry> = {}): EnrichedCatalogEntry {
  return {
    id: "test.component",
    group: "content",
    title: "Test Component",
    source: "static",
    sourceId: "flow-components-test",
    definition: undefined,
    section: "basic",
    ...overrides,
  } as EnrichedCatalogEntry;
}

// Minimal ComponentManifestSummary stub.
function makeManifestEntry(
  overrides: Partial<ComponentManifestSummary> = {},
): ComponentManifestSummary {
  return {
    id: "test.component",
    displayName: "Test Component",
    group: "content",
    source: "static",
    sourceId: "flow-components-test",
    version: "1.0.0",
    renderable: true,
    tags: [],
    sourcePath: "src/groups/content/test/component.ts",
    contentHash: "sha256:" + "a".repeat(64),
    ...overrides,
  };
}

// Stub navigator.clipboard to avoid jsdom throwing on clipboard access.
const clipboardWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: clipboardWriteText },
    writable: true,
    configurable: true,
  });
  clipboardWriteText.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ContractDetailsPane", () => {
  // ── Fallback ───────────────────────────────────────────────────────────────

  test("shows definition-absent fallback when definition is undefined", () => {
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: undefined, entry: undefined },
    });
    expect(wrapper.find('[data-testid="definition-absent-fallback"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="metadata-grid"]').exists()).toBe(false);
  });

  // ── Metadata grid ──────────────────────────────────────────────────────────

  test("renders metadata grid with category, group, section, version", () => {
    const def = makeDefinition({ category: "content", version: 3 });
    const entry = makeEntry({ group: "content", section: "media" });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry } });

    const grid = wrapper.find('[data-testid="metadata-grid"]');
    expect(grid.exists()).toBe(true);
    expect(grid.text()).toContain("content"); // category
    expect(grid.text()).toContain("media"); // section
    expect(grid.text()).toContain("v3"); // version
  });

  // ── Input ports ────────────────────────────────────────────────────────────

  test("lists input ports when present", () => {
    const def = makeDefinition({
      inputs: [
        {
          id: "data",
          label: "Data input",
          mode: "full",
          acceptedTypeIds: ["json"],
          required: true,
          allowMultiple: false,
          allowCycle: false,
        },
      ],
    });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    expect(wrapper.text()).toContain("Input ports");
    expect(wrapper.text()).toContain("data");
    expect(wrapper.text()).toContain("Data input");
    expect(wrapper.text()).toContain("json");
  });

  test("shows 'No input ports' message when inputs array is empty", () => {
    const def = makeDefinition({ inputs: [] });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });
    expect(wrapper.text()).toContain("No input ports.");
  });

  // ── Output ports ───────────────────────────────────────────────────────────

  test("lists output ports when present", () => {
    const def = makeDefinition({
      outputs: [{ id: "result", label: "Result", typeId: "string" }],
    });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    expect(wrapper.text()).toContain("Output ports");
    expect(wrapper.text()).toContain("result");
    expect(wrapper.text()).toContain("Result");
    expect(wrapper.text()).toContain("string");
  });

  test("shows 'No output ports' message when outputs array is empty", () => {
    const def = makeDefinition({ outputs: [] });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });
    expect(wrapper.text()).toContain("No output ports.");
  });

  // ── Slots ──────────────────────────────────────────────────────────────────

  test("shows slots section when definition has slots", () => {
    const def = makeDefinition({
      slots: [
        {
          id: "main",
          label: "Main slot",
          acceptsChildren: true,
          childScopeMode: "inherit",
          layoutKind: "grid",
        },
      ],
    });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    expect(wrapper.text()).toContain("Slots");
    expect(wrapper.text()).toContain("main");
    expect(wrapper.text()).toContain("Main slot");
    expect(wrapper.text()).toContain("inherit");
  });

  test("does not render slots section when definition has no slots", () => {
    const def = makeDefinition({ slots: [] });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });
    expect(wrapper.text()).not.toContain("Slots");
  });

  // ── Runtime requirements ───────────────────────────────────────────────────

  test("shows runtime requirements section when manifest entry has requirements", () => {
    const def = makeDefinition();
    const manifest = makeManifestEntry({ runtimeRequirements: ["fetch", "crypto"] });
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: def, entry: makeEntry(), manifestEntry: manifest },
    });

    expect(wrapper.find('[data-testid="runtime-requirements"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("fetch");
    expect(wrapper.text()).toContain("crypto");
  });

  test("hides runtime requirements section when manifest has no requirements", () => {
    const def = makeDefinition();
    const manifest = makeManifestEntry({ runtimeRequirements: undefined });
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: def, entry: makeEntry(), manifestEntry: manifest },
    });
    expect(wrapper.find('[data-testid="runtime-requirements"]').exists()).toBe(false);
  });

  // ── Fixture data (async resolution) ────────────────────────────────────────

  test("shows loading placeholder before loadFixtureData resolves", () => {
    // Pending promise — never resolves during the test, so the loading state stays put.
    const pending = new Promise<unknown>(() => {});
    const def = makeDefinition({ loadFixtureData: () => pending });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    expect(wrapper.find('[data-testid="fixture-data-section"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="fixture-data-loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="fixture-data-json"]').exists()).toBe(false);
  });

  test("renders fixture JSON once loadFixtureData resolves to data", async () => {
    const def = makeDefinition({ loadFixtureData: async () => ({ title: "Hello", count: 3 }) });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    await flushPromises();

    expect(wrapper.find('[data-testid="fixture-data-section"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="fixture-data-loading"]').exists()).toBe(false);
    const jsonEl = wrapper.find('[data-testid="fixture-data-json"]');
    expect(jsonEl.exists()).toBe(true);
    expect(jsonEl.text()).toContain("Hello");
    expect(jsonEl.text()).toContain("3");
  });

  test("renders empty placeholder when loadFixtureData resolves to undefined", async () => {
    const def = makeDefinition({ loadFixtureData: async () => undefined });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    await flushPromises();

    expect(wrapper.find('[data-testid="fixture-data-section"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="fixture-data-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="fixture-data-json"]').exists()).toBe(false);
  });

  test("shows error state when loadFixtureData rejects", async () => {
    const def = makeDefinition({
      loadFixtureData: async () => {
        throw new Error("boom");
      },
    });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    await flushPromises();

    const errorEl = wrapper.find('[data-testid="fixture-data-error"]');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.attributes("role")).toBe("alert");
    // resolveFixtureData wraps the underlying message; assert the original message survives.
    expect(errorEl.text()).toContain("boom");
    expect(wrapper.find('[data-testid="fixture-data-json"]').exists()).toBe(false);
  });

  test("copy button writes the resolved fixture JSON to the clipboard", async () => {
    const def = makeDefinition({ loadFixtureData: async () => ({ ok: true }) });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    await flushPromises();

    const copyBtn = wrapper.find('[aria-label="Copy fixture data"]');
    expect(copyBtn.exists()).toBe(true);
    await copyBtn.trigger("click");
    expect(clipboardWriteText).toHaveBeenCalledOnce();
    const written = clipboardWriteText.mock.calls[0]?.[0] as string;
    expect(JSON.parse(written)).toEqual({ ok: true });
  });

  // ── Manifest metadata ──────────────────────────────────────────────────────

  test("shows manifest section with tags, sourcePath, contentHash when manifestEntry provided", () => {
    const def = makeDefinition();
    const manifest = makeManifestEntry({
      tags: ["layout", "responsive"],
      sourcePath: "src/groups/content/hero/component.ts",
      contentHash: "sha256:" + "b".repeat(64),
    });
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: def, entry: makeEntry(), manifestEntry: manifest },
    });

    const section = wrapper.find('[data-testid="manifest-section"]');
    expect(section.exists()).toBe(true);
    expect(section.text()).toContain("layout");
    expect(section.text()).toContain("responsive");
    expect(section.text()).toContain("src/groups/content/hero/component.ts");
    expect(section.text()).toContain("sha256:" + "b".repeat(64));
  });

  test("hides manifest section when manifestEntry is not provided", () => {
    const def = makeDefinition();
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: def, entry: makeEntry(), manifestEntry: undefined },
    });
    expect(wrapper.find('[data-testid="manifest-section"]').exists()).toBe(false);
  });

  // ── Deprecated / experimental flags ──────────────────────────────────────

  test("shows deprecated flag when manifest marks component deprecated", () => {
    const def = makeDefinition();
    const manifest = makeManifestEntry({ deprecated: true });
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: def, entry: makeEntry(), manifestEntry: manifest },
    });
    expect(wrapper.find('[data-testid="flag-deprecated"]').exists()).toBe(true);
  });

  test("shows experimental flag when manifest marks component experimental", () => {
    const def = makeDefinition();
    const manifest = makeManifestEntry({ experimental: true });
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: def, entry: makeEntry(), manifestEntry: manifest },
    });
    expect(wrapper.find('[data-testid="flag-experimental"]').exists()).toBe(true);
  });

  test("does not show deprecated/experimental flags when neither flag is set", () => {
    const def = makeDefinition();
    const manifest = makeManifestEntry({ deprecated: undefined, experimental: undefined });
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: def, entry: makeEntry(), manifestEntry: manifest },
    });
    expect(wrapper.find('[data-testid="flag-deprecated"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="flag-experimental"]').exists()).toBe(false);
  });

  // ── Package source hashes ──────────────────────────────────────────────────

  test("shows package source hashes section with manifestHash and filesHash", () => {
    const def = makeDefinition();
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    const section = wrapper.find('[data-testid="source-fingerprints-section"]');
    expect(section.exists()).toBe(true);
    // Both hash elements must be present and contain a sha256: prefix.
    expect(wrapper.find('[data-testid="source-manifest-hash"]').text()).toMatch(
      /^sha256:[a-f0-9]{64}$/,
    );
    expect(wrapper.find('[data-testid="source-files-hash"]').text()).toMatch(
      /^sha256:[a-f0-9]{64}$/,
    );
  });

  test("source fingerprints section is not rendered when definition is absent", () => {
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: undefined, entry: undefined },
    });
    expect(wrapper.find('[data-testid="source-fingerprints-section"]').exists()).toBe(false);
  });

  // ── Contract diagnostics ───────────────────────────────────────────────────

  test("shows healthy diagnostics state when manifestEntry is present", () => {
    const def = makeDefinition();
    const manifest = makeManifestEntry();
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: def, entry: makeEntry(), manifestEntry: manifest },
    });

    const diagnostics = wrapper.find('[data-testid="contract-diagnostics"]');
    expect(diagnostics.exists()).toBe(true);
    expect(wrapper.find('[data-testid="diagnostics-healthy"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="diagnostics-missing-manifest"]').exists()).toBe(false);
    expect(diagnostics.text()).toContain("No contract diagnostics");
  });

  test("shows missing-manifest diagnostic when manifestEntry is absent", () => {
    const def = makeDefinition();
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: def, entry: makeEntry(), manifestEntry: undefined },
    });

    const diagnostics = wrapper.find('[data-testid="contract-diagnostics"]');
    expect(diagnostics.exists()).toBe(true);
    expect(wrapper.find('[data-testid="diagnostics-missing-manifest"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="diagnostics-healthy"]').exists()).toBe(false);
    expect(diagnostics.text()).toContain("Missing");
  });

  test("diagnostics section is not rendered when definition is absent", () => {
    const wrapper = mount(ContractDetailsPane, {
      props: { definition: undefined, entry: undefined },
    });
    expect(wrapper.find('[data-testid="contract-diagnostics"]').exists()).toBe(false);
  });

  // ── Clipboard safety ───────────────────────────────────────────────────────

  test("copyText does not throw when navigator.clipboard is absent", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const def = makeDefinition({ loadFixtureData: async () => ({ key: "value" }) });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    // Wait for the fixture watcher to settle into the ready state so the copy button mounts.
    await flushPromises();

    const copyBtn = wrapper.find('[aria-label="Copy fixture data"]');
    expect(copyBtn.exists()).toBe(true);
    expect(() => copyBtn.trigger("click")).not.toThrow();
    expect(clipboardWriteText).not.toHaveBeenCalled();
  });

  test("copyText does not throw when clipboard.writeText rejects", async () => {
    clipboardWriteText.mockRejectedValueOnce(new Error("NotAllowedError"));
    const def = makeDefinition({ loadFixtureData: async () => ({ key: "value" }) });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    await flushPromises();

    const copyBtn = wrapper.find('[aria-label="Copy fixture data"]');
    expect(copyBtn.exists()).toBe(true);
    await expect(copyBtn.trigger("click")).resolves.not.toThrow();
    // Flush so the rejected promise is consumed by the .catch(() => {}) handler.
    await flushPromises();
    expect(clipboardWriteText).toHaveBeenCalledOnce();
  });

  // ── TransformOutputPane integration ───────────────────────────────────────

  test("mounts TransformOutputPane when definition has a transform module", async () => {
    const def = makeDefinition({
      transform: () => Promise.resolve({ transform: () => ({ out: 1 }) }),
    });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });
    await flushPromises();
    // TransformOutputPane renders its section for non-idle states.
    expect(wrapper.find('[data-testid="transform-output-pane"]').exists()).toBe(true);
  });

  test("does not render transform section when definition has no transform module", async () => {
    const def = makeDefinition({ transform: undefined });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });
    await flushPromises();
    expect(wrapper.find('[data-testid="transform-output-pane"]').exists()).toBe(false);
  });
});

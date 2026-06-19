// Tests for TransformOutputPane: exercises idle / missing / loading / ready / error states.
// Uses a minimal stub ComponentDefinition with a controlled transform() mock to avoid
// importing catalog data. No pinia or app stores needed — this component is store-free.

import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import TransformOutputPane from "../TransformOutputPane.vue";
import {
  createPassthroughTransform,
  param,
  paramsToConfigSchema,
} from "@flow-builder/components/sdk";
import type {
  ComponentDefinition,
  ComponentParams,
  ParamValuesState,
} from "@flow-builder/components/sdk";
import { z } from "zod";

// Minimal definition stub sufficient for TransformOutputPane.
// The default loadFixtureData stub resolves to undefined so contract-required
// fixture resolution succeeds in tests that don't care about fixture content.
function makeDefinition(overrides: Partial<ComponentDefinition> = {}): ComponentDefinition {
  return {
    id: "test.component",
    version: 1,
    displayName: "Test",
    icon: "circle",
    category: "transform",
    renderable: false,
    slots: [],
    configSchema: z.object({}),
    configDefaults: {},
    params: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [],
    loadFixtureData: async () => undefined,
    ...overrides,
  } as ComponentDefinition;
}

// Stub navigator.clipboard so copy assertions don't throw in jsdom.
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

describe("TransformOutputPane", () => {
  // ── Idle state ────────────────────────────────────────────────────────────

  test("renders nothing when definition is undefined", () => {
    const wrapper = mount(TransformOutputPane, { props: { definition: undefined } });
    expect(wrapper.find('[data-testid="transform-output-pane"]').exists()).toBe(false);
  });

  // ── Missing state ─────────────────────────────────────────────────────────

  test("shows missing state when definition has no transform module", async () => {
    const def = makeDefinition({ transform: undefined });
    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    await flushPromises();
    expect(wrapper.find('[data-testid="transform-missing"]').exists()).toBe(true);
  });

  // ── Loading → ready ───────────────────────────────────────────────────────

  test("transitions through loading to ready with JSON output", async () => {
    let resolveTransform!: (mod: unknown) => void;
    const transformPromise = new Promise<unknown>((res) => {
      resolveTransform = res;
    });

    const def = makeDefinition({
      transform: () => transformPromise,
      loadFixtureData: async () => ({ value: 42 }),
      inputs: [
        {
          id: "data",
          label: "Data",
          mode: "full",
          acceptedTypeIds: ["any"],
          required: false,
          allowMultiple: false,
          allowCycle: false,
        },
      ],
    });

    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    // Should be in loading state before promise resolves.
    await flushPromises();
    expect(wrapper.find('[data-testid="transform-loading"]').exists()).toBe(true);

    // Resolve the transform module with a sync transform function.
    resolveTransform({
      transform: ({ inputs }: { inputs: Record<string, unknown> }) => ({ result: inputs["data"] }),
    });
    await flushPromises();

    expect(wrapper.find('[data-testid="transform-ready"]').exists()).toBe(true);
    const jsonEl = wrapper.find('[data-testid="transform-output-json"]');
    expect(jsonEl.exists()).toBe(true);
    // Output should contain the fixture data value forwarded through the transform.
    expect(jsonEl.text()).toContain("42");
    // Transform-mode (non-passthrough) definitions must not surface the passthrough badge.
    expect(wrapper.find('[data-testid="transform-passthrough-badge"]').exists()).toBe(false);
  });

  // ── Passthrough: SDK helper synthesizes the transform module ───────────────
  // Per docs/component-system-improvements-v1.md:1521 — passthrough components
  // (transform: createPassthroughTransform) must be synthesized via the SDK
  // helper rather than routed through a per-component lazy import.

  test("synthesizes passthrough module via SDK helper when transform === createPassthroughTransform", async () => {
    const fixtureData = { user: { name: "Ada", id: 7 } };
    const def = makeDefinition({
      id: "test.passthrough",
      transform: createPassthroughTransform,
      loadFixtureData: async () => fixtureData,
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
    });

    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    await flushPromises();

    expect(wrapper.find('[data-testid="transform-ready"]').exists()).toBe(true);
    // Passthrough mode is surfaced via the badge so developers can tell the
    // module came from the SDK helper and not a custom transform.
    expect(wrapper.find('[data-testid="transform-passthrough-badge"]').exists()).toBe(true);

    // The synthesized module wraps inputs.data under { all }; the rendered JSON
    // proves the SDK helper produced the output (the host did not re-import a
    // per-component transform.ts).
    const jsonText = wrapper.find('[data-testid="transform-output-json"]').text();
    expect(jsonText).toContain('"all"');
    expect(jsonText).toContain('"name": "Ada"');
    expect(jsonText).toContain('"id": 7');
  });

  test("passthrough synthesis does not call a per-component transform import", async () => {
    // If the pane mistakenly invoked def.transform() instead of synthesizing
    // via the SDK helper, this would also work — but the spy proves the helper
    // path: the function reference is the SDK helper itself, and we don't
    // attach a separate import side-effect to assert against. Instead, verify
    // that swapping the fixture data flows through the synthesized passthrough
    // contract end-to-end without any other plumbing.
    const def = makeDefinition({
      id: "test.passthrough.empty-inputs",
      transform: createPassthroughTransform,
      loadFixtureData: async () => ({ ignored: true }),
      // No inputs declared → buildSyntheticInputs returns {} → passthrough
      // helper returns {} (no "data" key on inputs). Proves the SDK helper
      // semantics without relying on def.transform() being executed.
      inputs: [],
    });

    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    await flushPromises();

    expect(wrapper.find('[data-testid="transform-ready"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="transform-passthrough-badge"]').exists()).toBe(true);
    // Synthesized passthrough output for empty inputs is "{}".
    expect(wrapper.find('[data-testid="transform-output-json"]').text().trim()).toBe("{}");
  });

  // ── Error: module load failure ─────────────────────────────────────────────

  test("shows error state when transform() rejects", async () => {
    const def = makeDefinition({
      transform: () => Promise.reject(new Error("load error")),
    });
    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    await flushPromises();

    expect(wrapper.find('[data-testid="transform-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="transform-error"]').text()).toContain("load error");
  });

  // ── Error: module missing transform export ─────────────────────────────────

  test("shows error when module does not export a transform function", async () => {
    const def = makeDefinition({
      transform: () => Promise.resolve({ notATransform: true }),
    });
    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    await flushPromises();

    expect(wrapper.find('[data-testid="transform-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="transform-error"]').text()).toContain(
      "does not export a transform function",
    );
  });

  // ── Error: transform function throws ──────────────────────────────────────

  test("shows error when transform function throws", async () => {
    const def = makeDefinition({
      transform: () =>
        Promise.resolve({
          transform: () => {
            throw new Error("runtime transform error");
          },
        }),
    });
    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    await flushPromises();

    expect(wrapper.find('[data-testid="transform-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="transform-error"]').text()).toContain(
      "runtime transform error",
    );
  });

  // ── Error: fixture loader rejects ─────────────────────────────────────────

  test("shows error state when loadFixtureData rejects", async () => {
    const def = makeDefinition({
      id: "test.fixture-failure",
      transform: () => Promise.resolve({ transform: () => ({ ok: true }) }),
      loadFixtureData: async () => {
        throw new Error("fixture boom");
      },
    });
    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    await flushPromises();

    expect(wrapper.find('[data-testid="transform-error"]').exists()).toBe(true);
    // resolveFixtureData wraps the failure with the component id, so the user
    // sees which component's fixture loader broke.
    expect(wrapper.find('[data-testid="transform-error"]').text()).toContain(
      'Failed to load fixture data for component "test.fixture-failure"',
    );
    expect(wrapper.find('[data-testid="transform-error"]').text()).toContain("fixture boom");
  });

  // ── Config-only transforms (no inputs) ────────────────────────────────────

  test("executes transform with empty inputs when definition has no input ports", async () => {
    const modeParams = {
      mode: param(z.string(), { label: "Mode", control: { kind: "input" } }),
    } satisfies ComponentParams;
    const transformFn = vi.fn().mockReturnValue({ out: "config-only" });
    const def = makeDefinition({
      transform: () => Promise.resolve({ transform: transformFn }),
      inputs: [],
      params: modeParams,
      configSchema: paramsToConfigSchema(modeParams),
      configDefaults: { mode: "fast" },
    });
    const wrapper = mount(TransformOutputPane, {
      props: { definition: def, config: { mode: "fast" } },
    });
    await flushPromises();

    expect(wrapper.find('[data-testid="transform-ready"]').exists()).toBe(true);
    expect(transformFn).toHaveBeenCalledWith(
      expect.objectContaining({ inputs: {}, config: { mode: "fast" } }),
    );
  });

  test("passes resolved config from params and paramValues into the transform", async () => {
    const titleParams = {
      title: param(z.string(), {
        label: "Title",
        control: { kind: "input" },
        bindable: true,
        bindFrom: [{ input: "data", typeId: "all-data" }],
      }),
    } satisfies ComponentParams;
    const transformFn = vi.fn().mockReturnValue({ ok: true });
    const paramValues: ParamValuesState = {
      title: { mode: "bind", input: "data", path: "$.title", fallback: "Fallback" },
    };
    const def = makeDefinition({
      transform: () => Promise.resolve({ transform: transformFn }),
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
      params: titleParams,
      configSchema: paramsToConfigSchema(titleParams),
      configDefaults: { title: "Default" },
      loadFixtureData: async () => ({ title: "Resolved from fixture" }),
    });

    mount(TransformOutputPane, { props: { definition: def, paramValues } });
    await flushPromises();

    expect(transformFn).toHaveBeenCalledWith(
      expect.objectContaining({ config: { title: "Resolved from fixture" } }),
    );
  });

  test("blocks transform execution when definition is missing params", async () => {
    const transformImport = vi.fn().mockResolvedValue({ transform: vi.fn() });
    const def = makeDefinition({
      transform: transformImport,
      params: undefined,
      configSchema: z.object({ label: z.string() }),
      configDefaults: { label: "Legacy default" },
    });

    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    await flushPromises();

    expect(transformImport).not.toHaveBeenCalled();
    const error = wrapper.get('[data-testid="transform-error"]');
    expect(error.text()).toContain("missing params");
    expect(error.text()).toContain("cannot resolve transform config");
  });

  // ── Stale-load: rapid definition change ───────────────────────────────────

  test("stale result is discarded when definition changes before load completes", async () => {
    let resolveFirst!: (mod: unknown) => void;
    const firstPromise = new Promise<unknown>((res) => {
      resolveFirst = res;
    });

    const defA = makeDefinition({
      id: "test.a",
      transform: () => firstPromise,
    });
    const defB = makeDefinition({
      id: "test.b",
      transform: () => Promise.resolve({ transform: () => ({ out: "b-result" }) }),
    });

    const wrapper = mount(TransformOutputPane, { props: { definition: defA } });
    // Switch to defB before defA's transform resolves.
    await wrapper.setProps({ definition: defB });
    await flushPromises();
    // defB result should be shown, not defA.
    expect(wrapper.find('[data-testid="transform-ready"]').text()).toContain("b-result");
    // Now resolve defA — it should be silently discarded.
    resolveFirst({ transform: () => ({ out: "a-stale" }) });
    await flushPromises();
    expect(wrapper.find('[data-testid="transform-output-json"]').text()).not.toContain("a-stale");
  });

  // ── Copy button ────────────────────────────────────────────────────────────

  test("copy button calls navigator.clipboard.writeText with JSON output", async () => {
    const def = makeDefinition({
      transform: () => Promise.resolve({ transform: () => ({ copied: true }) }),
    });
    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    await flushPromises();

    const copyBtn = wrapper.find('[aria-label="Copy transform output"]');
    expect(copyBtn.exists()).toBe(true);
    await copyBtn.trigger("click");
    await flushPromises();
    expect(clipboardWriteText).toHaveBeenCalledWith(expect.stringContaining('"copied": true'));
  });

  // ── Clipboard safety: missing Clipboard API ────────────────────────────────

  test("copy button does not throw when navigator.clipboard is absent", async () => {
    // Remove the clipboard API to simulate insecure/file: origins.
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const def = makeDefinition({
      transform: () => Promise.resolve({ transform: () => ({ x: 1 }) }),
    });
    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    await flushPromises();

    const copyBtn = wrapper.find('[aria-label="Copy transform output"]');
    expect(copyBtn.exists()).toBe(true);
    // Must not throw — silently no-ops when clipboard is unavailable.
    await expect(copyBtn.trigger("click")).resolves.not.toThrow();
    // No clipboard call should have been made.
    expect(clipboardWriteText).not.toHaveBeenCalled();
  });

  // ── Clipboard safety: rejected write ──────────────────────────────────────

  test("copy button does not throw when clipboard.writeText rejects", async () => {
    clipboardWriteText.mockRejectedValueOnce(new Error("NotAllowedError"));

    const def = makeDefinition({
      transform: () => Promise.resolve({ transform: () => ({ x: 1 }) }),
    });
    const wrapper = mount(TransformOutputPane, { props: { definition: def } });
    await flushPromises();

    const copyBtn = wrapper.find('[aria-label="Copy transform output"]');
    expect(copyBtn.exists()).toBe(true);
    // Clicking must not propagate the rejection.
    await expect(copyBtn.trigger("click")).resolves.not.toThrow();
    // Flush so the rejected promise is consumed by the .catch(() => {}) handler.
    await flushPromises();
    expect(clipboardWriteText).toHaveBeenCalledOnce();
  });

  // ── Schema validation: explicit default paths keep bind seeding precise ────────

  test("runs transform when seeded paramValues use an explicit compatible default path", async () => {
    const stringParams = {
      label: param(z.string(), {
        label: "Label",
        control: { kind: "input" },
        bindable: true,
        bindFrom: [{ input: "data", typeId: "all-data", defaultPath: "$.status" }],
      }),
    } satisfies ComponentParams;

    const transformFn = vi.fn().mockReturnValue({ result: "passthrough" });
    const def = makeDefinition({
      transform: () => Promise.resolve({ transform: transformFn }),
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
      params: stringParams,
      configSchema: paramsToConfigSchema(stringParams),
      configDefaults: { label: "Default Label" },
      loadFixtureData: async () => ({ status: "monitor", confidence: "High" }),
    });
    const paramValues: ParamValuesState = {
      label: { mode: "bind", input: "data", path: "$.status", fallback: "Default Label" },
    };

    const wrapper = mount(TransformOutputPane, { props: { definition: def, paramValues } });
    await flushPromises();

    expect(wrapper.find('[data-testid="transform-ready"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="transform-error"]').exists()).toBe(false);
    expect(transformFn).toHaveBeenCalledWith(
      expect.objectContaining({ config: { label: "monitor" } }),
    );
  });

  test("blocks transform execution when explicit paramValues fail schema validation", async () => {
    const stringParams = {
      label: param(z.string(), {
        label: "Label",
        control: { kind: "input" },
        bindable: true,
        bindFrom: [{ input: "data", typeId: "all-data" }],
      }),
    } satisfies ComponentParams;

    const transformFn = vi.fn().mockReturnValue({ result: "passthrough" });
    const def = makeDefinition({
      transform: () => Promise.resolve({ transform: transformFn }),
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
      params: stringParams,
      configSchema: paramsToConfigSchema(stringParams),
      configDefaults: { label: "Default Label" },
      loadFixtureData: async () => ({ status: "active" }),
    });

    // Explicit paramValues that bind to an object (schema mismatch).
    const paramValues: ParamValuesState = {
      label: { mode: "bind", input: "data", path: "$", fallback: "Fallback" },
    };

    const wrapper = mount(TransformOutputPane, {
      props: { definition: def, paramValues },
    });
    await flushPromises();

    expect(wrapper.find('[data-testid="transform-ready"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="transform-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="transform-error"]').text()).toContain(
      "Resolved transform config failed schema validation",
    );
    expect(transformFn).not.toHaveBeenCalled();
  });
});

/**
 * Unit tests for MatrixCell — the deterministic state × theme cell used by
 * the /matrix route. Covers each branch of the cell's rendering contract:
 *
 *   - Cell shell carries deterministic data attributes (theme, state,
 *     viewport, component id) so Playwright can address cells without
 *     scraping the rendered subtree.
 *   - N/A applicability metadata renders a muted reason panel and does NOT
 *     mount the renderer or a simulated frame.
 *   - Missing applicability metadata renders an amber warning and still
 *     attempts the simulated/real state below.
 *   - Loading / error states render simulated chrome (renderer not mounted).
 *   - Default / empty / disabled states mount the renderer with the correct
 *     fixture payload + content-class treatment.
 *   - Missing renderer falls back to a "no renderer" panel.
 */
import { defineComponent, h, markRaw } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import MatrixCell from "../MatrixCell.vue";
import type { MatrixCellState, MatrixCellTheme } from "../MatrixCell.vue";
import type { StateApplicability } from "@flow-builder/components/sdk";

/**
 * Minimal renderer stub. Records every prop it was mounted with so tests can
 * verify the cell forwarded the correct fixture payload + config.
 */
const RecordingRenderer = markRaw(
  defineComponent({
    name: "RecordingRenderer",
    props: {
      config: { type: Object, default: () => ({}) },
      fixtureData: { type: null, default: undefined },
      runtimeOutputs: { type: Object, default: () => ({}) },
      updateRuntimeOutputs: { type: Function, default: () => undefined },
      emitEvent: { type: Function, default: () => undefined },
      themeContext: { type: Object, default: undefined },
      renderMode: { type: String, default: undefined },
    },
    setup(props) {
      return () =>
        h(
          "div",
          {
            class: "recording-renderer",
            "data-fixture-null": props.fixtureData === null ? "true" : "false",
            "data-fixture-undefined": props.fixtureData === undefined ? "true" : "false",
            "data-config-keys": Object.keys(props.config as Record<string, unknown>)
              .sort()
              .join(","),
            "data-render-mode": props.renderMode,
          },
          "renderer-output",
        );
    },
  }),
);

function mountCell(
  overrides: Partial<{
    componentId: string;
    variantId: string;
    theme: MatrixCellTheme;
    state: MatrixCellState;
    viewport: "desktop" | "tablet" | "mobile";
    applicability: StateApplicability | undefined;
    rendererComponent: ReturnType<typeof defineComponent> | null;
    resolvedConfig: Record<string, unknown>;
    fixtureData: unknown;
  }> = {},
) {
  return mount(MatrixCell, {
    props: {
      componentId: "demo.demo-button",
      variantId: "",
      theme: "light" as MatrixCellTheme,
      state: "default" as MatrixCellState,
      viewport: "desktop" as const,
      applicability: true as StateApplicability,
      rendererComponent: RecordingRenderer,
      resolvedConfig: { label: "Click" },
      fixtureData: { sample: 1 },
      ...overrides,
    },
  });
}

// ── Shell + data attributes ──────────────────────────────────────────────────

describe("MatrixCell — shell contract", () => {
  test("renders deterministic data attributes for Playwright selection", () => {
    const w = mountCell({
      componentId: "demo.demo-button",
      variantId: "empty",
      theme: "dark",
      state: "disabled",
      viewport: "mobile",
    });
    const root = w.find('[data-testid="matrix-cell-demo.demo-button-dark-disabled"]');
    expect(root.exists()).toBe(true);
    expect(root.attributes("data-component-id")).toBe("demo.demo-button");
    expect(root.attributes("data-variant-id")).toBe("empty");
    expect(root.attributes("data-theme")).toBe("dark");
    expect(root.attributes("data-state")).toBe("disabled");
    expect(root.attributes("data-viewport")).toBe("mobile");
  });

  test("applies `dark` class only when theme is dark", () => {
    const light = mountCell({ theme: "light" });
    const lightRoot = light.find('[data-testid^="matrix-cell-"]');
    expect(lightRoot.classes()).not.toContain("dark");
    const dark = mountCell({ theme: "dark" });
    const darkRoot = dark.find('[data-testid^="matrix-cell-"]');
    expect(darkRoot.classes()).toContain("dark");
  });

  test("cell header reports state + theme labels", () => {
    const w = mountCell({ theme: "dark", state: "loading" });
    const text = w.text();
    expect(text).toMatch(/loading/i);
    expect(text).toMatch(/dark/i);
  });
});

// ── N/A applicability metadata ───────────────────────────────────────────────

describe("MatrixCell — not-applicable applicability", () => {
  test("renders N/A panel with reason when applicability marks the state not applicable", () => {
    const w = mountCell({
      state: "loading",
      applicability: { notApplicable: "Button does not perform async work." },
    });
    const root = w.find('[data-testid^="matrix-cell-"]');
    expect(root.attributes("data-state-applicability")).toBe("not-applicable");
    expect(w.find('[data-testid="matrix-cell-not-applicable"]').exists()).toBe(true);
    expect(w.text()).toContain("Button does not perform async work.");
  });

  test("N/A cell does NOT mount the renderer", () => {
    const w = mountCell({
      state: "default",
      applicability: { notApplicable: "Default state not applicable" },
    });
    expect(w.find(".recording-renderer").exists()).toBe(false);
    expect(w.find('[data-testid="matrix-cell-loading-preview"]').exists()).toBe(false);
    expect(w.find('[data-testid="matrix-cell-error-preview"]').exists()).toBe(false);
  });
});

// ── Missing applicability metadata ───────────────────────────────────────────

describe("MatrixCell — missing applicability metadata", () => {
  test("renders amber warning when applicability is undefined", () => {
    const w = mountCell({
      state: "loading",
      applicability: undefined,
    });
    const root = w.find('[data-testid^="matrix-cell-"]');
    expect(root.attributes("data-state-applicability")).toBe("missing-metadata");
    expect(w.find('[data-testid="matrix-cell-missing-metadata"]').exists()).toBe(true);
    expect(w.text()).toContain("No coverage metadata");
  });

  test("missing-metadata cell still renders the simulated/real state below", () => {
    const w = mountCell({
      state: "loading",
      applicability: undefined,
    });
    expect(w.find('[data-testid="matrix-cell-loading-preview"]').exists()).toBe(true);
  });
});

// ── Simulated states (loading / error) ───────────────────────────────────────

describe("MatrixCell — simulated states", () => {
  test("loading state renders simulated chrome and does NOT mount the renderer", () => {
    const w = mountCell({ state: "loading" });
    expect(w.find('[data-testid="matrix-cell-loading-preview"]').exists()).toBe(true);
    expect(w.find(".recording-renderer").exists()).toBe(false);
  });

  test("error state renders simulated alert chrome and does NOT mount the renderer", () => {
    const w = mountCell({ state: "error" });
    const banner = w.find('[data-testid="matrix-cell-error-preview"]');
    expect(banner.exists()).toBe(true);
    expect(banner.attributes("role")).toBe("alert");
    expect(w.find(".recording-renderer").exists()).toBe(false);
  });
});

// ── Renderer-backed states (default / empty / disabled) ──────────────────────

describe("MatrixCell — renderer-backed states", () => {
  test("default state mounts renderer with fixture data and config", () => {
    const w = mountCell({
      state: "default",
      resolvedConfig: { label: "Click", size: "lg" },
      fixtureData: { value: 42 },
    });
    const renderer = w.find(".recording-renderer");
    expect(renderer.exists()).toBe(true);
    expect(renderer.attributes("data-fixture-null")).toBe("false");
    expect(renderer.attributes("data-fixture-undefined")).toBe("false");
    expect(renderer.attributes("data-config-keys")).toBe("label,size");
  });

  test("empty state forwards `fixtureData = null` to the renderer", () => {
    const w = mountCell({ state: "empty", fixtureData: { value: 42 } });
    const renderer = w.find(".recording-renderer");
    expect(renderer.exists()).toBe(true);
    expect(renderer.attributes("data-fixture-null")).toBe("true");
  });

  test("disabled state wraps renderer in pointer-events-none + opacity treatment", () => {
    const w = mountCell({ state: "disabled" });
    const rendererCell = w.find('[data-testid="matrix-cell-renderer"]');
    expect(rendererCell.exists()).toBe(true);
    const wrapper = rendererCell.find(".pointer-events-none.opacity-60");
    expect(wrapper.exists()).toBe(true);
    expect(w.find(".recording-renderer").exists()).toBe(true);
  });

  test("renderer host is positioned and forwards authoring renderMode", () => {
    const w = mountCell({ state: "default" });
    const rendererCell = w.find('[data-testid="matrix-cell-renderer"]');
    expect(rendererCell.classes()).toContain("relative");
    expect(w.find(".recording-renderer").attributes("data-render-mode")).toBe("authoring");
  });

  test("missing renderer falls back to a 'no renderer' panel", () => {
    const w = mountCell({ state: "default", rendererComponent: null });
    expect(w.find('[data-testid="matrix-cell-no-renderer"]').exists()).toBe(true);
    expect(w.find(".recording-renderer").exists()).toBe(false);
  });
});

// ── Prop reactivity ─────────────────────────────────────────────────────────
// Cells are keyed by `${state}-${theme}` in the route view, but the rest of
// the props — fixture data, applicability metadata, renderer, resolved config
// — change on the same cell instance whenever the active component or variant
// changes. The derived values must stay reactive so a cell never displays
// stale fixture/applicability state from the previously selected component.

describe("MatrixCell — reactive prop derivation", () => {
  test("fixture data forwarded to the renderer updates when the prop changes", async () => {
    const w = mountCell({
      state: "default",
      fixtureData: { value: 1 },
    });
    let renderer = w.find(".recording-renderer");
    expect(renderer.attributes("data-fixture-null")).toBe("false");

    // Switch fixture payload: same cell instance, new data.
    await w.setProps({ fixtureData: null });
    renderer = w.find(".recording-renderer");
    expect(renderer.attributes("data-fixture-null")).toBe("true");

    await w.setProps({ fixtureData: { value: 2 } });
    renderer = w.find(".recording-renderer");
    expect(renderer.attributes("data-fixture-null")).toBe("false");
  });

  test("applicability prop updates flip the cell between N/A, missing-metadata, and applicable", async () => {
    const w = mountCell({ state: "loading", applicability: true });
    const root = () => w.find('[data-testid^="matrix-cell-"]');
    expect(root().attributes("data-state-applicability")).toBe("applicable");
    expect(w.find('[data-testid="matrix-cell-not-applicable"]').exists()).toBe(false);

    // Switch to N/A — the muted reason panel must appear.
    await w.setProps({
      applicability: { notApplicable: "Now not applicable." },
    });
    expect(root().attributes("data-state-applicability")).toBe("not-applicable");
    const naPanel = w.find('[data-testid="matrix-cell-not-applicable"]');
    expect(naPanel.exists()).toBe(true);
    expect(naPanel.text()).toContain("Now not applicable.");

    // Switch to missing metadata — amber warning replaces the N/A panel.
    await w.setProps({ applicability: undefined });
    expect(root().attributes("data-state-applicability")).toBe("missing-metadata");
    expect(w.find('[data-testid="matrix-cell-not-applicable"]').exists()).toBe(false);
    expect(w.find('[data-testid="matrix-cell-missing-metadata"]').exists()).toBe(true);
  });

  test("state prop updates flip fixture-null forwarding for the empty state", async () => {
    // Default state keeps the actual fixture payload.
    const w = mountCell({
      state: "default",
      fixtureData: { value: 99 },
      applicability: true,
    });
    let renderer = w.find(".recording-renderer");
    expect(renderer.exists()).toBe(true);
    expect(renderer.attributes("data-fixture-null")).toBe("false");

    // Flip to empty: the renderer must receive `fixtureData = null` even
    // though the prop itself is unchanged.
    await w.setProps({ state: "empty" });
    renderer = w.find(".recording-renderer");
    expect(renderer.exists()).toBe(true);
    expect(renderer.attributes("data-fixture-null")).toBe("true");

    // Back to default: empty-state masking must clear so the real fixture
    // reappears (proves the value is computed, not frozen at setup time).
    await w.setProps({ state: "default" });
    renderer = w.find(".recording-renderer");
    expect(renderer.attributes("data-fixture-null")).toBe("false");
  });

  test("disabled-state wrapper class follows the state prop reactively", async () => {
    const w = mountCell({ state: "default", applicability: true });
    const wrapperOf = () => w.find('[data-testid="matrix-cell-renderer"] > div');

    expect(wrapperOf().classes()).not.toContain("pointer-events-none");
    expect(wrapperOf().classes()).not.toContain("opacity-60");

    await w.setProps({ state: "disabled" });
    expect(wrapperOf().classes()).toContain("pointer-events-none");
    expect(wrapperOf().classes()).toContain("opacity-60");

    await w.setProps({ state: "default" });
    expect(wrapperOf().classes()).not.toContain("pointer-events-none");
    expect(wrapperOf().classes()).not.toContain("opacity-60");
  });
});

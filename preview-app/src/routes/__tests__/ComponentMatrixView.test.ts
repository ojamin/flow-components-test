/**
 * Integration tests for ComponentMatrixView — the /matrix route. Covers:
 *
 *   - Idle empty state when no `?component=` is present.
 *   - Unknown-component branch when `?component=` is a junk id.
 *   - Matrix grid mounts when a real catalog component is selected and
 *     the renderer + fixture resolve cleanly, with deterministic data
 *     attributes per cell.
 *   - Component metadata drives N/A treatment for unsupported states
 *     (uses demo.demo-button which marks loading as `notApplicable`).
 *
 * Vue Router is wired with memory history so the route view can read
 * `route.query` in jsdom without a real browser URL.
 */
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import { getBuiltInComponentTheme } from "@flow-builder/components/sdk";

import { routes } from "../index";

async function mountAt(initialUrl: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });
  await router.push(initialUrl);
  await router.isReady();

  // Use the actual route record so query routing matches production wiring.
  const RouteContainer = {
    template: `<RouterView />`,
  };
  const wrapper = mount(RouteContainer, {
    global: { plugins: [router] },
    attachTo: document.body,
  });
  // Allow renderer + fixture async watchers to settle.
  await flushPromises();
  await flushPromises();
  return { wrapper, router };
}

// Defensive: matrix cells install scoped `<style data-component-theme-style-bridge>`
// blocks in the document head via the local directive. A failing mount can
// leave stale elements behind that would leak across tests, so wipe them here.
afterEach(() => {
  for (const el of document.head.querySelectorAll("style[data-component-theme-style-bridge]")) {
    el.remove();
  }
});

describe("ComponentMatrixView — idle state", () => {
  test("renders idle empty state with instructions when no component param is set", async () => {
    const { wrapper } = await mountAt("/matrix");
    expect(wrapper.find('[data-testid="matrix-idle"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Choose a component to inspect");
    // No grid is rendered in idle state.
    expect(wrapper.find('[data-testid="matrix-grid"]').exists()).toBe(false);
  });

  test("renders header controls (component select + viewport toggle) even when idle", async () => {
    const { wrapper } = await mountAt("/matrix");
    expect(wrapper.find('[data-testid="matrix-component-select"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="matrix-viewport-desktop"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="matrix-viewport-tablet"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="matrix-viewport-mobile"]').exists()).toBe(true);
  });
});

describe("ComponentMatrixView — unknown component", () => {
  test("shows a 'component not found' branch when the id does not match the catalog", async () => {
    const { wrapper } = await mountAt("/matrix?component=does.not.exist");
    expect(wrapper.find('[data-testid="matrix-unknown-component"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("does.not.exist");
  });
});

describe("ComponentMatrixView — selected component", () => {
  // demo.demo-button is a real catalog entry with both fixtureVariants and
  // stateSupport metadata, so it exercises the full matrix contract.
  test("renders matrix grid with one cell per state × theme combination", async () => {
    const { wrapper } = await mountAt("/matrix?component=demo.demo-button");
    const grid = wrapper.find('[data-testid="matrix-grid"]');
    expect(grid.exists()).toBe(true);

    // 5 states × 2 themes = 10 cells.
    const STATES = ["default", "empty", "loading", "error", "disabled"] as const;
    const THEMES = ["light", "dark"] as const;
    for (const state of STATES) {
      for (const theme of THEMES) {
        const cell = wrapper.find(`[data-testid="matrix-cell-demo.demo-button-${theme}-${state}"]`);
        expect(cell.exists()).toBe(true);
        expect(cell.attributes("data-theme")).toBe(theme);
        expect(cell.attributes("data-state")).toBe(state);
      }
    }
  });

  test("matrix grid is exposed as a labeled region (not a malformed table)", async () => {
    // The visual grid carries `role=figure` cells, not row/cell ownership, so
    // `role=table` + `role=columnheader` would be malformed ARIA. The grid
    // container is labeled as a region instead, and the column-label divs are
    // aria-hidden so AT only hears the per-cell labels.
    const { wrapper } = await mountAt("/matrix?component=demo.demo-button");
    const grid = wrapper.find('[data-testid="matrix-grid"]');
    expect(grid.attributes("role")).toBe("region");
    expect(grid.attributes("aria-label")).toBe("Component state by theme matrix");

    for (const theme of ["light", "dark"] as const) {
      const header = wrapper.find(`[data-testid="matrix-column-header-${theme}"]`);
      expect(header.exists()).toBe(true);
      expect(header.attributes("role")).toBeUndefined();
      expect(header.attributes("aria-hidden")).toBe("true");
    }
  });

  test("shows component summary with renderable badge", async () => {
    const { wrapper } = await mountAt("/matrix?component=demo.demo-button");
    const summary = wrapper.find('[data-testid="matrix-component-summary"]');
    expect(summary.exists()).toBe(true);
    expect(summary.text()).toContain("Button");
    expect(summary.text()).toContain("demo.demo-button");
  });

  test("loading state cells inherit not-applicable metadata from the definition", async () => {
    // demo.demo-button declares stateSupport.loading = { notApplicable: ... }.
    const { wrapper } = await mountAt("/matrix?component=demo.demo-button");
    const loadingLight = wrapper.find('[data-testid="matrix-cell-demo.demo-button-light-loading"]');
    expect(loadingLight.attributes("data-state-applicability")).toBe("not-applicable");
    expect(loadingLight.text()).toContain("Button does not perform component-owned async work.");
  });

  test("applicable state cells inherit applicable metadata from the definition", async () => {
    // content.table declares stateSupport.error = true and exposes an error fixture.
    const { wrapper } = await mountAt("/matrix?component=content.table");
    const errorLight = wrapper.find('[data-testid="matrix-cell-content.table-light-error"]');
    expect(errorLight.attributes("data-state-applicability")).toBe("applicable");
  });

  test("dark cells receive the dark built-in theme bridge so renderer tokens stay readable", async () => {
    // Acceptance for the Task 4.3 visual-review P0/P1 fix: when both columns
    // shared the `default` (light) theme bridge, dark cells flipped only the
    // shadcn semantic background to near-black while leaving renderer
    // `--ct-*` tokens at light values — collapsing component contrast (the
    // classic black-on-black Button regression). Light cells must keep the
    // `default` bridge; dark cells must consume the `midnight` bridge.
    const { wrapper } = await mountAt("/matrix?component=demo.demo-button");

    const defaultTheme = getBuiltInComponentTheme("default")!;
    const midnightTheme = getBuiltInComponentTheme("midnight")!;

    // Per-cell bridge scope ids are unique so light and dark cells write
    // independent style blocks in the document head. Pull the dark cell's
    // bridge for the default state and confirm it carries midnight values,
    // and that the light cell carries default values.
    const lightStyle = document.head.querySelector<HTMLStyleElement>(
      'style[data-component-theme-style-bridge="package-preview-matrix-light-default"]',
    );
    const darkStyle = document.head.querySelector<HTMLStyleElement>(
      'style[data-component-theme-style-bridge="package-preview-matrix-dark-default"]',
    );
    expect(lightStyle, "light cell bridge style element exists").not.toBeNull();
    expect(darkStyle, "dark cell bridge style element exists").not.toBeNull();

    expect(lightStyle?.textContent ?? "").toContain(
      `--ct-color-accent: ${defaultTheme.properties.color.accent}`,
    );
    expect(lightStyle?.textContent ?? "").toContain(
      `--ct-color-foreground: ${defaultTheme.properties.color.foreground}`,
    );

    // Dark cell must carry midnight's distinct accent + foreground values —
    // this is what fixes the dark-mode contrast regression.
    expect(darkStyle?.textContent ?? "").toContain(
      `--ct-color-accent: ${midnightTheme.properties.color.accent}`,
    );
    expect(darkStyle?.textContent ?? "").toContain(
      `--ct-color-foreground: ${midnightTheme.properties.color.foreground}`,
    );
    expect(darkStyle?.textContent ?? "").toContain(
      `--ct-color-surface-muted: ${midnightTheme.properties.color.surfaceMuted}`,
    );

    // Sanity: midnight must actually differ from default for at least one
    // visible token, or the bridge split would be a no-op.
    expect(midnightTheme.properties.color.accent).not.toBe(defaultTheme.properties.color.accent);

    // Cell wrapper carries the scope attribute that descendant `bg-ct-*` /
    // `text-ct-*` utilities use to resolve the scoped variables.
    const darkRenderer = wrapper.find(
      '[data-testid="matrix-cell-demo.demo-button-dark-default"] [data-testid="matrix-cell-renderer"]',
    );
    expect(darkRenderer.exists()).toBe(true);
    expect(darkRenderer.attributes("data-ct-scope")).toBe("package-preview-matrix-dark-default");
  });

  test("reads viewport from the query and reflects it in the active toggle", async () => {
    const { wrapper } = await mountAt("/matrix?component=demo.demo-button&viewport=mobile");
    const mobileBtn = wrapper.find('[data-testid="matrix-viewport-mobile"]');
    expect(mobileBtn.attributes("aria-pressed")).toBe("true");
    const desktopBtn = wrapper.find('[data-testid="matrix-viewport-desktop"]');
    expect(desktopBtn.attributes("aria-pressed")).toBe("false");

    // Cells report the active viewport so coverage stays observable from
    // Playwright without scraping the wrapper class list.
    const cell = wrapper.find('[data-testid="matrix-cell-demo.demo-button-light-default"]');
    expect(cell.attributes("data-viewport")).toBe("mobile");
  });

  test("merges selected config fixture variants into matrix renderer config", async () => {
    const { wrapper } = await mountAt("/matrix?component=demo.demo-button&variant=empty");

    await vi.waitFor(() => {
      const defaultCell = wrapper.find('[data-testid="matrix-cell-demo.demo-button-light-default"]');
      expect(defaultCell.text()).toContain("Add a button label");
      expect(defaultCell.text()).not.toContain("Learn more");
    });
  });
});

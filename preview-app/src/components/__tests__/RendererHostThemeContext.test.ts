/**
 * Task 2.5/Task 5 preview-app theme-context wiring (package-local).
 *
 * Proves the renderer harness threads a default ComponentThemeContext into the
 * renderer and applies the matching scoped `--ct-*` CSS variable bridge on the
 * `renderer-loaded` wrapper through the package-local managed style helper —
 * `data-ct-scope` plus a `<style data-component-theme-style-bridge="...">`
 * block in the document head, never inline `el.style` mutation. Sample context
 * values come from the built-in default component theme via the package SDK
 * helpers.
 */
import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";
import { defineComponent, h, nextTick, type Component } from "vue";
import { z } from "zod";

import { staticComponentDefinitions } from "@flow-builder/components/catalog";
import {
  componentThemeScopeAttribute,
  createThemeCssVariableMap,
  getBuiltInComponentTheme,
  type ComponentThemeContext,
  type ComponentDefinition,
} from "@flow-builder/components/sdk";

import RendererHostPane from "../RendererHostPane.vue";
import RendererPreviewFrame from "../RendererPreviewFrame.vue";

const PREVIEW_THEME_SCOPE_ID = "package-preview-renderer";
const testConfigSchema = z.object({});

let lastThemeContext: ComponentThemeContext | undefined;

const ThemeAwareRenderer = defineComponent({
  props: ["config", "fixtureData", "runtimeOutputs", "updateRuntimeOutputs", "themeContext"],
  setup(props) {
    return () => {
      // Capture the context as the host passes it; tests assert against this
      // mirror because the renderer's own DOM has no themeContext attribute.
      lastThemeContext = props.themeContext as ComponentThemeContext | undefined;
      return h("div", {
        "data-testid": "theme-aware-renderer",
        "data-has-context": props.themeContext ? "true" : "false",
      });
    };
  },
});

type MinimalDefinition = {
  id?: string;
  renderable: boolean;
  renderer?: () => Promise<unknown>;
  params?: Record<string, never>;
  configSchema?: typeof testConfigSchema;
  configDefaults?: Record<string, unknown>;
  loadFixtureData: () => Promise<unknown>;
};

let definitionSeq = 0;

function makeRenderableDef(): MinimalDefinition {
  return {
    id: `test.theme-context.${++definitionSeq}`,
    renderable: true,
    renderer: async () => ThemeAwareRenderer,
    params: {},
    configSchema: testConfigSchema,
    configDefaults: {},
    loadFixtureData: async () => null,
  };
}

function mountPane(definition: MinimalDefinition) {
  return mount(RendererHostPane, {
    props: { definition: definition as never },
    attachTo: document.body,
  });
}

// Renderer that does not declare the optional themeContext prop, mirroring
// the bulk of existing fixtures predating the component-theme contract. The
// preview host must still mount these renderers and apply the scoped --ct-*
// bridge so authors see consistent themed surfaces.
const NoThemeRenderer = defineComponent({
  props: ["config", "fixtureData", "runtimeOutputs", "updateRuntimeOutputs"],
  setup() {
    return () => h("div", { "data-testid": "no-theme-renderer" });
  },
});

function makeNoThemeDef(): MinimalDefinition {
  return {
    id: `test.theme-context.no-theme.${++definitionSeq}`,
    renderable: true,
    renderer: async () => NoThemeRenderer,
    params: {},
    configSchema: testConfigSchema,
    configDefaults: {},
    loadFixtureData: async () => null,
  };
}

function getManagedStyleElement(): HTMLStyleElement | null {
  return document.head.querySelector<HTMLStyleElement>(
    `style[data-component-theme-style-bridge="${PREVIEW_THEME_SCOPE_ID}"]`,
  );
}

const migratedRepresentativeMatrix = [
  {
    id: "layout.card",
    rootTestId: "card-body",
    themeMarkers: ["border-ct-border", "bg-ct-surface", "text-ct-card-foreground"],
  },
  {
    id: "layout.section",
    rootTestId: "section-body",
    themeMarkers: ["border-ct-border", "bg-ct-surface", "text-ct-foreground"],
  },
  {
    id: "content.divider",
    rootTestId: "divider-root",
    themeMarkers: ["bg-ct-border"],
  },
  {
    id: "layout.tabs",
    rootTestId: "tabs",
    themeMarkers: ["data-ct-bound-roles", "color.focusRing", "text-ct-foreground-muted"],
  },
  {
    id: "layout.view-stack",
    rootTestId: "view-stack",
    themeMarkers: ["data-ct-bound-roles", "color.foregroundMuted"],
  },
  {
    id: "viz.donut",
    rootTestId: "viz-donut",
    themeMarkers: ["text-ct-foreground", "var(--ct-color-chart1)"],
  },
  {
    id: "chart.donut",
    rootTestId: "chart-donut-root",
    themeMarkers: [
      "--vis-donut-central-label-text-color",
      "text-ct-foreground",
      "var(--ct-color-chart1)",
    ],
  },
  {
    id: "viz.progress-ring",
    rootTestId: "viz-progress-ring",
    themeMarkers: ['data-theme-mode="component-theme"', "border-ct-border"],
  },
  {
    id: "viz.bar-horizontal",
    rootTestId: "viz-bar-horizontal",
    themeMarkers: ["data-ct-bound-roles", "color.accent", "var(--ct-color-accent)"],
  },
] as const;

function getDefinition(id: string): ComponentDefinition {
  const definition = staticComponentDefinitions.find((candidate) => candidate.id === id);
  if (!definition) throw new Error(`Missing static component definition for ${id}`);
  return definition;
}

async function settleRendererHost(): Promise<void> {
  for (let i = 0; i < 3; i += 1) {
    await flushPromises();
    await nextTick();
  }
}

function createBuiltInThemeContext(
  themeId: "default" | "midnight" | "aurora",
): ComponentThemeContext {
  const theme = getBuiltInComponentTheme(themeId);
  if (!theme) throw new Error(`Missing built-in component theme ${themeId}`);
  return { themeId: theme.id, properties: theme.properties };
}

async function mountPreviewFrame(
  definition: ComponentDefinition,
  themeContext: ComponentThemeContext,
) {
  if (!definition.renderer) throw new Error(`${definition.id} is not renderable`);

  const rendererComponent = (await definition.renderer()) as Component;
  const fixtureData = await definition.loadFixtureData();
  const scopeId = `package-preview-${definition.id}-${themeContext.themeId}`;

  return mount(RendererPreviewFrame, {
    props: {
      hostStatus: "loaded",
      fixtureStatus: "loaded",
      stateMode: "default",
      stateBannerLabel: "",
      showStateBanner: false,
      frameClass: [],
      device: "responsive",
      rendererContentClass: "",
      rendererComponent,
      resolvedConfig: definition.configDefaults ?? {},
      effectiveFixtureData: fixtureData,
      runtimeOutputs: {},
      updateRuntimeOutputs: vi.fn(),
      emitEvent: vi.fn(),
      themeContext,
      themeContextStyle: {
        scopeId,
        cssVariables: createThemeCssVariableMap(themeContext),
      },
    },
    attachTo: document.body,
  });
}

afterEach(() => {
  // Defensive: any stray bridge style elements between mounts would leak the
  // managed selector across tests. The directive cleans up on unmount, but
  // failures mid-mount could leave a stale element behind.
  for (const el of document.head.querySelectorAll("style[data-component-theme-style-bridge]")) {
    el.remove();
  }
});

describe("RendererHostPane — theme context wiring", () => {
  test("forwards a default ComponentThemeContext to the renderer", async () => {
    lastThemeContext = undefined;
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    expect(
      wrapper.find('[data-testid="theme-aware-renderer"]').attributes("data-has-context"),
    ).toBe("true");

    const defaultTheme = getBuiltInComponentTheme("default")!;
    const observedThemeContext = lastThemeContext as ComponentThemeContext | undefined;
    expect(observedThemeContext?.themeId).toBe("default");
    expect(observedThemeContext?.properties.color.pageBackground).toBe(
      defaultTheme.properties.color.pageBackground,
    );
    expect(observedThemeContext?.properties.motion.durationFastMs).toBe(
      defaultTheme.properties.motion.durationFastMs,
    );
  });

  test("applies the scoped --ct-* style bridge on renderer-loaded without inline style mutation", async () => {
    const wrapper = mountPane(makeRenderableDef());
    await flushPromises();

    const loaded = wrapper.find('[data-testid="renderer-loaded"]');
    expect(loaded.exists()).toBe(true);

    const loadedEl = loaded.element as HTMLElement;
    // The renderer-loaded wrapper must carry the scope attribute — not inline
    // `style="--ct-...:..."` declarations applied via `el.style.setProperty`.
    expect(loadedEl.getAttribute(componentThemeScopeAttribute)).toBe(PREVIEW_THEME_SCOPE_ID);
    expect(loadedEl.getAttribute("style")).toBeNull();
    expect(loadedEl.style.cssText).toBe("");
    expect(loadedEl.style.getPropertyValue("--ct-color-page-background")).toBe("");

    // The managed scoped style element must live in the document head and
    // declare canonical `--ct-*` slots through the SDK mapping. Asserting on
    // textual declarations (not getComputedStyle) keeps the test focused on
    // the bridge contract independent of jsdom CSS-variable resolution.
    const managedStyle = getManagedStyleElement();
    expect(managedStyle).not.toBeNull();
    expect(managedStyle?.textContent ?? "").toContain(
      `[data-ct-scope="${PREVIEW_THEME_SCOPE_ID}"]`,
    );

    const defaultTheme = getBuiltInComponentTheme("default")!;
    expect(managedStyle?.textContent ?? "").toContain(
      `--ct-color-page-background: ${defaultTheme.properties.color.pageBackground}`,
    );
    expect(managedStyle?.textContent ?? "").toContain(
      `--ct-motion-duration-fast-ms: ${defaultTheme.properties.motion.durationFastMs}ms`,
    );
    expect(managedStyle?.textContent ?? "").toContain(
      `--ct-radius-md: ${defaultTheme.properties.radius.md}`,
    );

    const bridgeCss = managedStyle?.textContent ?? "";
    expect(bridgeCss).toContain(`--color-ct-accent: ${defaultTheme.properties.color.accent};`);
    expect(bridgeCss.indexOf("--ct-color-accent:")).toBeLessThan(
      bridgeCss.indexOf("--color-ct-accent:"),
    );
    expect(bridgeCss).not.toContain(
      `--color-ct-accent: hsl(${defaultTheme.properties.color.accent})`,
    );
  });

  test("renders a no-theme fixture and still applies the --ct-* bridge", async () => {
    // Acceptance for Task 5.7: existing fixtures whose renderers do not opt
    // into themeContext must keep mounting (themeContext is optional), and
    // the scoped CSS-variable bridge still applies on the renderer wrapper
    // so descendant Tailwind utilities reading --ct-* slots stay coherent.
    const wrapper = mountPane(makeNoThemeDef());
    await flushPromises();

    expect(wrapper.find('[data-testid="no-theme-renderer"]').exists()).toBe(true);

    const loaded = wrapper.find('[data-testid="renderer-loaded"]');
    expect(loaded.exists()).toBe(true);
    const loadedEl = loaded.element as HTMLElement;
    expect(loadedEl.getAttribute(componentThemeScopeAttribute)).toBe(PREVIEW_THEME_SCOPE_ID);
    expect(loadedEl.getAttribute("style")).toBeNull();

    const managedStyle = getManagedStyleElement();
    expect(managedStyle).not.toBeNull();
    const defaultTheme = getBuiltInComponentTheme("default")!;
    expect(managedStyle?.textContent ?? "").toContain(
      `--ct-color-foreground: ${defaultTheme.properties.color.foreground}`,
    );
  });

  test("renders the migrated representative matrix through the package preview bridge", async () => {
    const defaultTheme = getBuiltInComponentTheme("default")!;

    for (const representative of migratedRepresentativeMatrix) {
      const wrapper = mountPane(getDefinition(representative.id) as never);
      await settleRendererHost();
      await vi.waitFor(
        async () => {
          await settleRendererHost();
          expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(true);
        },
        { timeout: 15_000 },
      );

      const loaded = wrapper.find('[data-testid="renderer-loaded"]');
      expect(loaded.exists(), `${representative.id} loaded through RendererPreviewFrame`).toBe(
        true,
      );
      expect(
        wrapper.find(`[data-testid="${representative.rootTestId}"]`).exists(),
        `${representative.id} rendered its package renderer surface`,
      ).toBe(true);

      const loadedEl = loaded.element as HTMLElement;
      expect(loadedEl.getAttribute(componentThemeScopeAttribute)).toBe(PREVIEW_THEME_SCOPE_ID);
      expect(loadedEl.getAttribute("style"), `${representative.id} avoids inline style`).toBeNull();
      expect(loadedEl.style.cssText).toBe("");

      const managedStyle = getManagedStyleElement();
      expect(managedStyle, `${representative.id} managed style bridge exists`).not.toBeNull();
      const bridgeCss = managedStyle?.textContent ?? "";
      expect(bridgeCss).toContain(`[data-ct-scope="${PREVIEW_THEME_SCOPE_ID}"]`);
      expect(bridgeCss).toContain(`--ct-color-accent: ${defaultTheme.properties.color.accent}`);

      const markup = wrapper.html();
      for (const marker of representative.themeMarkers) {
        expect(markup, `${representative.id} includes ${marker}`).toContain(marker);
      }

      wrapper.unmount();
    }
  }, 20_000);

  test("renders migrated representatives through explicit default, midnight, and aurora preview-frame theme bridges", async () => {
    for (const themeId of ["default", "midnight", "aurora"] as const) {
      const themeContext = createBuiltInThemeContext(themeId);

      for (const representative of migratedRepresentativeMatrix) {
        const wrapper = await mountPreviewFrame(getDefinition(representative.id), themeContext);
        await settleRendererHost();

        const loaded = wrapper.find('[data-testid="renderer-loaded"]');
        expect(
          loaded.exists(),
          `${representative.id} loaded through RendererPreviewFrame under ${themeId}`,
        ).toBe(true);
        expect(
          wrapper.find(`[data-testid="${representative.rootTestId}"]`).exists(),
          `${representative.id} rendered under ${themeId}`,
        ).toBe(true);

        const loadedEl = loaded.element as HTMLElement;
        const expectedScopeId = `package-preview-${representative.id}-${themeId}`;
        expect(loadedEl.getAttribute(componentThemeScopeAttribute)).toBe(expectedScopeId);
        expect(
          loadedEl.getAttribute("style"),
          `${representative.id} avoids inline style`,
        ).toBeNull();

        const managedStyle = document.head.querySelector<HTMLStyleElement>(
          `style[data-component-theme-style-bridge="${expectedScopeId}"]`,
        );
        expect(
          managedStyle,
          `${representative.id} ${themeId} managed style bridge exists`,
        ).not.toBeNull();
        const bridgeCss = managedStyle?.textContent ?? "";
        expect(bridgeCss).toContain(`[data-ct-scope="${expectedScopeId}"]`);
        expect(bridgeCss).toContain(`--ct-color-accent: ${themeContext.properties.color.accent}`);
        expect(bridgeCss).toContain(`--ct-color-chart1: ${themeContext.properties.color.chart1}`);

        const markup = wrapper.html();
        for (const marker of representative.themeMarkers) {
          expect(markup, `${representative.id} ${themeId} includes ${marker}`).toContain(marker);
        }

        wrapper.unmount();
      }
    }
  }, 20_000);
});

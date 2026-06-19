import { readFile } from "node:fs/promises";

import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";

import * as BrowserHelpers from "@flow-builder/components/sdk/browser";
import * as CapabilitiesHelpers from "@flow-builder/components/sdk/capabilities";
import * as ConfigHelpers from "@flow-builder/components/sdk/config";
import type { ParamValueState } from "@flow-builder/components/sdk/config";
import * as DataHelpers from "@flow-builder/components/sdk/data";
import type { DataTypeId } from "@flow-builder/components/sdk/data";
import * as InteractionHelpers from "@flow-builder/components/sdk/interactions";
import * as MarkdownHelpers from "@flow-builder/components/sdk/markdown";
import * as RenderingHelpers from "@flow-builder/components/sdk/rendering";
import * as RootSdk from "@flow-builder/components/sdk";
import * as SanitizationHelpers from "@flow-builder/components/sdk/sanitization";
import * as ThemeHelpers from "@flow-builder/components/sdk/theme";
import * as ThreeDHelpers from "@flow-builder/components/sdk/three-d";
import { resolvePackagePath } from "./package-paths";

describe("SDK helper public exports", () => {
  it("keeps root SDK evaluation lightweight and definition-loader safe", async () => {
    expect(RootSdk.defineComponent).toBeTypeOf("function");
    expect(RootSdk.numberParam).toBeTypeOf("function");
    expect(RootSdk.resolveDataPath).toBeTypeOf("function");
    expect(RootSdk.dataTypeIds).toContain("json-object");

    const publicSdkSource = await readFile(resolvePackagePath("src/sdk/public-sdk.ts"), "utf8");

    expect(publicSdkSource).not.toMatch(/\.\/helpers\//);
    expect(publicSdkSource).not.toMatch(/from\s+["'](?:three|dompurify|@vueuse\/core|vue)["']/);
    expect(publicSdkSource).not.toMatch(/\b(?:window|document|HTMLElement|HTMLCanvasElement)\b/);
  });

  it("keeps Three-d helper APIs available through the Three-d section barrel", () => {
    expect(ThreeDHelpers.createVizThreeScene).toBeTypeOf("function");
    expect(ThreeDHelpers.createVizOrbitController).toBeTypeOf("function");
    expect(ThreeDHelpers.createVizPickSuppressor).toBeTypeOf("function");
    expect(ThreeDHelpers.pointerToNormalizedDeviceCoordinates).toBeTypeOf("function");
    expect(ThreeDHelpers.pickFirstThreeObject).toBeTypeOf("function");
    expect(ThreeDHelpers.resolveVizThreeSceneColors).toBeTypeOf("function");
    expect(ThreeDHelpers.resolveVizThreeSize).toBeTypeOf("function");
    expect(ThreeDHelpers.disposeThreeObject).toBeTypeOf("function");
    expect(ThreeDHelpers.createVizStaleAsyncSetupGuard).toBeTypeOf("function");
    expect(ThreeDHelpers.detectWebGLSupport).toBe(CapabilitiesHelpers.detectWebGLSupport);
    expect(ThreeDHelpers.detectBrowserWebGLSupport).toBe(
      CapabilitiesHelpers.detectBrowserWebGLSupport,
    );
    expect(ThreeDHelpers.REDUCED_MOTION_QUERY).toBe("(prefers-reduced-motion: reduce)");
    expect(ThreeDHelpers.resolveReducedMotionState).toBeTypeOf("function");
    expect(ThreeDHelpers.createFrameLoop).toBeTypeOf("function");
  });

  it("keeps browser helper APIs available through the browser section barrel", () => {
    expect(BrowserHelpers.isBrowser).toBeTypeOf("function");
    expect(BrowserHelpers.createCanvas).toBeTypeOf("function");
    expect(BrowserHelpers.focusElementById).toBeTypeOf("function");
    expect(BrowserHelpers.matchMedia).toBeTypeOf("function");
    expect(BrowserHelpers.getDevicePixelRatio).toBeTypeOf("function");
    expect(BrowserHelpers.getViewportScrollY).toBeTypeOf("function");
    expect(BrowserHelpers.addBrowserWindowEventListener).toBeTypeOf("function");
    expect(BrowserHelpers.removeBrowserWindowEventListener).toBeTypeOf("function");
    expect(BrowserHelpers.requestAnimationFrame).toBeTypeOf("function");
    expect(BrowserHelpers.cancelAnimationFrame).toBeTypeOf("function");
    expect(BrowserHelpers.setBrowserTimeout).toBeTypeOf("function");
    expect(BrowserHelpers.clearBrowserTimeout).toBeTypeOf("function");
    expect(BrowserHelpers.getClipboardWriteAvailability).toBeTypeOf("function");
    expect(BrowserHelpers.isClipboardWriteAvailable).toBeTypeOf("function");
    expect(BrowserHelpers.writeClipboardText).toBeTypeOf("function");
    expect(BrowserHelpers.resetBrowserTimeout).toBeTypeOf("function");
    expect(BrowserHelpers.cleanupBrowserTimeout).toBeTypeOf("function");
  });

  it("keeps capability helper APIs available through the capabilities section barrel", () => {
    expect(CapabilitiesHelpers.detectWebGLSupport).toBeTypeOf("function");
    expect(CapabilitiesHelpers.detectBrowserWebGLSupport).toBeTypeOf("function");
  });

  it("keeps rendering helper APIs available through the rendering section barrel", () => {
    expect(RenderingHelpers.REDUCED_MOTION_QUERY).toBe("(prefers-reduced-motion: reduce)");
    expect(RenderingHelpers.resolveReducedMotionState).toBeTypeOf("function");
    expect(RenderingHelpers.createFrameLoop).toBeTypeOf("function");
    expect(RenderingHelpers.createDisposalScope).toBeTypeOf("function");
  });

  it("keeps theme helper APIs available through the theme section barrel", () => {
    expect(ThemeHelpers.resolveThemeProperty).toBe(RootSdk.resolveThemeProperty);
    expect(ThemeHelpers.composeThemeProperties).toBe(RootSdk.composeThemeProperties);
    expect(ThemeHelpers.createThemeCssVariableMap).toBe(RootSdk.createThemeCssVariableMap);
  });

  it("keeps interaction helper APIs available through the interactions section barrel", () => {
    expect(InteractionHelpers.isActivationKey).toBeTypeOf("function");
    expect(InteractionHelpers.getNextArrowNavigationIndex).toBeTypeOf("function");
    expect(InteractionHelpers.createInteractiveKey).toBeTypeOf("function");
    expect(InteractionHelpers.createAriaLabel).toBeTypeOf("function");
  });

  it("keeps sanitization helper APIs available through the sanitization section barrel", () => {
    expect(SanitizationHelpers.escapeHtml).toBeTypeOf("function");
    expect(SanitizationHelpers.sanitizeHtml).toBeTypeOf("function");
    expect(SanitizationHelpers.sanitizeHtmlToResult).toBeTypeOf("function");
  });

  it("keeps markdown helper APIs available through the markdown section barrel", () => {
    expect(MarkdownHelpers.renderSanitizedMarkdown).toBeTypeOf("function");
    const empty = MarkdownHelpers.renderSanitizedMarkdown("");
    expect(empty).toEqual({ html: "", wasSanitized: false, error: null });
  });

  it("keeps data helper families available through the data section barrel", () => {
    expect(DataHelpers.resolveDataPath).toBeTypeOf("function");
    expect(DataHelpers.normalizeToJsonPath("rows.label")).toBe("$.rows.label");

    expect(DataHelpers.deriveTableColumns).toBeTypeOf("function");
    expect(DataHelpers.deriveTableMetadata).toBeTypeOf("function");
    expect(DataHelpers.formatStructuredKeyLabel("total_revenue", "start-case")).toBe(
      "Total Revenue",
    );

    expect(DataHelpers.deriveChartRowsPathOptions).toBeTypeOf("function");
    expect(DataHelpers.mapRowsToChartSlices).toBeTypeOf("function");

    expect(DataHelpers.dataTypeIds).toContain("chart-slices");

    expectTypeOf<DataTypeId>().toEqualTypeOf<RootSdk.DataTypeId>();
  });

  it("keeps config helper families available through the config section barrel", () => {
    expect(ConfigHelpers.numberParam).toBeTypeOf("function");
    expect(ConfigHelpers.selectParam).toBeTypeOf("function");
    expect(ConfigHelpers.resolveParamValues).toBeTypeOf("function");
    expect(ConfigHelpers.paramsToConfigSchema).toBeTypeOf("function");
    expect(ConfigHelpers.parseComponentConfig).toBeTypeOf("function");
    expect(ConfigHelpers.jsonValueSchema.safeParse(["configured"]).success).toBe(true);
    expect(ConfigHelpers.contentAlignOptions).toContain("center");

    const params = {
      limit: ConfigHelpers.param(z.number().int().default(5), {
        label: "Limit",
        control: { kind: "number" },
      }),
    };

    const schema = ConfigHelpers.paramsToConfigSchema(params);
    expect(schema.parse({})).toEqual({ limit: 5 });

    expectTypeOf<ParamValueState>().toMatchTypeOf<RootSdk.ParamValueState>();
  });
});

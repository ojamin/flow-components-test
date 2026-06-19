import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  componentThemeCssVariableByPropertyKey,
  componentThemeCssVariableSlots,
  componentThemeColorRoleLabels,
  componentThemePropertyRolesByGroup,
  componentThemePropertyKeys,
  componentThemeRadiusRoleLabels,
  componentThemeShadowRoleLabels,
  componentThemeScopeAttribute,
  composeThemeProperties,
  createThemeCssVariableMap,
  resolveComponentThemePaletteProperties,
  resolveThemeProperty,
  themeRoleKeyToCssVariableSuffix,
  type ComponentTheme,
  type ComponentThemeContext,
  type ComponentThemeProperties,
  type ThemePropertyKey,
} from "../public-sdk";
import { parseComponentThemeCssColor } from "../theme-color-utils";
import {
  componentThemeColorRoles,
  componentThemeFontRoles,
  componentThemeMotionRoles,
  componentThemeRadiusRoles,
  componentThemeShadowRoles,
  componentThemeSpacingRoles,
} from "../../themes";
import { resolvePackagePath } from "./package-paths";

function createProperties(): ComponentThemeProperties {
  return {
    color: Object.fromEntries(
      componentThemeColorRoles.map((role) => [role, `color-${role}`]),
    ) as ComponentThemeProperties["color"],
    font: Object.fromEntries(
      componentThemeFontRoles.map((role) => [role, `font-${role}`]),
    ) as ComponentThemeProperties["font"],
    radius: Object.fromEntries(
      componentThemeRadiusRoles.map((role) => [role, `radius-${role}`]),
    ) as ComponentThemeProperties["radius"],
    spacing: Object.fromEntries(
      componentThemeSpacingRoles.map((role) => [role, `spacing-${role}`]),
    ) as ComponentThemeProperties["spacing"],
    motion: {
      durationFastMs: 120,
      durationNormalMs: 240,
      easing: "ease-out",
    },
    shadow: Object.fromEntries(
      componentThemeShadowRoles.map((role) => [role, `shadow-${role}`]),
    ) as NonNullable<ComponentThemeProperties["shadow"]>,
  };
}

const addedColorRoles = [
  "cardForeground",
  "popover",
  "popoverForeground",
  "secondary",
  "secondaryForeground",
  "accentSubtle",
  "accentSubtleForeground",
  "destructiveForeground",
  "input",
  "sidebar",
  "sidebarForeground",
  "sidebarPrimary",
  "sidebarPrimaryForeground",
  "sidebarAccent",
  "sidebarAccentForeground",
  "sidebarBorder",
  "sidebarRing",
] as const;

describe("component theme SDK helpers", () => {
  it("parses CSS color function syntax accepted by component theme validation", () => {
    const expectedHsl = { red: 51, green: 102, blue: 153, alpha: 1 };

    expect(parseComponentThemeCssColor("hsl(210, 50%, 40%)")).toEqual(expectedHsl);
    expect(parseComponentThemeCssColor("hsl(210deg 50% 40%)")).toEqual(expectedHsl);
    expect(parseComponentThemeCssColor("oklch(0.55 0.12 240deg)")).toEqual(
      expect.objectContaining({ alpha: 1 }),
    );
  });

  it("merges partial overrides without requiring wholesale theme replacement", () => {
    const base = createProperties();

    expect(
      composeThemeProperties(base, {
        color: { accent: "oklch(0.7 0.2 250)" },
        motion: { durationFastMs: 90 },
      }),
    ).toEqual({
      ...base,
      color: { ...base.color, accent: "oklch(0.7 0.2 250)" },
      motion: { ...base.motion, durationFastMs: 90 },
    });
  });

  it("falls back to base properties for missing roles and invalid override values", () => {
    const base = createProperties();

    expect(
      composeThemeProperties(base, {
        color: { accent: "", surface: "override-surface" },
        motion: { durationFastMs: -1, durationNormalMs: 180 },
      } as Record<string, unknown>),
    ).toEqual({
      ...base,
      color: { ...base.color, surface: "override-surface" },
      motion: { ...base.motion, durationNormalMs: 180 },
    });
  });

  it("returns base-equivalent properties when overrides are null or omitted", () => {
    const base = createProperties();

    expect(composeThemeProperties(base, null)).toEqual(base);
    expect(composeThemeProperties(base, undefined)).toEqual(base);
    expect(composeThemeProperties(base)).toEqual(base);
  });

  it("exports fixed CSS variable slots for every component theme role", () => {
    expect(componentThemeScopeAttribute).toBe("data-ct-scope");
    expect(themeRoleKeyToCssVariableSuffix("pageBackground")).toBe("page-background");
    expect(themeRoleKeyToCssVariableSuffix("durationFastMs")).toBe("duration-fast-ms");
    expect(componentThemeCssVariableSlots.color.pageBackground).toBe("--ct-color-page-background");
    expect(componentThemeCssVariableSlots.font.body).toBe("--ct-font-body");
    expect(componentThemeCssVariableSlots.radius.md).toBe("--ct-radius-md");
    expect(componentThemeCssVariableSlots.radius.full).toBe("--ct-radius-full");
    expect(componentThemeCssVariableSlots.motion.durationFastMs).toBe(
      "--ct-motion-duration-fast-ms",
    );
    expect(componentThemeCssVariableSlots.shadow.lg).toBe("--ct-shadow-lg");

    const expectedKeys = [
      ...componentThemeColorRoles.map((role) => `color.${role}`),
      ...componentThemeFontRoles.map((role) => `font.${role}`),
      ...componentThemeRadiusRoles.map((role) => `radius.${role}`),
      ...componentThemeSpacingRoles.map((role) => `spacing.${role}`),
      ...componentThemeMotionRoles.map((role) => `motion.${role}`),
      ...componentThemeShadowRoles.map((role) => `shadow.${role}`),
    ] as ThemePropertyKey[];

    expect(componentThemeColorRoles).toEqual(expect.arrayContaining([...addedColorRoles]));
    expect(componentThemeRadiusRoles).toEqual(expect.arrayContaining(["xl", "full"]));
    expect(componentThemeShadowRoles).toEqual(["sm", "md", "lg"]);
    expect(componentThemePropertyKeys).toEqual(expectedKeys);
    expect(Object.keys(componentThemeCssVariableByPropertyKey)).toEqual(expectedKeys);
    for (const key of expectedKeys) {
      const [group, role] = key.split(".") as [keyof ComponentThemeProperties, string];
      expect(componentThemeCssVariableByPropertyKey[key]).toBe(
        `--ct-${group}-${themeRoleKeyToCssVariableSuffix(role)}`,
      );
    }
  });

  it("exports role metadata for new radius and shadow roles", () => {
    expect(componentThemePropertyRolesByGroup.radius).toEqual(
      expect.arrayContaining(["xl", "full"]),
    );
    expect(componentThemePropertyRolesByGroup.shadow).toEqual(["sm", "md", "lg"]);
    expect(componentThemeColorRoleLabels.accentSubtle).toBe("Subtle accent");
    expect(componentThemeRadiusRoleLabels.full).toBe("Full / pill");
    expect(componentThemeShadowRoleLabels).toEqual({
      sm: "Small",
      md: "Medium",
      lg: "Large",
    });
  });

  it("resolves known theme properties from host-supplied context with normalized values", () => {
    const context: ComponentThemeContext = {
      themeId: "sample",
      properties: {
        ...createProperties(),
        color: { ...createProperties().color, accent: "  oklch(0.7 0.2 250)  " },
      },
    };

    expect(resolveThemeProperty(context, "color.accent", "fallback-accent")).toBe(
      "oklch(0.7 0.2 250)",
    );
    expect(resolveThemeProperty(context, "motion.durationFastMs", 1)).toBe(120);
  });

  it("falls back deterministically for missing, invalid, or unknown theme contexts", () => {
    const invalidContext = {
      properties: {
        color: { accent: "" },
        motion: { durationFastMs: Number.NaN },
      },
    } as Record<string, unknown>;

    expect(resolveThemeProperty(undefined, "color.accent", "fallback-accent")).toBe(
      "fallback-accent",
    );
    expect(resolveThemeProperty({ properties: {} }, "color.accent", "fallback-accent")).toBe(
      "fallback-accent",
    );
    expect(resolveThemeProperty(invalidContext, "color.accent", "fallback-accent")).toBe(
      "fallback-accent",
    );
    expect(resolveThemeProperty(invalidContext, "motion.durationFastMs", 75)).toBe(75);
    expect(resolveThemeProperty(invalidContext, "unknown.role", "fallback-role")).toBe(
      "fallback-role",
    );
    expect(resolveThemeProperty(invalidContext, "color.accent")).toBe("");
  });

  it("creates CSS variable maps from contexts or properties using shared slots", () => {
    const properties = createProperties();
    const context: ComponentThemeContext = { themeId: "sample", properties };
    const contextVariables = createThemeCssVariableMap(context);

    expect(contextVariables).toMatchObject({
      "--ct-color-page-background": "color-pageBackground",
      "--color-ct-page-background": "color-pageBackground",
      "--color-ct-accent": "color-accent",
      "--ct-font-body": "font-body",
      "--ct-radius-md": "radius-md",
      "--ct-motion-duration-fast-ms": "120ms",
      "--ct-motion-easing": "ease-out",
    });
    expect(contextVariables["--ct-color-accent"]).toBe("color-accent");
    expect(createThemeCssVariableMap(properties)["--ct-spacing-xl"]).toBe("spacing-xl");
    expect(createThemeCssVariableMap(properties)["--ct-shadow-md"]).toBe("shadow-md");
    expect(createThemeCssVariableMap(undefined, "fallback-value")["--ct-color-accent"]).toBe(
      "fallback-value",
    );
    expect(createThemeCssVariableMap(undefined, "fallback-value")["--color-ct-accent"]).toBe(
      "fallback-value",
    );

    const hslChannelVariables = createThemeCssVariableMap({
      ...properties,
      color: { ...properties.color, accent: "108 11% 53%" },
    });
    expect(hslChannelVariables["--ct-color-accent"]).toBe("108 11% 53%");
    expect(hslChannelVariables["--color-ct-accent"]).toBe("hsl(var(--ct-color-accent))");

    const oklchVariables = createThemeCssVariableMap({
      ...properties,
      color: { ...properties.color, accent: "oklch(0.7 0.2 250)" },
    });
    expect(oklchVariables["--ct-color-accent"]).toBe("oklch(0.7 0.2 250)");
    expect(oklchVariables["--color-ct-accent"]).toBe("oklch(0.7 0.2 250)");

    const normalizedShadcnVariables = createThemeCssVariableMap({
      ...properties,
      color: { ...properties.color, accent: "hsl(222 47% 11%)" },
    });
    expect(normalizedShadcnVariables["--ct-color-accent"]).toBe("hsl(222 47% 11%)");
    expect(normalizedShadcnVariables["--color-ct-accent"]).toBe("hsl(222 47% 11%)");
  });

  it("resolves light palettes from legacy properties when no explicit palette is present", () => {
    const properties = createProperties();
    const theme = { version: 1, id: "legacy", displayName: "Legacy", properties } as ComponentTheme;

    const result = resolveComponentThemePaletteProperties(theme, "light");

    expect(result.properties).toEqual(properties);
    expect(result.diagnostics).toEqual([]);
  });

  it("resolves sparse dark palettes with deterministic legacy-property fallback diagnostics", () => {
    const properties = createProperties();
    const theme = {
      version: 1,
      id: "dual",
      displayName: "Dual",
      properties,
      palettes: {
        dark: {
          color: { accent: "dark-accent" },
          motion: { durationFastMs: 60 },
        },
      },
    } as ComponentTheme;

    const result = resolveComponentThemePaletteProperties(theme, "dark");

    expect(result.properties.color.accent).toBe("dark-accent");
    expect(result.properties.color.foreground).toBe(properties.color.foreground);
    expect(result.properties.motion.durationFastMs).toBe(60);
    expect(result.properties.motion.durationNormalMs).toBe(properties.motion.durationNormalMs);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing-dark-palette-role-fallback",
          path: "palettes.dark.color.foreground",
          fallbackPath: "properties.color.foreground",
        }),
        expect.objectContaining({
          code: "missing-dark-palette-role-fallback",
          path: "palettes.dark.motion.durationNormalMs",
          fallbackPath: "properties.motion.durationNormalMs",
        }),
      ]),
    );
  });

  it("keeps the SDK theme helper free of host-app import boundaries", () => {
    const source = readFileSync(resolvePackagePath("src/sdk/theme.ts"), "utf8");

    expect(source).not.toMatch(/from\s+["']@\//);
    expect(source).not.toMatch(
      /from\s+["'][^"']*(?:stores|router|pages|components\/project|Builder|Preview|placement|app-shell)/,
    );
    expect(source).toMatch(/from\s+["']\.\.\/themes["']/);
  });
});

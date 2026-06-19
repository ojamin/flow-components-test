import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

import {
  builtInComponentThemeIds,
  builtInComponentThemes,
  componentThemeColorRoles,
  componentThemeFontRoles,
  componentThemeMotionRoles,
  componentThemeRadiusRoles,
  componentThemeSchema,
  componentThemeShadowRoles,
  componentThemeSpacingRoles,
  createComponentThemeRegistry,
  getBuiltInComponentTheme,
  type ComponentThemeV1,
} from "../../themes";
import { componentThemePaletteModes, createThemeCssVariableMap } from "../public-sdk";
import { PACKAGE_SRC, resolvePackagePath } from "./package-paths";

const THEME_DIR = resolvePackagePath("src/themes");
const BUILT_IN_THEME_IDS = [
  "default",
  "midnight",
  "aurora",
  "sunrise",
  "civic-results",
  "command-center",
] as const;

const ISSUE_51_SAGE_SAND_INK_LIGHT: ComponentThemeV1 = {
  version: 1,
  id: "issue-51-sage-sand-ink-light",
  displayName: "Issue #51 Sage Sand Ink Light",
  properties: {
    color: {
      pageBackground: "40 60% 99%",
      surface: "0 0% 100%",
      cardForeground: "200 15% 27%",
      popover: "0 0% 100%",
      popoverForeground: "200 15% 27%",
      surfaceMuted: "48 11% 91%",
      foreground: "200 15% 27%",
      foregroundMuted: "212 6% 55%",
      border: "47 14% 87%",
      accent: "108 11% 53%",
      accentForeground: "40 60% 99%",
      secondary: "48 11% 91%",
      secondaryForeground: "200 14% 29%",
      accentSubtle: "86 20% 93%",
      accentSubtleForeground: "103 12% 45%",
      focusRing: "108 11% 53%",
      destructive: "5 40% 51%",
      destructiveForeground: "40 60% 99%",
      input: "47 14% 87%",
      sidebar: "40 60% 99%",
      sidebarForeground: "200 15% 27%",
      sidebarPrimary: "108 11% 53%",
      sidebarPrimaryForeground: "40 60% 99%",
      sidebarAccent: "86 20% 93%",
      sidebarAccentForeground: "103 12% 45%",
      sidebarBorder: "47 14% 87%",
      sidebarRing: "108 11% 53%",
      warning: "38 92% 50%",
      info: "204 76% 44%",
      success: "146 42% 34%",
      chart1: "108 11% 53%",
      chart2: "191 9% 54%",
      chart3: "200 14% 29%",
      chart4: "37 17% 80%",
      chart5: "103 12% 45%",
    },
    font: {
      body: "Inter, ui-sans-serif, system-ui, sans-serif",
      heading: "Inter, ui-sans-serif, system-ui, sans-serif",
      mono: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace",
    },
    radius: {
      none: "0",
      sm: "0.25rem",
      md: "0.75rem",
      lg: "0.75rem",
      xl: "0.75rem",
      full: "9999px",
    },
    spacing: {
      none: "0",
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
    },
    motion: {
      durationFastMs: 120,
      durationNormalMs: 220,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
    shadow: {
      sm: "0 1px 2px hsl(200 15% 27% / 0.08)",
      md: "0 8px 24px hsl(200 15% 27% / 0.10)",
      lg: "0 18px 48px hsl(200 15% 27% / 0.14)",
    },
  },
};

const ISSUE_51_SAGE_SAND_INK_DARK: ComponentThemeV1 = {
  ...ISSUE_51_SAGE_SAND_INK_LIGHT,
  id: "issue-51-sage-sand-ink-dark",
  displayName: "Issue #51 Sage Sand Ink Dark",
  properties: {
    ...ISSUE_51_SAGE_SAND_INK_LIGHT.properties,
    color: {
      pageBackground: "200 22% 14%",
      surface: "200 20% 19%",
      cardForeground: "48 18% 92%",
      popover: "200 20% 19%",
      popoverForeground: "48 18% 92%",
      surfaceMuted: "200 16% 24%",
      foreground: "48 18% 92%",
      foregroundMuted: "210 10% 72%",
      border: "200 14% 28%",
      accent: "108 18% 58%",
      accentForeground: "200 22% 14%",
      secondary: "200 16% 24%",
      secondaryForeground: "48 18% 92%",
      accentSubtle: "108 14% 30%",
      accentSubtleForeground: "48 18% 92%",
      focusRing: "108 18% 58%",
      destructive: "6 55% 56%",
      destructiveForeground: "48 18% 92%",
      input: "200 14% 28%",
      sidebar: "200 20% 19%",
      sidebarForeground: "48 18% 92%",
      sidebarPrimary: "108 18% 58%",
      sidebarPrimaryForeground: "200 22% 14%",
      sidebarAccent: "108 14% 30%",
      sidebarAccentForeground: "48 18% 92%",
      sidebarBorder: "200 14% 28%",
      sidebarRing: "108 18% 58%",
      warning: "38 92% 58%",
      info: "204 76% 64%",
      success: "146 42% 62%",
      chart1: "108 18% 58%",
      chart2: "191 16% 60%",
      chart3: "210 14% 72%",
      chart4: "37 17% 80%",
      chart5: "103 12% 55%",
    },
    shadow: {
      sm: "0 1px 2px hsl(200 22% 14% / 0.24)",
      md: "0 8px 24px hsl(200 22% 14% / 0.30)",
      lg: "0 18px 48px hsl(200 22% 14% / 0.36)",
    },
  },
};

function listJsonFiles(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listJsonFiles(full));
      continue;
    }
    if (entry.endsWith(".json")) out.push(full);
  }
  return out;
}

function isBuiltInThemePayload(file: string): boolean {
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as unknown;
    if (!parsed || typeof parsed !== "object") return false;
    const maybeTheme = parsed as { id?: unknown; properties?: unknown; version?: unknown };
    return (
      maybeTheme.version === 1 &&
      typeof maybeTheme.id === "string" &&
      BUILT_IN_THEME_IDS.includes(maybeTheme.id as (typeof BUILT_IN_THEME_IDS)[number]) &&
      typeof maybeTheme.properties === "object"
    );
  } catch {
    return false;
  }
}

describe("built-in component theme registry", () => {
  it("exposes built-in themes in deterministic order", () => {
    expect(builtInComponentThemeIds).toEqual(BUILT_IN_THEME_IDS);
    expect(builtInComponentThemes.map((theme) => theme.id)).toEqual(BUILT_IN_THEME_IDS);
  });

  it("exposes runtime component theme palette modes without system mode", () => {
    expect(componentThemePaletteModes).toEqual(["light", "dark"]);
    expect(componentThemePaletteModes).not.toContain("system");
  });

  it("looks up built-in themes by id", () => {
    expect(getBuiltInComponentTheme("aurora")?.displayName).toBe("Aurora");
    expect(getBuiltInComponentTheme("unknown-theme")).toBeUndefined();
  });

  it("rejects duplicate ids when creating a registry", () => {
    const duplicateDefault = { ...builtInComponentThemes[0], displayName: "Duplicate Default" };

    expect(() =>
      createComponentThemeRegistry([...builtInComponentThemes, duplicateDefault]),
    ).toThrow(/Duplicate component theme id "default"/);
  });

  it("returns immutable built-in theme payloads", () => {
    const defaultTheme = getBuiltInComponentTheme("default")!;

    expect(Object.isFrozen(defaultTheme)).toBe(true);
    expect(Object.isFrozen(defaultTheme.properties)).toBe(true);
    expect(Object.isFrozen(defaultTheme.properties.color)).toBe(true);

    expect(() => {
      (defaultTheme.properties.color as Record<string, string>).accent = "mutated";
    }).toThrow(TypeError);
    expect(getBuiltInComponentTheme("default")?.properties.color.accent).toBe(
      defaultTheme.properties.color.accent,
    );
  });

  it("keeps built-in theme JSON assets only in packages/components/src/themes", () => {
    const themeJsonFiles = readdirSync(THEME_DIR)
      .filter((entry) => entry.endsWith(".json"))
      .sort();

    expect(themeJsonFiles).toEqual([
      "aurora.json",
      "civic-results.json",
      "command-center.json",
      "default.json",
      "midnight.json",
      "sunrise.json",
    ]);

    const misplacedBuiltInThemes = listJsonFiles(PACKAGE_SRC)
      .filter(
        (file) =>
          !relative(THEME_DIR, file)
            .split(sep)
            .every((part) => part !== ".."),
      )
      .filter(isBuiltInThemePayload)
      .map((file) => relative(process.cwd(), file));

    expect(misplacedBuiltInThemes).toEqual([]);
  });

  it("ships complete built-in theme role coverage even while legacy payloads stay compatible", () => {
    for (const theme of builtInComponentThemes) {
      expect(Object.keys(theme.properties.color).sort(), theme.id).toEqual(
        [...componentThemeColorRoles].sort(),
      );
      expect(Object.keys(theme.properties.font).sort(), theme.id).toEqual(
        [...componentThemeFontRoles].sort(),
      );
      expect(Object.keys(theme.properties.radius).sort(), theme.id).toEqual(
        [...componentThemeRadiusRoles].sort(),
      );
      expect(Object.keys(theme.properties.spacing).sort(), theme.id).toEqual(
        [...componentThemeSpacingRoles].sort(),
      );
      expect(Object.keys(theme.properties.motion).sort(), theme.id).toEqual(
        [...componentThemeMotionRoles].sort(),
      );
      expect(Object.keys(theme.properties.shadow ?? {}).sort(), theme.id).toEqual(
        [...componentThemeShadowRoles].sort(),
      );
    }
  });

  it("preserves exact Issue #51 sage/sand/ink HSL channel fixtures", () => {
    for (const fixture of [ISSUE_51_SAGE_SAND_INK_LIGHT, ISSUE_51_SAGE_SAND_INK_DARK]) {
      const parsed = componentThemeSchema.parse(fixture);
      expect(parsed).toEqual(fixture);
      expect(createThemeCssVariableMap(parsed.properties)["--ct-color-page-background"]).toBe(
        fixture.properties.color.pageBackground,
      );
      expect(createThemeCssVariableMap(parsed.properties)["--color-ct-accent"]).toBe(
        "hsl(var(--ct-color-accent))",
      );
      expect(createThemeCssVariableMap(parsed.properties)["--ct-color-sidebar-ring"]).toBe(
        fixture.properties.color.sidebarRing,
      );
    }

    expect(ISSUE_51_SAGE_SAND_INK_LIGHT.properties.color).toMatchObject({
      pageBackground: "40 60% 99%",
      foreground: "200 15% 27%",
      surface: "0 0% 100%",
      cardForeground: "200 15% 27%",
      popover: "0 0% 100%",
      popoverForeground: "200 15% 27%",
      accent: "108 11% 53%",
      accentForeground: "40 60% 99%",
      secondary: "48 11% 91%",
      secondaryForeground: "200 14% 29%",
      surfaceMuted: "48 11% 91%",
      foregroundMuted: "212 6% 55%",
      accentSubtle: "86 20% 93%",
      accentSubtleForeground: "103 12% 45%",
      destructive: "5 40% 51%",
      destructiveForeground: "40 60% 99%",
      border: "47 14% 87%",
      input: "47 14% 87%",
      focusRing: "108 11% 53%",
      chart1: "108 11% 53%",
      chart2: "191 9% 54%",
      chart3: "200 14% 29%",
      chart4: "37 17% 80%",
      chart5: "103 12% 45%",
      sidebar: "40 60% 99%",
      sidebarForeground: "200 15% 27%",
      sidebarPrimary: "108 11% 53%",
      sidebarPrimaryForeground: "40 60% 99%",
      sidebarAccent: "86 20% 93%",
      sidebarAccentForeground: "103 12% 45%",
      sidebarBorder: "47 14% 87%",
      sidebarRing: "108 11% 53%",
    });
    expect(ISSUE_51_SAGE_SAND_INK_LIGHT.properties.radius.lg).toBe("0.75rem");

    expect(ISSUE_51_SAGE_SAND_INK_DARK.properties.color).toMatchObject({
      pageBackground: "200 22% 14%",
      foreground: "48 18% 92%",
      surface: "200 20% 19%",
      cardForeground: "48 18% 92%",
      popover: "200 20% 19%",
      popoverForeground: "48 18% 92%",
      accent: "108 18% 58%",
      accentForeground: "200 22% 14%",
      secondary: "200 16% 24%",
      secondaryForeground: "48 18% 92%",
      surfaceMuted: "200 16% 24%",
      foregroundMuted: "210 10% 72%",
      accentSubtle: "108 14% 30%",
      accentSubtleForeground: "48 18% 92%",
      destructive: "6 55% 56%",
      destructiveForeground: "48 18% 92%",
      border: "200 14% 28%",
      input: "200 14% 28%",
      focusRing: "108 18% 58%",
      chart1: "108 18% 58%",
      chart2: "191 16% 60%",
      chart3: "210 14% 72%",
      chart4: "37 17% 80%",
      chart5: "103 12% 55%",
      sidebar: "200 20% 19%",
      sidebarForeground: "48 18% 92%",
      sidebarPrimary: "108 18% 58%",
      sidebarPrimaryForeground: "200 22% 14%",
      sidebarAccent: "108 14% 30%",
      sidebarAccentForeground: "48 18% 92%",
      sidebarBorder: "200 14% 28%",
      sidebarRing: "108 18% 58%",
    });
  });
});

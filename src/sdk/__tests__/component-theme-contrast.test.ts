import { describe, expect, it } from "vitest";

import {
  builtInComponentThemes,
  getBuiltInComponentTheme,
  type ComponentThemeV1,
} from "../../themes";
import {
  collectComponentThemeRolePairDiagnostics,
  componentThemeContrastRolePairs,
} from "../theme-contrast";
import { parseShadcnThemeCssBlocks } from "../theme-css-parser";

// WCAG 2.1 AA contrast for normal-size body text. Layout components
// (card, section) render muted copy on the muted surface role, so this
// pairing must stay legible across all built-in themes.
const WCAG_AA_NORMAL = 4.5;

const OKLCH_PATTERN = /^oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+(-?[0-9.]+)\s*\)$/i;

const issue51RootValues = {
  background: "40 60% 99%",
  foreground: "200 15% 27%",
  card: "0 0% 100%",
  "card-foreground": "200 15% 27%",
  popover: "0 0% 100%",
  "popover-foreground": "200 15% 27%",
  primary: "108 11% 53%",
  "primary-foreground": "40 60% 99%",
  secondary: "48 11% 91%",
  "secondary-foreground": "200 14% 29%",
  muted: "48 11% 91%",
  "muted-foreground": "212 6% 55%",
  destructive: "5 40% 51%",
  "destructive-foreground": "40 60% 99%",
} as const;

const issue51DarkValues = {
  background: "200 22% 14%",
  foreground: "48 18% 92%",
  card: "200 20% 19%",
  "card-foreground": "48 18% 92%",
  popover: "200 20% 19%",
  "popover-foreground": "48 18% 92%",
  primary: "108 18% 58%",
  "primary-foreground": "200 22% 14%",
  secondary: "200 16% 24%",
  "secondary-foreground": "48 18% 92%",
  muted: "200 16% 24%",
  "muted-foreground": "210 10% 72%",
  destructive: "6 55% 56%",
  "destructive-foreground": "48 18% 92%",
} as const;

function cssBlock(selector: string, values: Readonly<Record<string, string>>): string {
  return `${selector} {\n${Object.entries(values)
    .map(([token, value]) => `  --${token}: ${value};`)
    .join("\n")}\n}`;
}

function makeTheme(overrides: Partial<ComponentThemeV1> = {}): ComponentThemeV1 {
  const base = getBuiltInComponentTheme("default");
  if (!base) throw new Error("Missing default built-in component theme.");
  return {
    ...base,
    id: "test-theme",
    displayName: "Test Theme",
    ...overrides,
    properties: {
      ...base.properties,
      ...overrides.properties,
      color: {
        ...base.properties.color,
        ...overrides.properties?.color,
      },
    },
  };
}

function parseOklch(value: string): { L: number; C: number; H: number } {
  const match = OKLCH_PATTERN.exec(value.trim());
  if (!match) {
    throw new Error(`Expected an oklch(L C H) color string, got "${value}"`);
  }
  return { L: Number(match[1]), C: Number(match[2]), H: Number(match[3]) };
}

// Bjorn Ottosson's Oklab -> linear sRGB conversion. We work in linear
// sRGB because WCAG relative luminance is a linear-light formula.
function oklchToLinearRgb(L: number, C: number, H: number): [number, number, number] {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [r, g, bl];
}

function clampUnit(c: number): number {
  return Math.max(0, Math.min(1, c));
}

function relativeLuminance([r, g, b]: readonly [number, number, number]): number {
  return 0.2126 * clampUnit(r) + 0.7152 * clampUnit(g) + 0.0722 * clampUnit(b);
}

function contrastRatio(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("built-in component theme accessibility", () => {
  it("keeps foregroundMuted vs surfaceMuted at WCAG AA for body text", () => {
    const failures: string[] = [];
    for (const theme of builtInComponentThemes) {
      const { surfaceMuted, foregroundMuted } = theme.properties.color;
      const surface = parseOklch(surfaceMuted);
      const text = parseOklch(foregroundMuted);
      const ratio = contrastRatio(
        oklchToLinearRgb(surface.L, surface.C, surface.H),
        oklchToLinearRgb(text.L, text.C, text.H),
      );
      if (ratio < WCAG_AA_NORMAL) {
        failures.push(`${theme.id}: ${ratio.toFixed(3)}:1`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("documents non-blocking Issue #51 sage/sand/ink contrast warnings", () => {
    const parsed = parseShadcnThemeCssBlocks(
      `${cssBlock(":root", issue51RootValues)}\n\n${cssBlock(".dark", issue51DarkValues)}`,
    );
    if (!parsed.ok) throw new Error("Issue #51 fixture should parse.");
    const theme = makeTheme({ palettes: parsed.value });
    const warnings = collectComponentThemeRolePairDiagnostics(theme).map((diagnostic) => ({
      code: diagnostic.code,
      severity: diagnostic.severity,
      mode: diagnostic.mode,
      path: diagnostic.path,
      backgroundPath: diagnostic.backgroundPath,
      recovery: diagnostic.recovery,
    }));

    expect(warnings).toEqual([
      {
        code: "low-component-theme-role-pair-contrast",
        severity: "warning",
        mode: "light",
        path: "palettes.light.color.accentForeground",
        backgroundPath: "palettes.light.color.accent",
        recovery:
          "Add color.accentForeground and color.accent values that contrast at least 4.5:1, or choose a built-in accessible theme palette.",
      },
      {
        code: "low-component-theme-role-pair-contrast",
        severity: "warning",
        mode: "light",
        path: "palettes.light.color.foregroundMuted",
        backgroundPath: "palettes.light.color.surfaceMuted",
        recovery:
          "Add color.foregroundMuted and color.surfaceMuted values that contrast at least 4.5:1, or choose a built-in accessible theme palette.",
      },
      {
        code: "low-component-theme-role-pair-contrast",
        severity: "warning",
        mode: "dark",
        path: "palettes.dark.color.destructiveForeground",
        backgroundPath: "palettes.dark.color.destructive",
        recovery:
          "Add color.destructiveForeground and color.destructive values that contrast at least 4.5:1, or choose a built-in accessible theme palette.",
      },
    ]);
  });
});

describe("collectComponentThemeRolePairDiagnostics", () => {
  it("reports missing optional roles with stable palette paths and recovery copy", () => {
    const theme = makeTheme({
      properties: {
        ...getBuiltInComponentTheme("default")!.properties,
        color: {
          ...getBuiltInComponentTheme("default")!.properties.color,
          cardForeground: undefined,
        },
      },
    });

    const diagnostics = collectComponentThemeRolePairDiagnostics(theme);

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "missing-component-theme-role-pair",
        mode: "light",
        foregroundRole: "cardForeground",
        backgroundRole: "surface",
        path: "palettes.light.color.cardForeground",
        recovery:
          "Add color.cardForeground and color.surface values that contrast at least 4.5:1, or choose a built-in accessible theme palette.",
      }),
    );
  });

  it("reports low-contrast role pairs with deterministic ratios", () => {
    const theme = makeTheme({
      properties: {
        ...getBuiltInComponentTheme("default")!.properties,
        color: {
          ...getBuiltInComponentTheme("default")!.properties.color,
          foreground: "#777777",
          surface: "#777777",
        },
      },
    });

    const diagnostic = collectComponentThemeRolePairDiagnostics(theme).find(
      (entry) =>
        entry.mode === "light" &&
        entry.foregroundRole === "foreground" &&
        entry.backgroundRole === "surface",
    );

    expect(diagnostic).toMatchObject({
      code: "low-component-theme-role-pair-contrast",
      path: "palettes.light.color.foreground",
      backgroundPath: "palettes.light.color.surface",
      contrastRatio: 1,
      minimumContrastRatio: 4.5,
    });
  });

  it("checks every Issue #51 pair in both light and dark palettes", () => {
    const theme = makeTheme({
      palettes: {
        dark: {
          color: {
            accent: "#555555",
            accentForeground: "#555555",
          },
        },
      },
    });

    const diagnostics = collectComponentThemeRolePairDiagnostics(theme);

    expect(componentThemeContrastRolePairs).toHaveLength(8);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        mode: "dark",
        foregroundRole: "accentForeground",
        backgroundRole: "accent",
        path: "palettes.dark.color.accentForeground",
      }),
    );
    expect(
      diagnostics.filter(
        (entry) =>
          entry.mode === "dark" &&
          entry.foregroundRole === "accentForeground" &&
          entry.backgroundRole === "accent",
      ),
    ).toHaveLength(1);
  });
});

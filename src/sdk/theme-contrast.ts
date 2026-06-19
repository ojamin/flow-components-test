import type { ComponentThemeColorRole } from "../themes";
import { parseComponentThemeCssColor, type ComponentThemeRgbaColor } from "./theme-color-utils";
import {
  resolveComponentThemePaletteProperties,
  type ComponentTheme,
  type ComponentThemePaletteMode,
  type ComponentThemeProperties,
} from "./theme";

export type ComponentThemeContrastRolePair = {
  readonly foregroundRole: ComponentThemeColorRole;
  readonly backgroundRole: ComponentThemeColorRole;
  readonly minimumContrastRatio: number;
};

export type ComponentThemeRolePairDiagnostic = {
  readonly code: "missing-component-theme-role-pair" | "low-component-theme-role-pair-contrast";
  readonly severity: "warning";
  readonly themeId?: string;
  readonly mode: ComponentThemePaletteMode;
  readonly foregroundRole: ComponentThemeColorRole;
  readonly backgroundRole: ComponentThemeColorRole;
  readonly path: string;
  readonly foregroundPath: string;
  readonly backgroundPath: string;
  readonly contrastRatio?: number;
  readonly minimumContrastRatio: number;
  readonly recovery: string;
  readonly message: string;
};

export const componentThemeContrastRolePairs = Object.freeze([
  { foregroundRole: "foreground", backgroundRole: "pageBackground", minimumContrastRatio: 4.5 },
  { foregroundRole: "foreground", backgroundRole: "surface", minimumContrastRatio: 4.5 },
  { foregroundRole: "cardForeground", backgroundRole: "surface", minimumContrastRatio: 4.5 },
  { foregroundRole: "popoverForeground", backgroundRole: "popover", minimumContrastRatio: 4.5 },
  { foregroundRole: "accentForeground", backgroundRole: "accent", minimumContrastRatio: 4.5 },
  {
    foregroundRole: "secondaryForeground",
    backgroundRole: "secondary",
    minimumContrastRatio: 4.5,
  },
  {
    foregroundRole: "destructiveForeground",
    backgroundRole: "destructive",
    minimumContrastRatio: 4.5,
  },
  { foregroundRole: "foregroundMuted", backgroundRole: "surfaceMuted", minimumContrastRatio: 4.5 },
] as const satisfies readonly ComponentThemeContrastRolePair[]);

export function collectComponentThemeRolePairDiagnostics(
  theme: ComponentTheme,
): ComponentThemeRolePairDiagnostic[] {
  return (["light", "dark"] as const).flatMap((mode) => {
    const resolved = resolveComponentThemePaletteProperties(theme, mode).properties;
    return collectComponentThemeRolePairDiagnosticsForMode(theme, mode, resolved);
  });
}

export function collectComponentThemeRolePairDiagnosticsForMode(
  theme: ComponentTheme,
  mode: ComponentThemePaletteMode,
  properties: ComponentThemeProperties,
): ComponentThemeRolePairDiagnostic[] {
  const diagnostics: ComponentThemeRolePairDiagnostic[] = [];
  const colors = isRecord(properties.color) ? properties.color : {};

  for (const pair of componentThemeContrastRolePairs) {
    const foregroundPath = rolePairPath(mode, pair.foregroundRole);
    const backgroundPath = rolePairPath(mode, pair.backgroundRole);
    const foreground = readColorRoleValue(colors, pair.foregroundRole);
    const background = readColorRoleValue(colors, pair.backgroundRole);
    const recovery = rolePairRecovery(pair);

    if (!foreground || !background) {
      const missingRole = foreground ? pair.backgroundRole : pair.foregroundRole;
      diagnostics.push({
        code: "missing-component-theme-role-pair",
        severity: "warning",
        themeId: theme.id,
        mode,
        foregroundRole: pair.foregroundRole,
        backgroundRole: pair.backgroundRole,
        path: rolePairPath(mode, missingRole),
        foregroundPath,
        backgroundPath,
        minimumContrastRatio: pair.minimumContrastRatio,
        recovery,
        message: `Theme "${theme.id}" ${mode} palette is missing color.${missingRole} for the color.${pair.foregroundRole} on color.${pair.backgroundRole} contrast pair. ${recovery}`,
      });
      continue;
    }

    const ratio = calculateContrastRatio(foreground, background);
    if (ratio === undefined || ratio < pair.minimumContrastRatio) {
      const contrastRatio = ratio === undefined ? undefined : roundContrastRatio(ratio);
      diagnostics.push({
        code: "low-component-theme-role-pair-contrast",
        severity: "warning",
        themeId: theme.id,
        mode,
        foregroundRole: pair.foregroundRole,
        backgroundRole: pair.backgroundRole,
        path: foregroundPath,
        foregroundPath,
        backgroundPath,
        ...(contrastRatio === undefined ? {} : { contrastRatio }),
        minimumContrastRatio: pair.minimumContrastRatio,
        recovery,
        message: `Theme "${theme.id}" ${mode} palette color.${pair.foregroundRole} on color.${pair.backgroundRole} contrast is ${contrastRatio ?? "unreadable"}:1; expected at least ${pair.minimumContrastRatio}:1. ${recovery}`,
      });
    }
  }

  return diagnostics;
}

function readColorRoleValue(
  colors: Record<string, unknown>,
  role: ComponentThemeColorRole,
): ComponentThemeRgbaColor | undefined {
  const value = colors[role];
  return typeof value === "string" ? parseComponentThemeCssColor(value) : undefined;
}

function rolePairPath(mode: ComponentThemePaletteMode, role: ComponentThemeColorRole): string {
  return `palettes.${mode}.color.${role}`;
}

function rolePairRecovery(pair: ComponentThemeContrastRolePair): string {
  return `Add color.${pair.foregroundRole} and color.${pair.backgroundRole} values that contrast at least ${pair.minimumContrastRatio}:1, or choose a built-in accessible theme palette.`;
}

function calculateContrastRatio(
  foreground: ComponentThemeRgbaColor,
  background: ComponentThemeRgbaColor,
): number | undefined {
  const opaqueBackground = compositeOverWhite(background);
  const foregroundOnBackground = composite(foreground, opaqueBackground);
  const foregroundLuminance = relativeLuminance(foregroundOnBackground);
  const backgroundLuminance = relativeLuminance(opaqueBackground);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  if (!Number.isFinite(lighter) || !Number.isFinite(darker)) return undefined;
  return (lighter + 0.05) / (darker + 0.05);
}

function compositeOverWhite(color: ComponentThemeRgbaColor): ComponentThemeRgbaColor {
  return composite(color, { red: 255, green: 255, blue: 255, alpha: 1 });
}

function composite(
  foreground: ComponentThemeRgbaColor,
  background: ComponentThemeRgbaColor,
): ComponentThemeRgbaColor {
  const alpha = clamp01(foreground.alpha);
  const inverseAlpha = 1 - alpha;
  return {
    red: foreground.red * alpha + background.red * inverseAlpha,
    green: foreground.green * alpha + background.green * inverseAlpha,
    blue: foreground.blue * alpha + background.blue * inverseAlpha,
    alpha: 1,
  };
}

function relativeLuminance(color: ComponentThemeRgbaColor): number {
  return (
    0.2126 * srgbToLinear(color.red) +
    0.7152 * srgbToLinear(color.green) +
    0.0722 * srgbToLinear(color.blue)
  );
}

function srgbToLinear(channel: number): number {
  const normalized = clamp01(channel / 255);
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function roundContrastRatio(ratio: number): number {
  return Number(ratio.toFixed(3));
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

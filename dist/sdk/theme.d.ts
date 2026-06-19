import { type ComponentThemeColorRole, type ComponentThemeContextV1, type ComponentThemeFontRole, type ComponentThemeMotionRole, type ComponentThemeRadiusRole, type ComponentThemeShadowRole, type ComponentThemeSpacingRole, type ComponentThemeV1 } from "../themes/index.js";
import { type ComponentThemeRgbaColor } from "./theme-color-utils.js";
export type { ComponentThemeColorRole } from "../themes/index.js";
export type ComponentTheme = ComponentThemeV1;
export type ComponentThemeProperties = ComponentThemeV1["properties"];
export declare const componentThemePaletteModes: readonly ["light", "dark"];
export type ComponentThemePaletteMode = (typeof componentThemePaletteModes)[number];
export declare const componentThemeDefaultLightColor = "#ffffff";
export type ComponentThemeContext = ComponentThemeContextV1;
export type { ComponentThemeRgbaColor } from "./theme-color-utils.js";
export type ComponentThemePropertyGroup = keyof ComponentThemeProperties;
export type ComponentThemePropertyValue = string | number;
export type ThemePropertyKey = `color.${ComponentThemeColorRole}` | `font.${ComponentThemeFontRole}` | `radius.${ComponentThemeRadiusRole}` | `spacing.${ComponentThemeSpacingRole}` | `motion.${ComponentThemeMotionRole}` | `shadow.${ComponentThemeShadowRole}`;
export type ComponentThemeCssVariableMap = Record<`--ct-${string}` | `--color-ct-${string}`, string>;
export type ComponentThemePropertyOverrides = {
    readonly [Group in ComponentThemePropertyGroup]?: Partial<NonNullable<ComponentThemeProperties[Group]>>;
};
export type ComponentThemePaletteFallbackDiagnostic = {
    readonly code: "missing-dark-palette-role-fallback";
    readonly themeId?: string;
    readonly mode: "dark";
    readonly propertyKey: ThemePropertyKey;
    readonly path: string;
    readonly fallbackPath: string;
    readonly message: string;
};
export type ComponentThemePaletteResolutionResult = {
    readonly properties: ComponentThemeProperties;
    readonly diagnostics: readonly ComponentThemePaletteFallbackDiagnostic[];
};
export interface ResolveComponentThemePalettePropertiesOptions {
    readonly pathPrefix?: string;
    readonly fallbackPathPrefix?: string;
}
type CssVariableSlots = {
    readonly [Group in ComponentThemePropertyGroup]: Readonly<Record<keyof NonNullable<ComponentThemeProperties[Group]> & string, `--ct-${string}`>>;
};
export declare const componentThemePropertyRolesByGroup: Readonly<{
    readonly color: readonly ["pageBackground", "surface", "cardForeground", "popover", "popoverForeground", "surfaceMuted", "foreground", "foregroundMuted", "border", "accent", "accentForeground", "secondary", "secondaryForeground", "accentSubtle", "accentSubtleForeground", "focusRing", "destructive", "destructiveForeground", "input", "sidebar", "sidebarForeground", "sidebarPrimary", "sidebarPrimaryForeground", "sidebarAccent", "sidebarAccentForeground", "sidebarBorder", "sidebarRing", "warning", "info", "success", "chart1", "chart2", "chart3", "chart4", "chart5"];
    readonly font: readonly ["body", "heading", "mono"];
    readonly radius: readonly ["none", "sm", "md", "lg", "xl", "full"];
    readonly spacing: readonly ["none", "sm", "md", "lg", "xl"];
    readonly motion: readonly ["durationFastMs", "durationNormalMs", "easing"];
    readonly shadow: readonly ["sm", "md", "lg"];
}>;
export declare const componentThemeScopeAttribute: "data-ct-scope";
/** Raw CSS variable prefix without trailing hyphen; full slots are `--ct-{group}-{role}`. */
export declare const componentThemeCssVariablePrefix: "--ct";
export declare const componentThemePropertyFallback: "";
export declare function themeRoleKeyToCssVariableSuffix(roleKey: string): string;
export declare const componentThemeCssVariableSlots: CssVariableSlots;
export declare const componentThemePropertyKeys: readonly ThemePropertyKey[];
export declare const componentThemeCssVariableByPropertyKey: Readonly<Record<ThemePropertyKey, `--ct-${string}`>>;
export declare function isValidComponentThemePropertyValue(group: ComponentThemePropertyGroup, role: string, value: unknown): value is ComponentThemePropertyValue;
export declare function resolveThemeProperty(context: ComponentThemeContext | Record<string, unknown> | null | undefined, propertyKey: ThemePropertyKey | string, fallback?: ComponentThemePropertyValue): ComponentThemePropertyValue;
export declare function createThemeCssVariableMap(contextOrProperties: ComponentThemeContext | ComponentThemeProperties | Record<string, unknown> | null | undefined, fallback?: ComponentThemePropertyValue): ComponentThemeCssVariableMap;
export declare function composeThemeProperties(base: ComponentThemeProperties, overrides?: ComponentThemePropertyOverrides | Record<string, unknown> | null): ComponentThemeProperties;
export declare function resolveComponentThemePaletteProperties(theme: ComponentTheme, mode?: ComponentThemePaletteMode, options?: ResolveComponentThemePalettePropertiesOptions): ComponentThemePaletteResolutionResult;
export declare function resolveThemeColorRgba(context: ComponentThemeContext | Record<string, unknown> | null | undefined, role: ComponentThemeColorRole): ComponentThemeRgbaColor;
export declare function resolveThemeColorForCanvas(context: ComponentThemeContext | Record<string, unknown> | null | undefined, role: ComponentThemeColorRole): string;
export declare function resolveThemeColorForSvg(context: ComponentThemeContext | Record<string, unknown> | null | undefined, role: ComponentThemeColorRole): string;

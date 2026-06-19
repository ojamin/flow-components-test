import { type ComponentThemePropertyOverrides } from "./theme.js";
export declare const componentThemeShadcnColorAliasEntries: readonly [readonly ["background", "pageBackground"], readonly ["foreground", "foreground"], readonly ["card", "surface"], readonly ["card-foreground", "cardForeground"], readonly ["popover", "popover"], readonly ["popover-foreground", "popoverForeground"], readonly ["primary", "accent"], readonly ["primary-foreground", "accentForeground"], readonly ["secondary", "secondary"], readonly ["secondary-foreground", "secondaryForeground"], readonly ["muted", "surfaceMuted"], readonly ["muted-foreground", "foregroundMuted"], readonly ["accent", "accentSubtle"], readonly ["accent-foreground", "accentSubtleForeground"], readonly ["destructive", "destructive"], readonly ["destructive-foreground", "destructiveForeground"], readonly ["border", "border"], readonly ["input", "input"], readonly ["ring", "focusRing"], readonly ["chart-1", "chart1"], readonly ["chart-2", "chart2"], readonly ["chart-3", "chart3"], readonly ["chart-4", "chart4"], readonly ["chart-5", "chart5"], readonly ["sidebar", "sidebar"], readonly ["sidebar-foreground", "sidebarForeground"], readonly ["sidebar-primary", "sidebarPrimary"], readonly ["sidebar-primary-foreground", "sidebarPrimaryForeground"], readonly ["sidebar-accent", "sidebarAccent"], readonly ["sidebar-accent-foreground", "sidebarAccentForeground"], readonly ["sidebar-border", "sidebarBorder"], readonly ["sidebar-ring", "sidebarRing"]];
export type ComponentThemeShadcnColorAlias = (typeof componentThemeShadcnColorAliasEntries)[number][0];
export type ComponentThemeAliasDiagnostic = {
    readonly path: string;
    readonly reason: "conflicting-theme-property-alias" | "invalid-theme-property-value" | "unsupported-theme-property-key" | "unsupported-theme-alias";
    readonly message: string;
    readonly group?: string;
    readonly key?: string;
    readonly aliasKey?: string;
    readonly canonicalKey?: string;
    readonly expected?: string;
    readonly supportedKeys?: readonly string[];
    readonly suggestions?: readonly string[];
    readonly recovery?: string;
};
export type ComponentThemeAliasNormalizationResult = {
    readonly ok: true;
    readonly value: ComponentThemePropertyOverrides;
} | {
    readonly ok: false;
    readonly diagnostics: readonly ComponentThemeAliasDiagnostic[];
};
export declare function normalizeComponentThemePropertyAliases(overrides: Record<string, unknown>, path?: string): ComponentThemeAliasNormalizationResult;

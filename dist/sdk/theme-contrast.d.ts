import type { ComponentThemeColorRole } from "../themes/index.js";
import { type ComponentTheme, type ComponentThemePaletteMode, type ComponentThemeProperties } from "./theme.js";
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
export declare const componentThemeContrastRolePairs: readonly [{
    readonly foregroundRole: "foreground";
    readonly backgroundRole: "pageBackground";
    readonly minimumContrastRatio: 4.5;
}, {
    readonly foregroundRole: "foreground";
    readonly backgroundRole: "surface";
    readonly minimumContrastRatio: 4.5;
}, {
    readonly foregroundRole: "cardForeground";
    readonly backgroundRole: "surface";
    readonly minimumContrastRatio: 4.5;
}, {
    readonly foregroundRole: "popoverForeground";
    readonly backgroundRole: "popover";
    readonly minimumContrastRatio: 4.5;
}, {
    readonly foregroundRole: "accentForeground";
    readonly backgroundRole: "accent";
    readonly minimumContrastRatio: 4.5;
}, {
    readonly foregroundRole: "secondaryForeground";
    readonly backgroundRole: "secondary";
    readonly minimumContrastRatio: 4.5;
}, {
    readonly foregroundRole: "destructiveForeground";
    readonly backgroundRole: "destructive";
    readonly minimumContrastRatio: 4.5;
}, {
    readonly foregroundRole: "foregroundMuted";
    readonly backgroundRole: "surfaceMuted";
    readonly minimumContrastRatio: 4.5;
}];
export declare function collectComponentThemeRolePairDiagnostics(theme: ComponentTheme): ComponentThemeRolePairDiagnostic[];
export declare function collectComponentThemeRolePairDiagnosticsForMode(theme: ComponentTheme, mode: ComponentThemePaletteMode, properties: ComponentThemeProperties): ComponentThemeRolePairDiagnostic[];

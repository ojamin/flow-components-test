import { type ComponentThemeAliasDiagnostic } from "./theme-aliases.js";
import type { ComponentThemePropertyOverrides } from "./theme.js";
export type ComponentThemeCssBlockName = "light" | "dark";
export type ComponentThemeCssBlockParseValue = {
    readonly light?: ComponentThemePropertyOverrides;
    readonly dark?: ComponentThemePropertyOverrides;
};
export type ComponentThemeCssDiagnosticReason = ComponentThemeAliasDiagnostic["reason"] | "theme-css-block-not-found" | "unsupported-theme-css-selector" | "unsupported-theme-css-declaration";
export type ComponentThemeCssDiagnostic = Omit<ComponentThemeAliasDiagnostic, "reason"> & {
    readonly reason: ComponentThemeCssDiagnosticReason;
    readonly selector?: string;
    readonly declarationIndex?: number;
};
export type ComponentThemeCssBlockParseResult = {
    readonly ok: true;
    readonly value: ComponentThemeCssBlockParseValue;
} | {
    readonly ok: false;
    readonly diagnostics: readonly ComponentThemeCssDiagnostic[];
};
export declare const shadcnRadiusBaseRole: "lg";
export declare function parseShadcnThemeCssBlocks(cssText: string, path?: string): ComponentThemeCssBlockParseResult;

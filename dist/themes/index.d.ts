import { type ComponentThemeV1 } from "./schema.js";
export * from "./schema.js";
export type ComponentThemeRegistry = {
    readonly themes: readonly ComponentThemeV1[];
    readonly ids: readonly string[];
    readonly byId: ReadonlyMap<string, ComponentThemeV1>;
};
export declare function createComponentThemeRegistry(themes: readonly unknown[]): ComponentThemeRegistry;
export declare const builtInComponentThemes: readonly {
    version: 1;
    id: string;
    displayName: string;
    properties: {
        color: {
            pageBackground: string;
            surface: string;
            surfaceMuted: string;
            foreground: string;
            foregroundMuted: string;
            border: string;
            accent: string;
            accentForeground: string;
            focusRing: string;
            destructive: string;
            warning: string;
            info: string;
            success: string;
            chart1: string;
            chart2: string;
            chart3: string;
            chart4: string;
            chart5: string;
            cardForeground?: string | undefined;
            popover?: string | undefined;
            popoverForeground?: string | undefined;
            secondary?: string | undefined;
            secondaryForeground?: string | undefined;
            accentSubtle?: string | undefined;
            accentSubtleForeground?: string | undefined;
            destructiveForeground?: string | undefined;
            input?: string | undefined;
            sidebar?: string | undefined;
            sidebarForeground?: string | undefined;
            sidebarPrimary?: string | undefined;
            sidebarPrimaryForeground?: string | undefined;
            sidebarAccent?: string | undefined;
            sidebarAccentForeground?: string | undefined;
            sidebarBorder?: string | undefined;
            sidebarRing?: string | undefined;
        };
        font: {
            body: string;
            heading: string;
            mono: string;
        };
        radius: {
            none: string;
            sm: string;
            md: string;
            lg: string;
            xl?: string | undefined;
            full?: string | undefined;
        };
        spacing: {
            none: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
        motion: {
            durationFastMs: number;
            durationNormalMs: number;
            easing: string;
        };
        shadow?: {
            sm: string;
            md: string;
            lg: string;
        } | undefined;
    };
    description?: string | undefined;
    palettes?: {
        light?: {
            color?: {
                input?: string | undefined;
                success?: string | undefined;
                pageBackground?: string | undefined;
                surface?: string | undefined;
                cardForeground?: string | undefined;
                popover?: string | undefined;
                popoverForeground?: string | undefined;
                surfaceMuted?: string | undefined;
                foreground?: string | undefined;
                foregroundMuted?: string | undefined;
                border?: string | undefined;
                accent?: string | undefined;
                accentForeground?: string | undefined;
                secondary?: string | undefined;
                secondaryForeground?: string | undefined;
                accentSubtle?: string | undefined;
                accentSubtleForeground?: string | undefined;
                focusRing?: string | undefined;
                destructive?: string | undefined;
                destructiveForeground?: string | undefined;
                sidebar?: string | undefined;
                sidebarForeground?: string | undefined;
                sidebarPrimary?: string | undefined;
                sidebarPrimaryForeground?: string | undefined;
                sidebarAccent?: string | undefined;
                sidebarAccentForeground?: string | undefined;
                sidebarBorder?: string | undefined;
                sidebarRing?: string | undefined;
                warning?: string | undefined;
                info?: string | undefined;
                chart1?: string | undefined;
                chart2?: string | undefined;
                chart3?: string | undefined;
                chart4?: string | undefined;
                chart5?: string | undefined;
            } | undefined;
            font?: {
                body?: string | undefined;
                heading?: string | undefined;
                mono?: string | undefined;
            } | undefined;
            radius?: {
                none?: string | undefined;
                sm?: string | undefined;
                md?: string | undefined;
                lg?: string | undefined;
                xl?: string | undefined;
                full?: string | undefined;
            } | undefined;
            spacing?: {
                none?: string | undefined;
                sm?: string | undefined;
                md?: string | undefined;
                lg?: string | undefined;
                xl?: string | undefined;
            } | undefined;
            motion?: {
                durationFastMs?: number | undefined;
                durationNormalMs?: number | undefined;
                easing?: string | undefined;
            } | undefined;
            shadow?: {
                sm?: string | undefined;
                md?: string | undefined;
                lg?: string | undefined;
            } | undefined;
        } | undefined;
        dark?: {
            color?: {
                input?: string | undefined;
                success?: string | undefined;
                pageBackground?: string | undefined;
                surface?: string | undefined;
                cardForeground?: string | undefined;
                popover?: string | undefined;
                popoverForeground?: string | undefined;
                surfaceMuted?: string | undefined;
                foreground?: string | undefined;
                foregroundMuted?: string | undefined;
                border?: string | undefined;
                accent?: string | undefined;
                accentForeground?: string | undefined;
                secondary?: string | undefined;
                secondaryForeground?: string | undefined;
                accentSubtle?: string | undefined;
                accentSubtleForeground?: string | undefined;
                focusRing?: string | undefined;
                destructive?: string | undefined;
                destructiveForeground?: string | undefined;
                sidebar?: string | undefined;
                sidebarForeground?: string | undefined;
                sidebarPrimary?: string | undefined;
                sidebarPrimaryForeground?: string | undefined;
                sidebarAccent?: string | undefined;
                sidebarAccentForeground?: string | undefined;
                sidebarBorder?: string | undefined;
                sidebarRing?: string | undefined;
                warning?: string | undefined;
                info?: string | undefined;
                chart1?: string | undefined;
                chart2?: string | undefined;
                chart3?: string | undefined;
                chart4?: string | undefined;
                chart5?: string | undefined;
            } | undefined;
            font?: {
                body?: string | undefined;
                heading?: string | undefined;
                mono?: string | undefined;
            } | undefined;
            radius?: {
                none?: string | undefined;
                sm?: string | undefined;
                md?: string | undefined;
                lg?: string | undefined;
                xl?: string | undefined;
                full?: string | undefined;
            } | undefined;
            spacing?: {
                none?: string | undefined;
                sm?: string | undefined;
                md?: string | undefined;
                lg?: string | undefined;
                xl?: string | undefined;
            } | undefined;
            motion?: {
                durationFastMs?: number | undefined;
                durationNormalMs?: number | undefined;
                easing?: string | undefined;
            } | undefined;
            shadow?: {
                sm?: string | undefined;
                md?: string | undefined;
                lg?: string | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
}[];
export declare const builtInComponentThemeIds: readonly string[];
export declare function getBuiltInComponentTheme(id: string): ComponentThemeV1 | undefined;

export type ComponentThemeRgbaColor = {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly alpha: number;
};
export declare function parseComponentThemeCssColor(value: string): ComponentThemeRgbaColor | undefined;
export declare function formatComponentThemeCanvasColor(color: ComponentThemeRgbaColor): string;

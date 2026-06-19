export interface ActivationKeyboardEvent {
    readonly key: string;
}
export interface ArrowNavigationOptions {
    orientation?: "horizontal" | "vertical" | "both";
    wrap?: boolean;
}
export interface AriaLabelOptions {
    kind: "datum" | "slice" | "cell" | "region" | "graph" | "geo";
    label?: string;
    value?: number | string | null;
    seriesName?: string;
    rowLabel?: string;
    columnLabel?: string;
    index?: number;
    total?: number;
}
export declare function isActivationKey(event: ActivationKeyboardEvent): boolean;
export declare function getNextArrowNavigationIndex(currentIndex: number, itemCount: number, key: string, options?: ArrowNavigationOptions): number;
export declare function createInteractiveKey(prefix: string, parts: readonly unknown[]): string;
export declare function createAriaLabel(options: AriaLabelOptions): string;

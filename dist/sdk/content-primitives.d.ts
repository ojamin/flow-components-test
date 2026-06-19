/** Package-owned content helpers used by migrated content components. */
import type { ThemePropertyKey } from "./theme.js";
export declare const contentAlignOptions: readonly ["left", "center", "right"];
export type ContentAlign = (typeof contentAlignOptions)[number];
export declare const contentToneOptions: readonly ["foregroundMuted", "chart1", "chart2", "chart3", "chart4", "chart5"];
export type ContentTone = (typeof contentToneOptions)[number];
export declare const contentSpacingOptions: readonly ["none", "xs", "sm", "md", "lg", "xl"];
export type ContentSpacing = (typeof contentSpacingOptions)[number];
export declare const proseSizeOptions: readonly ["sm", "base", "lg"];
export type ProseSize = (typeof proseSizeOptions)[number];
export declare const clampLineOptions: readonly ["none", "2", "3", "4", "5", "6"];
export type ClampLines = (typeof clampLineOptions)[number];
export declare const imageObjectFitOptions: readonly ["cover", "contain", "fill", "none"];
export type ImageObjectFit = (typeof imageObjectFitOptions)[number];
export declare const imageAspectRatioOptions: readonly ["auto", "square", "video", "landscape", "portrait"];
export type ImageAspectRatio = (typeof imageAspectRatioOptions)[number];
export declare const buttonVariantOptions: readonly ["default", "secondary", "outline", "ghost", "link"];
export type ContentButtonVariant = (typeof buttonVariantOptions)[number];
export declare const buttonSizeOptions: readonly ["xs", "sm", "default", "lg"];
export type ContentButtonSize = (typeof buttonSizeOptions)[number];
export declare const buttonTargetOptions: readonly ["self", "blank"];
export type ContentButtonTarget = (typeof buttonTargetOptions)[number];
export declare const dividerThicknessOptions: readonly ["hairline", "thin", "medium", "thick"];
export type DividerThickness = (typeof dividerThicknessOptions)[number];
/** Canonical color role probed for each `ContentTone`. Renderers iterate this
 * map through `resolveThemeProperty` so the host theme seam is intentionally
 * exercised on every paint and a future role rename surfaces here, not at
 * paint time. */
export declare const contentToneThemeRoleByTone: Record<ContentTone, ThemePropertyKey>;
export declare function resolveContentAlignClass(align?: ContentAlign): string;
export declare function resolveContentTextAlignClass(align?: ContentAlign): string;
export declare function resolveContentAccentAlignmentClass(align?: ContentAlign): string;
export declare function resolveContentToneAccentClass(tone?: ContentTone): string;
export declare function resolveMarginBottomClass(spacing?: ContentSpacing): string;
export declare function resolveMarginYClass(spacing?: ContentSpacing): string;
export declare function resolveProseSizeClass(size?: ProseSize): string;
export declare function resolveClampLinesClass(lines?: ClampLines): string;
export declare function resolveImageObjectFitClass(fit?: ImageObjectFit): string;
export declare function resolveImageAspectRatioClass(aspectRatio?: ImageAspectRatio): string;
export declare function resolveDividerThicknessClass(thickness?: DividerThickness): string;
export declare function resolveSafeHref(rawHref: string): {
    readonly state: "valid";
    readonly href: string;
} | {
    readonly state: "missing";
} | {
    readonly state: "unsafe";
};
export declare function toAbsoluteUrlString(href: string): string | null;
export declare function resolveSafeImageSrc(rawSrc: string): {
    state: "missing";
    src?: undefined;
} | {
    state: "valid";
    src: string;
} | {
    state: "unsafe";
    src?: undefined;
};

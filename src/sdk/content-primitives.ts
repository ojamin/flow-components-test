/** Package-owned content helpers used by migrated content components. */

import type { ThemePropertyKey } from "./theme";

export const contentAlignOptions = ["left", "center", "right"] as const;
export type ContentAlign = (typeof contentAlignOptions)[number];

export const contentToneOptions = [
  "foregroundMuted",
  "chart1",
  "chart2",
  "chart3",
  "chart4",
  "chart5",
] as const;
export type ContentTone = (typeof contentToneOptions)[number];

export const contentSpacingOptions = ["none", "xs", "sm", "md", "lg", "xl"] as const;
export type ContentSpacing = (typeof contentSpacingOptions)[number];

export const proseSizeOptions = ["sm", "base", "lg"] as const;
export type ProseSize = (typeof proseSizeOptions)[number];

export const clampLineOptions = ["none", "2", "3", "4", "5", "6"] as const;
export type ClampLines = (typeof clampLineOptions)[number];

export const imageObjectFitOptions = ["cover", "contain", "fill", "none"] as const;
export type ImageObjectFit = (typeof imageObjectFitOptions)[number];

export const imageAspectRatioOptions = [
  "auto",
  "square",
  "video",
  "landscape",
  "portrait",
] as const;
export type ImageAspectRatio = (typeof imageAspectRatioOptions)[number];

export const buttonVariantOptions = ["default", "secondary", "outline", "ghost", "link"] as const;
export type ContentButtonVariant = (typeof buttonVariantOptions)[number];

export const buttonSizeOptions = ["xs", "sm", "default", "lg"] as const;
export type ContentButtonSize = (typeof buttonSizeOptions)[number];

export const buttonTargetOptions = ["self", "blank"] as const;
export type ContentButtonTarget = (typeof buttonTargetOptions)[number];

export const dividerThicknessOptions = ["hairline", "thin", "medium", "thick"] as const;
export type DividerThickness = (typeof dividerThicknessOptions)[number];

const alignClassMap: Record<ContentAlign, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};

const textAlignClassMap: Record<ContentAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const accentAlignmentClassMap: Record<ContentAlign, string> = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

// Content accent tones map to canonical component-theme color roles via static
// `ct-*` Tailwind alias classes. The host theme bridge owns `--ct-color-*`
// CSS variables; these aliases resolve to those variables at paint time so the
// active theme drives every accent surface and content renderers cannot bypass
// the theme with renderer-local palette overrides. The mapping is intentionally
// flat (no opacity modifiers) so palette saturation cannot leak past the theme
// — saturation is a theme decision, not a renderer decision. `foregroundMuted`
// is the "no accent" / neutral tone and maps to `foregroundMuted` rather than
// `border`: the `border` role is a hairline separator color and is too low
// contrast against typical surfaces to read as an intentional accent line on
// dividers and heading underlines.
const toneAccentClassMap: Record<ContentTone, string> = {
  foregroundMuted: "bg-ct-foreground-muted",
  chart1: "bg-ct-chart1",
  chart2: "bg-ct-chart2",
  chart3: "bg-ct-chart3",
  chart4: "bg-ct-chart4",
  chart5: "bg-ct-chart5",
};

/** Canonical color role probed for each `ContentTone`. Renderers iterate this
 * map through `resolveThemeProperty` so the host theme seam is intentionally
 * exercised on every paint and a future role rename surfaces here, not at
 * paint time. */
export const contentToneThemeRoleByTone: Record<ContentTone, ThemePropertyKey> = {
  foregroundMuted: "color.foregroundMuted",
  chart1: "color.chart1",
  chart2: "color.chart2",
  chart3: "color.chart3",
  chart4: "color.chart4",
  chart5: "color.chart5",
};

const spacingMarginBottomClassMap: Record<ContentSpacing, string> = {
  none: "mb-0",
  xs: "mb-1",
  sm: "mb-2",
  md: "mb-4",
  lg: "mb-6",
  xl: "mb-8",
};

const spacingMarginYClassMap: Record<ContentSpacing, string> = {
  none: "my-0",
  xs: "my-1",
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
  xl: "my-8",
};

const proseSizeClassMap: Record<ProseSize, string> = {
  sm: "prose-sm",
  base: "",
  lg: "prose-lg",
};

const clampLineClassMap: Record<ClampLines, string> = {
  none: "",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

const objectFitClassMap: Record<ImageObjectFit, string> = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
};

const aspectRatioClassMap: Record<ImageAspectRatio, string> = {
  auto: "aspect-auto",
  square: "aspect-square",
  video: "aspect-video",
  landscape: "aspect-[4/3]",
  portrait: "aspect-[3/4]",
};

const dividerThicknessClassMap: Record<DividerThickness, string> = {
  hairline: "h-px",
  thin: "h-0.5",
  medium: "h-1",
  thick: "h-1.5",
};

const safeRelativeUrlPattern = /^(\/(?!\/)|\.{1,2}\/|\?|#)/;
const safeBareRelativeUrlPattern = /^[^/:?#]+(?:[/?#].*)?$/;
const safeHrefSchemePattern = /^(https?:|mailto:|tel:)/i;
const safeImageSchemePattern =
  /^(https?:|blob:|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,)/i;

export function resolveContentAlignClass(align: ContentAlign = "left") {
  return alignClassMap[align];
}

export function resolveContentTextAlignClass(align: ContentAlign = "left") {
  return textAlignClassMap[align];
}

export function resolveContentAccentAlignmentClass(align: ContentAlign = "left") {
  return accentAlignmentClassMap[align];
}

export function resolveContentToneAccentClass(tone: ContentTone = "foregroundMuted") {
  return toneAccentClassMap[tone];
}

export function resolveMarginBottomClass(spacing: ContentSpacing = "md") {
  return spacingMarginBottomClassMap[spacing];
}

export function resolveMarginYClass(spacing: ContentSpacing = "md") {
  return spacingMarginYClassMap[spacing];
}

export function resolveProseSizeClass(size: ProseSize = "base") {
  return proseSizeClassMap[size];
}

export function resolveClampLinesClass(lines: ClampLines = "none") {
  return clampLineClassMap[lines];
}

export function resolveImageObjectFitClass(fit: ImageObjectFit = "cover") {
  return objectFitClassMap[fit];
}

export function resolveImageAspectRatioClass(aspectRatio: ImageAspectRatio = "landscape") {
  return aspectRatioClassMap[aspectRatio];
}

export function resolveDividerThicknessClass(thickness: DividerThickness = "thin") {
  return dividerThicknessClassMap[thickness];
}

export function resolveSafeHref(
  rawHref: string,
):
  | { readonly state: "valid"; readonly href: string }
  | { readonly state: "missing" }
  | { readonly state: "unsafe" } {
  const href = rawHref.trim();

  if (!href) {
    return { state: "missing" };
  }

  if (
    safeHrefSchemePattern.test(href) ||
    safeRelativeUrlPattern.test(href) ||
    safeBareRelativeUrlPattern.test(href)
  ) {
    return {
      state: "valid",
      href,
    };
  }

  return { state: "unsafe" };
}

// Event payloads projected onto `url-string` outputs must be fully qualified
// URLs, while authors may configure relative hrefs. Resolves relative hrefs
// against the current document base so emitted payloads stay contract-valid.
export function toAbsoluteUrlString(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const base = typeof document !== "undefined" ? document.baseURI : undefined;
    return new URL(trimmed, base).toString();
  } catch {
    return null;
  }
}

export function resolveSafeImageSrc(rawSrc: string) {
  const src = rawSrc.trim();

  if (!src) {
    return { state: "missing" as const };
  }

  if (
    safeImageSchemePattern.test(src) ||
    safeRelativeUrlPattern.test(src) ||
    safeBareRelativeUrlPattern.test(src)
  ) {
    return {
      state: "valid" as const,
      src,
    };
  }

  return { state: "unsafe" as const };
}

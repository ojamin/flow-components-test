import createDOMPurify, { type Config } from "dompurify";

type DomPurifyWindow = Parameters<typeof createDOMPurify>[0];

export interface SanitizeHtmlOptions {
  readonly window?: DomPurifyWindow | null;
  readonly sanitizer?: HtmlSanitizer | null;
}

export interface SanitizedHtmlResult {
  /**
   * Sanitized HTML when `error` is null. When `error` is non-null this contains
   * an escaped fail-closed fallback; callers that render into HTML sinks should
   * check `error` before using this value.
   */
  readonly html: string;
  readonly wasSanitized: boolean;
  readonly usedFallback: boolean;
  readonly error: string | null;
}

export type HtmlSanitizer = (html: string, config: Config) => string;

const htmlEscapeMap: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const safeHtmlSanitizerConfig: Config = {
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: [
    "embed",
    "foreignObject",
    "form",
    "head",
    "html",
    "iframe",
    "math",
    "object",
    "script",
    "style",
    "svg",
  ],
  USE_PROFILES: {
    html: true,
  },
};

function getDefaultWindow(): DomPurifyWindow | null {
  const globalScope = globalThis as { readonly window?: DomPurifyWindow };

  return globalScope.window ?? null;
}

function createDefaultSanitizer(windowRef: DomPurifyWindow | null): HtmlSanitizer | null {
  if (!windowRef) {
    return null;
  }

  try {
    const purifier = createDOMPurify(windowRef);

    return (html, config) => purifier.sanitize(html, config) as string;
  } catch {
    return null;
  }
}

export function escapeHtml(html: string): string {
  return html.replace(/[&<>"']/g, (character) => htmlEscapeMap[character] ?? character);
}

export function sanitizeHtmlToResult(
  html: string,
  options: SanitizeHtmlOptions = {},
): SanitizedHtmlResult {
  const windowRef = options.window === undefined ? getDefaultWindow() : options.window;
  const sanitizer = options.sanitizer ?? createDefaultSanitizer(windowRef);

  if (!sanitizer) {
    const escapedHtml = escapeHtml(html);

    return {
      error: null,
      html: escapedHtml,
      usedFallback: true,
      wasSanitized: escapedHtml !== html,
    };
  }

  try {
    const sanitizedHtml = sanitizer(html, safeHtmlSanitizerConfig);

    return {
      error: null,
      html: sanitizedHtml,
      usedFallback: false,
      wasSanitized: sanitizedHtml !== html,
    };
  } catch {
    const escapedHtml = escapeHtml(html);

    return {
      error: "HTML sanitizer failed.",
      html: escapedHtml,
      usedFallback: true,
      wasSanitized: true,
    };
  }
}

export function sanitizeHtml(html: string, options: SanitizeHtmlOptions = {}): string {
  return sanitizeHtmlToResult(html, options).html;
}

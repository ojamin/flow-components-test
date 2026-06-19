import { marked } from "marked";

import { sanitizeHtmlToResult } from "@flow-builder/components/sdk/sanitization";

export interface SanitizedMarkdownResult {
  html: string;
  wasSanitized: boolean;
  error: string | null;
}

/**
 * Markdown preview must stay expressive for authors while guaranteeing that the
 * final injected HTML is sanitized before it ever reaches Builder or Preview.
 * Sanitization (browser DOMPurify or no-browser escape fallback) routes through
 * the shared SDK helper so any sanitizer failure fails closed instead of leaking
 * unsanitized markup.
 */
export function renderSanitizedMarkdown(rawSource: string): SanitizedMarkdownResult {
  const source = rawSource.trim();

  if (!source) {
    return {
      html: "",
      wasSanitized: false,
      error: null,
    };
  }

  try {
    const renderedHtml = marked.parse(source, {
      async: false,
      breaks: true,
      gfm: true,
    }) as string;
    const sanitized = sanitizeHtmlToResult(renderedHtml);

    if (sanitized.error) {
      return {
        html: "",
        wasSanitized: false,
        error: sanitized.error,
      };
    }

    return {
      html: sanitized.html,
      wasSanitized: sanitized.wasSanitized,
      error: null,
    };
  } catch (error) {
    return {
      html: "",
      wasSanitized: false,
      error: error instanceof Error ? error.message : "Markdown preview failed to render.",
    };
  }
}

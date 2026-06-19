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
export declare function renderSanitizedMarkdown(rawSource: string): SanitizedMarkdownResult;

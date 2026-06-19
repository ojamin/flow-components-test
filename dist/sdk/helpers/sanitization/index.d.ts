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
export declare function escapeHtml(html: string): string;
export declare function sanitizeHtmlToResult(html: string, options?: SanitizeHtmlOptions): SanitizedHtmlResult;
export declare function sanitizeHtml(html: string, options?: SanitizeHtmlOptions): string;
export {};

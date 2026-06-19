export interface BrowserEnvironment {
    readonly window?: BrowserWindowLike | null;
    readonly document?: BrowserDocumentLike | null;
    readonly navigator?: BrowserNavigatorLike | null;
}
export interface BrowserWindowLike {
    readonly devicePixelRatio?: number;
    readonly isSecureContext?: boolean;
    readonly matchMedia?: (query: string) => MediaQueryList;
    readonly open?: (url: string, target?: string) => void | Window | null;
    readonly scrollY?: number;
    readonly pageYOffset?: number;
    readonly addEventListener?: Window["addEventListener"];
    readonly removeEventListener?: Window["removeEventListener"];
    readonly requestAnimationFrame?: (callback: FrameRequestCallback) => number;
    readonly cancelAnimationFrame?: (handle: number) => void;
    readonly setTimeout?: (callback: () => void, delay?: number) => BrowserTimeoutHandle;
    readonly clearTimeout?: (handle: BrowserTimeoutHandle) => void;
}
export interface BrowserDocumentLike {
    readonly createElement?: (tagName: "a" | "canvas") => HTMLAnchorElement | HTMLCanvasElement | null;
    readonly getElementById?: (elementId: string) => BrowserFocusableElement | null;
    readonly body?: BrowserDocumentBodyLike | null;
}
export interface BrowserDocumentBodyLike {
    readonly appendChild?: (node: Node) => void;
    readonly removeChild?: (node: Node) => void;
}
export interface BrowserFocusableElement {
    focus?: (options?: FocusOptions) => void;
}
export interface BrowserNavigatorLike {
    readonly clipboard?: BrowserClipboardLike | null;
}
export interface BrowserClipboardLike {
    readonly writeText?: (text: string) => Promise<void> | void;
}
export interface CreateCanvasOptions {
    readonly width?: number;
    readonly height?: number;
}
export type BrowserAnimationFrameHandle = number;
export type BrowserTimeoutHandle = number;
export type BrowserFetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Pick<Response, "ok" | "status">>;
export type ClipboardWriteUnavailableReason = "insecure-context" | "unsupported";
export type ClipboardWriteAvailability = {
    readonly available: true;
} | {
    readonly available: false;
    readonly reason: ClipboardWriteUnavailableReason;
    readonly message: string;
};
export type ClipboardWriteResult = {
    readonly ok: true;
} | {
    readonly ok: false;
    readonly reason: "unavailable";
    readonly unavailableReason: ClipboardWriteUnavailableReason;
    readonly message: string;
} | {
    readonly ok: false;
    readonly reason: "error";
    readonly message: string;
};
export declare function isBrowser(environment?: BrowserEnvironment): boolean;
export declare function createCanvas(options?: CreateCanvasOptions, environment?: BrowserEnvironment): HTMLCanvasElement | null;
export declare function postBrowserJson(url: string, payload: unknown, options?: Pick<RequestInit, "method">, fetchImpl?: BrowserFetchLike | null): Promise<Pick<Response, "ok" | "status">>;
export declare function openBrowserUrl(url: string, target?: string, environment?: BrowserEnvironment): boolean;
export declare function downloadJsonFile(filename: string, payload: unknown, environment?: BrowserEnvironment): boolean;
export declare function focusElementById(elementId: string, environment?: BrowserEnvironment): boolean;
export declare function matchMedia(query: string, environment?: BrowserEnvironment): MediaQueryList | null;
export declare function getDevicePixelRatio(environment?: BrowserEnvironment): number;
export declare function getViewportScrollY(environment?: BrowserEnvironment): number;
export declare function addBrowserWindowEventListener(type: keyof WindowEventMap, listener: EventListener, options?: AddEventListenerOptions | boolean, environment?: BrowserEnvironment): boolean;
export declare function removeBrowserWindowEventListener(type: keyof WindowEventMap, listener: EventListener, options?: EventListenerOptions | boolean, environment?: BrowserEnvironment): void;
export declare function requestAnimationFrame(callback: FrameRequestCallback, environment?: BrowserEnvironment): BrowserAnimationFrameHandle | null;
export declare function cancelAnimationFrame(handle: BrowserAnimationFrameHandle | null | undefined, environment?: BrowserEnvironment): void;
export declare function setBrowserTimeout(callback: () => void, delay?: number, environment?: BrowserEnvironment): BrowserTimeoutHandle | null;
export declare function clearBrowserTimeout(handle: BrowserTimeoutHandle | null | undefined, environment?: BrowserEnvironment): void;
export declare function resetBrowserTimeout(currentHandle: BrowserTimeoutHandle | null | undefined, callback: () => void, delay?: number, environment?: BrowserEnvironment): BrowserTimeoutHandle | null;
export declare function cleanupBrowserTimeout(handle: BrowserTimeoutHandle | null | undefined, environment?: BrowserEnvironment): null;
export declare function getClipboardWriteAvailability(environment?: BrowserEnvironment): ClipboardWriteAvailability;
export declare function isClipboardWriteAvailable(environment?: BrowserEnvironment): boolean;
export declare function writeClipboardText(text: string, environment?: BrowserEnvironment): Promise<ClipboardWriteResult>;

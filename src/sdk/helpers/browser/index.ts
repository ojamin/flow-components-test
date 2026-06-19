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
  readonly createElement?: (
    tagName: "a" | "canvas",
  ) => HTMLAnchorElement | HTMLCanvasElement | null;
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
export type BrowserFetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Pick<Response, "ok" | "status">>;

export type ClipboardWriteUnavailableReason = "insecure-context" | "unsupported";

export type ClipboardWriteAvailability =
  | { readonly available: true }
  | {
      readonly available: false;
      readonly reason: ClipboardWriteUnavailableReason;
      readonly message: string;
    };

export type ClipboardWriteResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "unavailable";
      readonly unavailableReason: ClipboardWriteUnavailableReason;
      readonly message: string;
    }
  | {
      readonly ok: false;
      readonly reason: "error";
      readonly message: string;
    };

function getDefaultEnvironment(): BrowserEnvironment {
  const globalScope = globalThis as {
    readonly open?: BrowserWindowLike["open"];
    readonly window?: BrowserWindowLike;
    readonly document?: BrowserDocumentLike;
    readonly navigator?: BrowserNavigatorLike;
  };

  return {
    document: globalScope.document ?? null,
    navigator: globalScope.navigator ?? null,
    window: globalScope.window ?? (globalScope.open ? globalScope : null),
  };
}

function getDefaultFetch(): BrowserFetchLike | null {
  const globalScope = globalThis as { readonly fetch?: BrowserFetchLike };

  return typeof globalScope.fetch === "function" ? globalScope.fetch.bind(globalScope) : null;
}

function resolveEnvironment(environment?: BrowserEnvironment): BrowserEnvironment {
  return environment ?? getDefaultEnvironment();
}

export function isBrowser(environment?: BrowserEnvironment): boolean {
  const env = resolveEnvironment(environment);

  return Boolean(env.window && env.document);
}

export function createCanvas(
  options: CreateCanvasOptions = {},
  environment?: BrowserEnvironment,
): HTMLCanvasElement | null {
  const env = resolveEnvironment(environment);
  let canvas: HTMLAnchorElement | HTMLCanvasElement | null = null;

  try {
    canvas = env.document?.createElement?.("canvas") ?? null;
  } catch {
    return null;
  }

  if (!canvas || !("width" in canvas) || !("height" in canvas)) {
    return null;
  }

  if (options.width !== undefined) {
    canvas.width = options.width;
  }

  if (options.height !== undefined) {
    canvas.height = options.height;
  }

  return canvas;
}

export async function postBrowserJson(
  url: string,
  payload: unknown,
  options: Pick<RequestInit, "method"> = {},
  fetchImpl: BrowserFetchLike | null = getDefaultFetch(),
): Promise<Pick<Response, "ok" | "status">> {
  if (!fetchImpl) {
    throw new Error("Fetch API is unavailable in this environment.");
  }

  return fetchImpl(url, {
    method: options.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function openBrowserUrl(
  url: string,
  target = "_blank",
  environment?: BrowserEnvironment,
): boolean {
  const env = resolveEnvironment(environment);

  if (typeof env.window?.open !== "function") {
    return false;
  }

  env.window.open(url, target);
  return true;
}

export function downloadJsonFile(
  filename: string,
  payload: unknown,
  environment?: BrowserEnvironment,
): boolean {
  const env = resolveEnvironment(environment);
  const link = env.document?.createElement?.("a") as HTMLAnchorElement | null | undefined;

  if (!link || typeof link.click !== "function" || !env.document?.body) {
    return false;
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  try {
    link.href = url;
    link.download = filename.endsWith(".json") ? filename : `${filename}.json`;
    env.document.body.appendChild?.(link);
    link.click();
    env.document.body.removeChild?.(link);
    return true;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function focusElementById(elementId: string, environment?: BrowserEnvironment): boolean {
  const env = resolveEnvironment(environment);
  let element: BrowserFocusableElement | null = null;

  try {
    element = env.document?.getElementById?.(elementId) ?? null;
  } catch {
    return false;
  }

  if (!element || typeof element.focus !== "function") {
    return false;
  }

  try {
    element.focus();
  } catch {
    return false;
  }

  return true;
}

export function matchMedia(query: string, environment?: BrowserEnvironment): MediaQueryList | null {
  const env = resolveEnvironment(environment);

  return env.window?.matchMedia?.(query) ?? null;
}

export function getDevicePixelRatio(environment?: BrowserEnvironment): number {
  const env = resolveEnvironment(environment);
  const ratio = env.window?.devicePixelRatio;

  return typeof ratio === "number" && Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
}

export function getViewportScrollY(environment?: BrowserEnvironment): number {
  const env = resolveEnvironment(environment);
  const scrollY = env.window?.scrollY ?? env.window?.pageYOffset ?? 0;

  return typeof scrollY === "number" && Number.isFinite(scrollY) ? Math.max(0, scrollY) : 0;
}

export function addBrowserWindowEventListener(
  type: keyof WindowEventMap,
  listener: EventListener,
  options?: AddEventListenerOptions | boolean,
  environment?: BrowserEnvironment,
): boolean {
  const env = resolveEnvironment(environment);
  if (typeof env.window?.addEventListener !== "function") return false;

  env.window.addEventListener(type, listener, options);
  return true;
}

export function removeBrowserWindowEventListener(
  type: keyof WindowEventMap,
  listener: EventListener,
  options?: EventListenerOptions | boolean,
  environment?: BrowserEnvironment,
): void {
  const env = resolveEnvironment(environment);
  env.window?.removeEventListener?.(type, listener, options);
}

export function requestAnimationFrame(
  callback: FrameRequestCallback,
  environment?: BrowserEnvironment,
): BrowserAnimationFrameHandle | null {
  const env = resolveEnvironment(environment);

  return env.window?.requestAnimationFrame?.(callback) ?? null;
}

export function cancelAnimationFrame(
  handle: BrowserAnimationFrameHandle | null | undefined,
  environment?: BrowserEnvironment,
): void {
  if (handle == null) {
    return;
  }

  const env = resolveEnvironment(environment);
  env.window?.cancelAnimationFrame?.(handle);
}

export function setBrowserTimeout(
  callback: () => void,
  delay?: number,
  environment?: BrowserEnvironment,
): BrowserTimeoutHandle | null {
  const env = resolveEnvironment(environment);

  return env.window?.setTimeout?.(callback, delay) ?? null;
}

export function clearBrowserTimeout(
  handle: BrowserTimeoutHandle | null | undefined,
  environment?: BrowserEnvironment,
): void {
  if (handle == null) {
    return;
  }

  const env = resolveEnvironment(environment);
  env.window?.clearTimeout?.(handle);
}

export function resetBrowserTimeout(
  currentHandle: BrowserTimeoutHandle | null | undefined,
  callback: () => void,
  delay?: number,
  environment?: BrowserEnvironment,
): BrowserTimeoutHandle | null {
  clearBrowserTimeout(currentHandle, environment);

  return setBrowserTimeout(callback, delay, environment);
}

export function cleanupBrowserTimeout(
  handle: BrowserTimeoutHandle | null | undefined,
  environment?: BrowserEnvironment,
): null {
  clearBrowserTimeout(handle, environment);

  return null;
}

export function getClipboardWriteAvailability(
  environment?: BrowserEnvironment,
): ClipboardWriteAvailability {
  const env = resolveEnvironment(environment);

  if (env.window?.isSecureContext !== true) {
    return {
      available: false,
      message: "Clipboard writes require a secure browser context.",
      reason: "insecure-context",
    };
  }

  if (typeof env.navigator?.clipboard?.writeText !== "function") {
    return {
      available: false,
      message: "Clipboard writes are not available in this browser.",
      reason: "unsupported",
    };
  }

  return { available: true };
}

export function isClipboardWriteAvailable(environment?: BrowserEnvironment): boolean {
  return getClipboardWriteAvailability(environment).available;
}

export async function writeClipboardText(
  text: string,
  environment?: BrowserEnvironment,
): Promise<ClipboardWriteResult> {
  const availability = getClipboardWriteAvailability(environment);

  if (!availability.available) {
    return {
      ok: false,
      message: availability.message,
      reason: "unavailable",
      unavailableReason: availability.reason,
    };
  }

  const env = resolveEnvironment(environment);

  try {
    await env.navigator?.clipboard?.writeText?.(text);
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Clipboard write failed.",
      reason: "error",
    };
  }
}

import { createCanvas, type BrowserEnvironment } from "../browser";

export type WebGLContextName = "webgl2" | "webgl" | "experimental-webgl";

export type WebGLDetectionResult =
  | { readonly supported: true; readonly contextName: WebGLContextName }
  | { readonly supported: false; readonly reason: string };

export interface WebGLCanvasLike {
  readonly getContext?: unknown;
}

export interface WebGLDetectionOptions {
  readonly canvas?: WebGLCanvasLike | null;
  readonly createCanvas?: () => WebGLCanvasLike | null | undefined;
  readonly contextNames?: readonly WebGLContextName[];
}

const defaultContextNames: readonly WebGLContextName[] = ["webgl2", "webgl", "experimental-webgl"];

export function detectWebGLSupport(options: WebGLDetectionOptions = {}): WebGLDetectionResult {
  const canvas = resolveCanvas(options);

  if (!canvas) {
    return { supported: false, reason: "Canvas is unavailable in this environment." };
  }

  if (typeof canvas.getContext !== "function") {
    return { supported: false, reason: "Canvas does not expose a WebGL context API." };
  }

  let contextCreationThrew = false;

  for (const contextName of options.contextNames ?? defaultContextNames) {
    const context = tryGetContext(canvas as WebGLContextCanvas, contextName);

    if (context.threw) {
      contextCreationThrew = true;
    }

    if (context.value) {
      return { supported: true, contextName };
    }
  }

  if (contextCreationThrew) {
    return {
      supported: false,
      reason: "WebGL context creation threw before a context could be created.",
    };
  }

  return { supported: false, reason: "WebGL context creation failed or is disabled." };
}

export function detectBrowserWebGLSupport(environment?: BrowserEnvironment): WebGLDetectionResult {
  return detectWebGLSupport({ createCanvas: () => createCanvas({}, environment) });
}

type WebGLContextCanvas = Pick<HTMLCanvasElement, "getContext">;

function resolveCanvas(options: WebGLDetectionOptions): WebGLCanvasLike | null | undefined {
  if (options.canvas) {
    return options.canvas;
  }

  try {
    return options.createCanvas?.();
  } catch {
    return null;
  }
}

function tryGetContext(
  canvas: WebGLContextCanvas,
  contextName: WebGLContextName,
): { readonly value: RenderingContext | null; readonly threw: boolean } {
  try {
    return {
      value: canvas.getContext(contextName, { antialias: true, alpha: true }),
      threw: false,
    };
  } catch {
    return { value: null, threw: true };
  }
}

import { describe, expect, it, vi } from "vitest";

import {
  detectBrowserWebGLSupport,
  detectWebGLSupport,
} from "@flow-builder/components/sdk/capabilities";
import type { BrowserEnvironment } from "@flow-builder/components/sdk/browser";

describe("SDK capability helpers", () => {
  it("reports unsupported when no canvas can be created", () => {
    expect(detectWebGLSupport()).toEqual({
      supported: false,
      reason: "Canvas is unavailable in this environment.",
    });
    expect(detectWebGLSupport({ createCanvas: () => null })).toEqual({
      supported: false,
      reason: "Canvas is unavailable in this environment.",
    });
  });

  it("reports unsupported when canvas lacks getContext", () => {
    expect(detectWebGLSupport({ canvas: {} })).toEqual({
      supported: false,
      reason: "Canvas does not expose a WebGL context API.",
    });
  });

  it("reports the first context name that creates a WebGL context", () => {
    const context = {} as RenderingContext;
    const canvas = {
      getContext: vi.fn((name: string) => (name === "webgl" ? context : null)),
    };

    expect(detectWebGLSupport({ canvas })).toEqual({ supported: true, contextName: "webgl" });
    expect(canvas.getContext).toHaveBeenCalledWith("webgl2", { antialias: true, alpha: true });
    expect(canvas.getContext).toHaveBeenCalledWith("webgl", { antialias: true, alpha: true });
    expect(canvas.getContext).not.toHaveBeenCalledWith("experimental-webgl", {
      antialias: true,
      alpha: true,
    });
  });

  it("reports unsupported when every context creation attempt fails", () => {
    const canvas = { getContext: vi.fn(() => null) };

    expect(detectWebGLSupport({ canvas })).toEqual({
      supported: false,
      reason: "WebGL context creation failed or is disabled.",
    });
    expect(canvas.getContext).toHaveBeenCalledTimes(3);
  });

  it("reports unsupported instead of throwing when getContext throws", () => {
    const canvas = { getContext: vi.fn(() => new DOMException("blocked")) };
    canvas.getContext.mockImplementation(() => {
      throw new Error("blocked by browser policy");
    });

    expect(() => detectWebGLSupport({ canvas })).not.toThrow();
    expect(detectWebGLSupport({ canvas })).toEqual({
      supported: false,
      reason: "WebGL context creation threw before a context could be created.",
    });
  });

  it("uses the SDK browser environment for browser WebGL detection", () => {
    const context = {} as RenderingContext;
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
    } as unknown as HTMLCanvasElement;
    const createElement = vi.fn(() => canvas);
    const env: BrowserEnvironment = { document: { createElement } };

    expect(detectBrowserWebGLSupport(env)).toEqual({ supported: true, contextName: "webgl2" });
    expect(createElement).toHaveBeenCalledWith("canvas");
  });

  it("reports unavailable canvas when browser canvas creation is blocked", () => {
    const env: BrowserEnvironment = {
      document: {
        createElement: vi.fn(() => {
          throw new Error("blocked canvas creation");
        }),
      },
    };

    expect(detectBrowserWebGLSupport(env)).toEqual({
      supported: false,
      reason: "Canvas is unavailable in this environment.",
    });
  });
});

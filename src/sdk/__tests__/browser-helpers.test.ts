import { describe, expect, it, vi } from "vitest";

import {
  addBrowserWindowEventListener,
  cancelAnimationFrame,
  clearBrowserTimeout,
  cleanupBrowserTimeout,
  createCanvas,
  focusElementById,
  getClipboardWriteAvailability,
  getDevicePixelRatio,
  getViewportScrollY,
  isBrowser,
  isClipboardWriteAvailable,
  matchMedia,
  removeBrowserWindowEventListener,
  requestAnimationFrame,
  resetBrowserTimeout,
  setBrowserTimeout,
  type BrowserEnvironment,
  writeClipboardText,
} from "@flow-builder/components/sdk/browser";

describe("SDK browser helpers", () => {
  it("returns safe no-browser defaults without throwing", () => {
    const env: BrowserEnvironment = {};
    const throwingDocumentEnv: BrowserEnvironment = {
      document: {
        createElement: () => {
          throw new Error("canvas blocked");
        },
      },
    };

    expect(isBrowser(env)).toBe(false);
    expect(createCanvas(undefined, env)).toBeNull();
    expect(createCanvas(undefined, throwingDocumentEnv)).toBeNull();
    expect(matchMedia("(prefers-reduced-motion: reduce)", env)).toBeNull();
    expect(getDevicePixelRatio(env)).toBe(1);
    expect(getViewportScrollY(env)).toBe(0);
    expect(requestAnimationFrame(() => undefined, env)).toBeNull();
    expect(setBrowserTimeout(() => undefined, 10, env)).toBeNull();
    expect(addBrowserWindowEventListener("scroll", () => undefined, undefined, env)).toBe(false);

    expect(() => cancelAnimationFrame(1, env)).not.toThrow();
    expect(() => clearBrowserTimeout(1, env)).not.toThrow();
    expect(() =>
      removeBrowserWindowEventListener("scroll", () => undefined, undefined, env),
    ).not.toThrow();
  });

  it("uses injected browser-like capabilities instead of ambient globals", () => {
    const canvas = { width: 0, height: 0 } as HTMLCanvasElement;
    const media = { matches: true, media: "(min-width: 1px)" } as MediaQueryList;
    const createElement = vi.fn((tagName: string) => (tagName === "canvas" ? canvas : null));
    const matchMediaMock = vi.fn(() => media);
    const requestFrame = vi.fn(() => 42);
    const cancelFrame = vi.fn();
    const setTimeoutMock = vi.fn(() => 7);
    const clearTimeoutMock = vi.fn();
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const onScroll = () => undefined;
    const env: BrowserEnvironment = {
      document: { createElement },
      window: {
        addEventListener,
        cancelAnimationFrame: cancelFrame,
        clearTimeout: clearTimeoutMock,
        devicePixelRatio: 2.5,
        matchMedia: matchMediaMock,
        pageYOffset: 13,
        removeEventListener,
        requestAnimationFrame: requestFrame,
        scrollY: 24,
        setTimeout: setTimeoutMock,
      },
    };
    const onFrame = () => undefined;
    const onTimeout = () => undefined;

    expect(isBrowser(env)).toBe(true);
    expect(createCanvas({ width: 320, height: 160 }, env)).toBe(canvas);
    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(160);
    expect(createElement).toHaveBeenCalledWith("canvas");
    expect(matchMedia("(min-width: 1px)", env)).toBe(media);
    expect(matchMediaMock).toHaveBeenCalledWith("(min-width: 1px)");
    expect(getDevicePixelRatio(env)).toBe(2.5);
    expect(getViewportScrollY(env)).toBe(24);
    expect(requestAnimationFrame(onFrame, env)).toBe(42);
    expect(requestFrame).toHaveBeenCalledWith(onFrame);
    expect(setBrowserTimeout(onTimeout, 100, env)).toBe(7);
    expect(setTimeoutMock).toHaveBeenCalledWith(onTimeout, 100);
    expect(addBrowserWindowEventListener("scroll", onScroll, { passive: true }, env)).toBe(true);

    cancelAnimationFrame(42, env);
    clearBrowserTimeout(7, env);
    removeBrowserWindowEventListener("scroll", onScroll, { capture: false }, env);

    expect(cancelFrame).toHaveBeenCalledWith(42);
    expect(clearTimeoutMock).toHaveBeenCalledWith(7);
    expect(addEventListener).toHaveBeenCalledWith("scroll", onScroll, { passive: true });
    expect(removeEventListener).toHaveBeenCalledWith("scroll", onScroll, { capture: false });
  });

  it("reports clipboard writes as unavailable when the browser API is missing", async () => {
    const env: BrowserEnvironment = {
      navigator: {},
      window: { isSecureContext: true },
    };

    expect(isClipboardWriteAvailable(env)).toBe(false);
    expect(getClipboardWriteAvailability(env)).toEqual({
      available: false,
      message: "Clipboard writes are not available in this browser.",
      reason: "unsupported",
    });
    await expect(writeClipboardText("secret payload", env)).resolves.toEqual({
      ok: false,
      message: "Clipboard writes are not available in this browser.",
      reason: "unavailable",
      unavailableReason: "unsupported",
    });
  });

  it("writes clipboard text through an injected secure browser capability", async () => {
    const writeText = vi.fn((_text: string) => Promise.resolve());
    const env: BrowserEnvironment = {
      navigator: { clipboard: { writeText } },
      window: { isSecureContext: true },
    };

    expect(isClipboardWriteAvailable(env)).toBe(true);
    await expect(writeClipboardText("copied value", env)).resolves.toEqual({ ok: true });
    expect(writeText).toHaveBeenCalledWith("copied value");
  });

  it("returns safe clipboard errors without copied content or DOM exception leakage", async () => {
    const copiedText = "do-not-leak-this-token";
    const writeText = vi.fn((_text: string) =>
      Promise.reject(new DOMException(`Denied copying ${copiedText}`, "NotAllowedError")),
    );
    const env: BrowserEnvironment = {
      navigator: { clipboard: { writeText } },
      window: { isSecureContext: true },
    };

    const result = await writeClipboardText(copiedText, env);

    expect(result).toEqual({
      ok: false,
      message: "Clipboard write failed.",
      reason: "error",
    });
    expect(JSON.stringify(result)).not.toContain(copiedText);
    expect(JSON.stringify(result)).not.toContain("NotAllowedError");
  });

  it("treats insecure contexts as a distinct clipboard unavailable reason", async () => {
    const writeText = vi.fn((_text: string) => Promise.resolve());
    const env: BrowserEnvironment = {
      navigator: { clipboard: { writeText } },
      window: { isSecureContext: false },
    };

    expect(getClipboardWriteAvailability(env)).toEqual({
      available: false,
      message: "Clipboard writes require a secure browser context.",
      reason: "insecure-context",
    });
    await expect(writeClipboardText("secret payload", env)).resolves.toMatchObject({
      ok: false,
      reason: "unavailable",
      unavailableReason: "insecure-context",
    });
    expect(writeText).not.toHaveBeenCalled();
  });

  it("resets browser timeout handles by clearing the old timer and scheduling a replacement", () => {
    const callback = vi.fn();
    const setTimeoutMock = vi.fn(() => 12);
    const clearTimeoutMock = vi.fn();
    const env: BrowserEnvironment = {
      window: {
        clearTimeout: clearTimeoutMock,
        setTimeout: setTimeoutMock,
      },
    };

    const nextHandle = resetBrowserTimeout(7, callback, 2_000, env);

    expect(nextHandle).toBe(12);
    expect(clearTimeoutMock).toHaveBeenCalledWith(7);
    expect(setTimeoutMock).toHaveBeenCalledWith(callback, 2_000);
  });

  it("focuses an element through the injected document and reports availability", () => {
    const focus = vi.fn();
    const getElementById = vi.fn(() => ({ focus }));
    const env: BrowserEnvironment = {
      document: { getElementById },
    };

    expect(focusElementById("manual-input", env)).toBe(true);
    expect(getElementById).toHaveBeenCalledWith("manual-input");
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it("returns false from focusElementById when no document, element, or focus is available", () => {
    expect(focusElementById("missing", {})).toBe(false);
    expect(focusElementById("missing", { document: { getElementById: () => null } })).toBe(false);
    expect(
      focusElementById("missing", {
        document: { getElementById: () => ({}) },
      }),
    ).toBe(false);

    const throwingFocus = vi.fn(() => {
      throw new Error("focus blocked");
    });
    const throwingLookup = vi.fn(() => {
      throw new Error("dom blocked");
    });

    expect(
      focusElementById("manual", {
        document: { getElementById: () => ({ focus: throwingFocus }) },
      }),
    ).toBe(false);
    expect(throwingFocus).toHaveBeenCalledTimes(1);

    expect(focusElementById("manual", { document: { getElementById: throwingLookup } })).toBe(
      false,
    );
    expect(throwingLookup).toHaveBeenCalledWith("manual");
  });

  it("cleans up browser timeout handles with null-returning no-op behavior", () => {
    const clearTimeoutMock = vi.fn();
    const env: BrowserEnvironment = {
      window: { clearTimeout: clearTimeoutMock },
    };

    expect(cleanupBrowserTimeout(null, env)).toBeNull();
    expect(cleanupBrowserTimeout(undefined, env)).toBeNull();
    expect(clearTimeoutMock).not.toHaveBeenCalled();

    expect(cleanupBrowserTimeout(9, env)).toBeNull();
    expect(clearTimeoutMock).toHaveBeenCalledWith(9);
  });
});

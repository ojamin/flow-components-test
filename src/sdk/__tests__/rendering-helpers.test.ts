import { describe, expect, it, vi } from "vitest";

import type { BrowserEnvironment } from "@flow-builder/components/sdk/browser";
import {
  createDisposalScope,
  createFrameLoop,
  resolveReducedMotionState,
} from "@flow-builder/components/sdk/rendering";

describe("SDK rendering helpers", () => {
  it("resolves reduced-motion state from explicit and browser-backed inputs", () => {
    const reduceEnv: BrowserEnvironment = {
      window: {
        matchMedia: vi.fn(() => ({ matches: true }) as MediaQueryList),
      },
    };
    const motionEnv: BrowserEnvironment = {
      window: {
        matchMedia: vi.fn(() => ({ matches: false }) as MediaQueryList),
      },
    };

    expect(resolveReducedMotionState({ environment: reduceEnv })).toEqual({
      autoAnimationEnabled: false,
      prefersReducedMotion: true,
    });
    expect(resolveReducedMotionState({ environment: motionEnv })).toEqual({
      autoAnimationEnabled: true,
      prefersReducedMotion: false,
    });
    expect(
      resolveReducedMotionState({ autoAnimation: false, prefersReducedMotion: false }),
    ).toEqual({
      autoAnimationEnabled: false,
      prefersReducedMotion: false,
    });
    expect(resolveReducedMotionState({ theme: { motion: { durationMs: 0 } } })).toEqual({
      autoAnimationEnabled: false,
      prefersReducedMotion: false,
    });
  });

  it("starts and stops frame loops idempotently", () => {
    const callbacks = new Map<number, FrameRequestCallback>();
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      const handle = callbacks.size + 1;
      callbacks.set(handle, callback);
      return handle;
    });
    const cancelAnimationFrame = vi.fn((handle: number) => {
      callbacks.delete(handle);
    });
    const env: BrowserEnvironment = {
      window: { cancelAnimationFrame, requestAnimationFrame },
    };
    const onFrame = vi.fn();
    const loop = createFrameLoop(onFrame, { environment: env });

    expect(loop.start()).toBe(true);
    expect(loop.start()).toBe(true);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    callbacks.get(1)?.(10);

    expect(onFrame).toHaveBeenCalledWith(10);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);

    loop.stop();
    loop.stop();

    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
    expect(loop.isRunning()).toBe(false);
  });

  it("keeps frame-loop start safe when RAF is unavailable", () => {
    const onFrame = vi.fn();
    const loop = createFrameLoop(onFrame, { environment: {} });

    expect(loop.start()).toBe(false);
    expect(loop.isRunning()).toBe(false);
    expect(() => loop.stop()).not.toThrow();
    expect(onFrame).not.toHaveBeenCalled();
  });

  it("stops frame loops after callback errors so they can restart", () => {
    const callbacks = new Map<number, FrameRequestCallback>();
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      const handle = callbacks.size + 1;
      callbacks.set(handle, callback);
      return handle;
    });
    const error = new Error("frame failed");
    const onError = vi.fn();
    const onFrame = vi.fn(() => {
      throw error;
    });
    const loop = createFrameLoop(onFrame, {
      environment: { window: { requestAnimationFrame } },
      onError,
    });

    expect(loop.start()).toBe(true);
    callbacks.get(1)?.(10);

    expect(onError).toHaveBeenCalledWith(error);
    expect(loop.isRunning()).toBe(false);
    expect(loop.start()).toBe(true);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it("disposes cleanup callbacks once and continues after errors", () => {
    const error = new Error("cleanup failed");
    const onError = vi.fn();
    const first = vi.fn();
    const throwing = vi.fn(() => {
      throw error;
    });
    const last = vi.fn();
    const scope = createDisposalScope({ onError });

    scope.add(first);
    scope.add(throwing);
    scope.add(last);

    const result = scope.dispose();
    const secondResult = scope.dispose();

    expect(result.disposed).toBe(true);
    expect(result.errors).toEqual([error]);
    expect(secondResult).toEqual({ disposed: false, errors: [] });
    expect(first).toHaveBeenCalledTimes(1);
    expect(throwing).toHaveBeenCalledTimes(1);
    expect(last).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error);
    expect(scope.isDisposed()).toBe(true);
  });

  it("immediately disposes callbacks added after scope disposal", () => {
    const error = new Error("late cleanup failed");
    const onError = vi.fn();
    const scope = createDisposalScope({ onError });
    const callback = vi.fn(() => {
      throw error;
    });

    scope.dispose();
    const remove = scope.add(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error);
    expect(remove()).toBe(false);
  });
});

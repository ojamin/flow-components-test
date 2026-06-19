import {
  cancelAnimationFrame,
  matchMedia as matchBrowserMedia,
  requestAnimationFrame,
  type BrowserAnimationFrameHandle,
  type BrowserEnvironment,
} from "../browser";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface ReducedMotionOptions {
  readonly autoAnimation?: boolean;
  readonly environment?: BrowserEnvironment;
  readonly matchMedia?: (query: string) => Pick<MediaQueryList, "matches"> | null | undefined;
  readonly motionDurationMs?: number;
  readonly prefersReducedMotion?: boolean;
  readonly theme?: {
    readonly motion?: {
      readonly durationMs?: number;
    };
  };
}

export interface ReducedMotionState {
  readonly autoAnimationEnabled: boolean;
  readonly prefersReducedMotion: boolean;
}

export function resolveReducedMotionState(options: ReducedMotionOptions = {}): ReducedMotionState {
  const prefersReducedMotion =
    options.prefersReducedMotion ??
    options.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ??
    matchBrowserMedia(REDUCED_MOTION_QUERY, options.environment)?.matches ??
    false;
  const motionDurationMs = options.motionDurationMs ?? options.theme?.motion?.durationMs;
  const motionDisabled = typeof motionDurationMs === "number" && motionDurationMs <= 0;

  return {
    autoAnimationEnabled:
      Boolean(options.autoAnimation ?? true) && !prefersReducedMotion && !motionDisabled,
    prefersReducedMotion,
  };
}

export type FrameLoopCallback = (timestamp: number) => void;

export interface FrameLoopOptions {
  readonly environment?: BrowserEnvironment;
  readonly onError?: (error: unknown) => void;
}

export interface FrameLoopHandle {
  readonly isRunning: () => boolean;
  readonly start: () => boolean;
  readonly stop: () => void;
}

export function createFrameLoop(
  callback: FrameLoopCallback,
  options: FrameLoopOptions = {},
): FrameLoopHandle {
  let running = false;
  let frameHandle: BrowserAnimationFrameHandle | null = null;

  const scheduleNextFrame = (): boolean => {
    const nextHandle = requestAnimationFrame(onFrame, options.environment);
    frameHandle = nextHandle;

    if (nextHandle == null) {
      running = false;
      return false;
    }

    return true;
  };

  const onFrame: FrameRequestCallback = (timestamp) => {
    frameHandle = null;

    if (!running) {
      return;
    }

    try {
      callback(timestamp);
    } catch (error) {
      running = false;
      options.onError?.(error);
      return;
    }

    if (running) {
      scheduleNextFrame();
    }
  };

  return {
    isRunning: () => running,
    start: () => {
      if (running) {
        return true;
      }

      running = true;
      return scheduleNextFrame();
    },
    stop: () => {
      if (!running && frameHandle == null) {
        return;
      }

      running = false;
      cancelAnimationFrame(frameHandle, options.environment);
      frameHandle = null;
    },
  };
}

export type DisposalCallback = () => void;

export interface DisposalResult {
  readonly disposed: boolean;
  readonly errors: readonly unknown[];
}

export interface DisposalScopeOptions {
  readonly onError?: (error: unknown) => void;
}

export interface DisposalScope {
  readonly add: (callback: DisposalCallback) => () => boolean;
  readonly dispose: () => DisposalResult;
  readonly isDisposed: () => boolean;
}

function collectDisposalError(
  error: unknown,
  errors: unknown[],
  onError: DisposalScopeOptions["onError"],
): void {
  errors.push(error);
  onError?.(error);
}

export function createDisposalScope(options: DisposalScopeOptions = {}): DisposalScope {
  const callbacks = new Set<DisposalCallback>();
  let disposed = false;

  return {
    add: (callback) => {
      if (disposed) {
        const errors: unknown[] = [];

        try {
          callback();
        } catch (error) {
          collectDisposalError(error, errors, options.onError);
        }

        return () => false;
      }

      callbacks.add(callback);

      return () => callbacks.delete(callback);
    },
    dispose: () => {
      if (disposed) {
        return { disposed: false, errors: [] };
      }

      disposed = true;
      const errors: unknown[] = [];

      for (const callback of callbacks) {
        try {
          callback();
        } catch (error) {
          collectDisposalError(error, errors, options.onError);
        }
      }

      callbacks.clear();

      return { disposed: true, errors };
    },
    isDisposed: () => disposed,
  };
}

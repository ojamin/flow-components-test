import { type BrowserEnvironment } from "../browser/index.js";
export declare const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
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
export declare function resolveReducedMotionState(options?: ReducedMotionOptions): ReducedMotionState;
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
export declare function createFrameLoop(callback: FrameLoopCallback, options?: FrameLoopOptions): FrameLoopHandle;
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
export declare function createDisposalScope(options?: DisposalScopeOptions): DisposalScope;

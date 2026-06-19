import { type BrowserEnvironment } from "../browser/index.js";
export type WebGLContextName = "webgl2" | "webgl" | "experimental-webgl";
export type WebGLDetectionResult = {
    readonly supported: true;
    readonly contextName: WebGLContextName;
} | {
    readonly supported: false;
    readonly reason: string;
};
export interface WebGLCanvasLike {
    readonly getContext?: unknown;
}
export interface WebGLDetectionOptions {
    readonly canvas?: WebGLCanvasLike | null;
    readonly createCanvas?: () => WebGLCanvasLike | null | undefined;
    readonly contextNames?: readonly WebGLContextName[];
}
export declare function detectWebGLSupport(options?: WebGLDetectionOptions): WebGLDetectionResult;
export declare function detectBrowserWebGLSupport(environment?: BrowserEnvironment): WebGLDetectionResult;

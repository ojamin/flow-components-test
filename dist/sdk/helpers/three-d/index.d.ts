import * as THREE from "three";
import { type ComponentThemeContext } from "../../theme.js";
import { type ComponentThemeColorRole } from "../../../themes/index.js";
export { detectBrowserWebGLSupport, detectWebGLSupport, type WebGLCanvasLike, type WebGLContextName, type WebGLDetectionOptions, type WebGLDetectionResult, } from "../capabilities/index.js";
export { REDUCED_MOTION_QUERY, createFrameLoop, resolveReducedMotionState, type FrameLoopCallback, type FrameLoopHandle, type FrameLoopOptions, type ReducedMotionOptions, type ReducedMotionState, } from "../rendering/index.js";
export * from "./orbit.js";
export * from "./picking.js";
export * from "./stale-async.js";
export interface VizThreeSceneOptions {
    theme?: unknown;
    width?: number;
    height?: number;
    fov?: number;
    cameraPosition?: readonly [number, number, number];
    cameraTarget?: readonly [number, number, number];
    clearAlpha?: number;
    createRenderer?: (options: THREE.WebGLRendererParameters) => VizThreeRenderer;
}
export interface VizThreeRenderer {
    domElement: HTMLCanvasElement;
    setPixelRatio: (ratio: number) => void;
    setSize: (width: number, height: number, updateStyle?: boolean) => void;
    setClearColor: (color: THREE.ColorRepresentation, alpha?: number) => void;
    render: (scene: THREE.Scene, camera: THREE.Camera) => void;
    dispose: () => void;
    forceContextLoss?: () => void;
}
export interface VizThreeSceneController {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: VizThreeRenderer;
    colors: VizThreeSceneColors;
    resize: (width?: number, height?: number) => void;
    render: () => void;
    dispose: () => void;
}
export interface VizThreeSceneColors {
    background: number;
    ground: number;
    grid: number;
    gridDim: number;
    ink: number;
    accent: number;
    accent2: number;
    accent3: number;
    accent4: number;
    accent5: number;
}
export declare const DEFAULT_VIZ_THREE_ACCENT_HEX: number;
export declare const DEFAULT_VIZ_THREE_FOREGROUND_HEX: number;
export declare const DEFAULT_VIZ_THREE_LIGHT_HEX = 16777215;
export declare function resolveVizThreeSceneColors(themeInput?: unknown): VizThreeSceneColors;
export declare function resolveVizThreeSize(container?: Pick<HTMLElement, "clientWidth" | "clientHeight">, width?: number, height?: number): {
    width: number;
    height: number;
};
export declare function createVizThreeScene(container: HTMLElement, options?: VizThreeSceneOptions): VizThreeSceneController;
export declare function disposeThreeObject(object: THREE.Object3D): void;
export declare function toThreeHexColor(color: unknown, fallback?: number): number;
export declare function resolveThemeColorForThreeHex(context: ComponentThemeContext | Record<string, unknown> | null | undefined, role: ComponentThemeColorRole): number;

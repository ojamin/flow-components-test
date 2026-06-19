import * as THREE from "three";

import { resolveThemeProperty, type ComponentThemeContext } from "../../theme";
import { getBuiltInComponentTheme, type ComponentThemeColorRole } from "../../../themes";

export {
  detectBrowserWebGLSupport,
  detectWebGLSupport,
  type WebGLCanvasLike,
  type WebGLContextName,
  type WebGLDetectionOptions,
  type WebGLDetectionResult,
} from "../capabilities";
export {
  REDUCED_MOTION_QUERY,
  createFrameLoop,
  resolveReducedMotionState,
  type FrameLoopCallback,
  type FrameLoopHandle,
  type FrameLoopOptions,
  type ReducedMotionOptions,
  type ReducedMotionState,
} from "../rendering";
export * from "./orbit";
export * from "./picking";
export * from "./stale-async";

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

const fallbackSize = { width: 640, height: 360 };
const defaultComponentTheme = getBuiltInComponentTheme("default");

export const DEFAULT_VIZ_THREE_ACCENT_HEX = resolveThemeColorForThreeHex(undefined, "chart1");
export const DEFAULT_VIZ_THREE_FOREGROUND_HEX = resolveThemeColorForThreeHex(
  undefined,
  "foreground",
);
export const DEFAULT_VIZ_THREE_LIGHT_HEX = 0xffffff;

export function resolveVizThreeSceneColors(themeInput?: unknown): VizThreeSceneColors {
  const context = toThemeContext(themeInput);
  return {
    background: resolveThemeColorForThreeHex(context, "pageBackground"),
    ground: resolveThemeColorForThreeHex(context, "surfaceMuted"),
    grid: resolveThemeColorForThreeHex(context, "border"),
    gridDim: resolveThemeColorForThreeHex(context, "surfaceMuted"),
    ink: resolveThemeColorForThreeHex(context, "foreground"),
    accent: resolveThemeColorForThreeHex(context, "chart1"),
    accent2: resolveThemeColorForThreeHex(context, "chart2"),
    accent3: resolveThemeColorForThreeHex(context, "chart3"),
    accent4: resolveThemeColorForThreeHex(context, "chart4"),
    accent5: resolveThemeColorForThreeHex(context, "chart5"),
  };
}

export function resolveVizThreeSize(
  container?: Pick<HTMLElement, "clientWidth" | "clientHeight">,
  width?: number,
  height?: number,
): { width: number; height: number } {
  const resolvedWidth =
    finitePositive(width) ?? finitePositive(container?.clientWidth) ?? fallbackSize.width;
  const resolvedHeight =
    finitePositive(height) ?? finitePositive(container?.clientHeight) ?? fallbackSize.height;
  return { width: resolvedWidth, height: resolvedHeight };
}

export function createVizThreeScene(
  container: HTMLElement,
  options: VizThreeSceneOptions = {},
): VizThreeSceneController {
  const colors = resolveVizThreeSceneColors(options.theme);
  const size = resolveVizThreeSize(container, options.width, options.height);
  const scene = new THREE.Scene();
  const renderer = (options.createRenderer ?? createDefaultRenderer)({
    antialias: true,
    alpha: true,
    // Agent Connect page capture snapshots live canvases before serializing the
    // page surface; keep Three-backed component buffers readable after present.
    preserveDrawingBuffer: true,
  });
  const camera = createPerspectiveCamera(size, options);

  renderer.setPixelRatio(1);
  renderer.setSize(size.width, size.height, false);
  renderer.setClearColor(colors.background, options.clearAlpha ?? 0);
  container.appendChild(renderer.domElement);
  addDefaultLighting(scene, colors);

  return {
    scene,
    camera,
    renderer,
    colors,
    resize(width, height) {
      const nextSize = resolveVizThreeSize(container, width, height);
      camera.aspect = nextSize.width / nextSize.height;
      camera.updateProjectionMatrix();
      renderer.setSize(nextSize.width, nextSize.height, false);
    },
    render() {
      renderer.render(scene, camera);
    },
    dispose() {
      disposeThreeObject(scene);
      renderer.dispose();
      try {
        renderer.forceContextLoss?.();
      } catch {
        // Context loss is a best-effort GPU cleanup hint and can throw in test doubles.
      }
      renderer.domElement.remove();
    },
  };
}

export function disposeThreeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    const disposable = child as THREE.Object3D & {
      geometry?: { dispose: () => void };
      material?: { dispose: () => void } | Array<{ dispose: () => void }>;
    };
    disposable.geometry?.dispose();
    if (Array.isArray(disposable.material)) {
      disposable.material.forEach((material) => material.dispose());
    } else {
      disposable.material?.dispose();
    }
  });
}

function createDefaultRenderer(options: THREE.WebGLRendererParameters): VizThreeRenderer {
  return new THREE.WebGLRenderer(options);
}

function createPerspectiveCamera(
  size: { width: number; height: number },
  options: VizThreeSceneOptions,
): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(options.fov ?? 40, size.width / size.height, 0.1, 200);
  camera.position.fromArray(options.cameraPosition ?? [8, 6, 10]);
  camera.lookAt(new THREE.Vector3().fromArray(options.cameraTarget ?? [0, 0, 0]));
  return camera;
}

function addDefaultLighting(scene: THREE.Scene, colors: VizThreeSceneColors): void {
  scene.add(new THREE.AmbientLight(DEFAULT_VIZ_THREE_LIGHT_HEX, 0.35));
  const key = new THREE.DirectionalLight(DEFAULT_VIZ_THREE_LIGHT_HEX, 0.85);
  key.position.set(6, 10, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(colors.accent, 0.3);
  rim.position.set(-6, 4, -8);
  scene.add(rim);
}

export function toThreeHexColor(color: unknown, fallback = 0xffffff): number {
  if (typeof color === "number" && Number.isInteger(color) && color >= 0 && color <= 0xffffff) {
    return color;
  }

  if (typeof color !== "string") return fallback;
  const value = color.trim().toLowerCase();
  const hex = parseHexColor(value);
  if (hex !== undefined) return hex;

  const rgb = parseRgbColor(value) ?? parseOklchColor(value);
  if (rgb !== undefined) return rgb;

  return fallback;
}

export function resolveThemeColorForThreeHex(
  context: ComponentThemeContext | Record<string, unknown> | null | undefined,
  role: ComponentThemeColorRole,
): number {
  const fallback = getDefaultThemeColorValue(role);
  return toThreeHexColor(
    resolveThemeProperty(context, `color.${role}`, fallback),
    toThreeHexColor(fallback),
  );
}

function toThemeContext(
  input: unknown,
): ComponentThemeContext | Record<string, unknown> | null | undefined {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return undefined;
  return input as ComponentThemeContext | Record<string, unknown>;
}

function getDefaultThemeColorValue(role: ComponentThemeColorRole): string {
  const value = defaultComponentTheme?.properties.color[role];
  if (!value) {
    throw new Error(`Missing default component-theme color role "${role}"`);
  }
  return value;
}

function parseHexColor(value: string): number | undefined {
  const normalized = value.startsWith("#")
    ? value.slice(1)
    : value.startsWith("0x")
      ? value.slice(2)
      : "";
  if (!normalized) return undefined;

  if (/^[0-9a-f]{3}$/.test(normalized)) {
    return Number.parseInt(
      normalized
        .split("")
        .map((digit) => `${digit}${digit}`)
        .join(""),
      16,
    );
  }

  if (/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(normalized)) {
    return Number.parseInt(normalized.slice(0, 6), 16);
  }

  return undefined;
}

function parseRgbColor(value: string): number | undefined {
  const match = /^rgba?\((.+)\)$/.exec(value);
  if (!match) return undefined;

  const parts = parseColorFunctionParts(match[1]);
  const separatorIndex = parts.indexOf("/");
  const channelParts = separatorIndex === -1 ? parts.slice(0, 3) : parts.slice(0, separatorIndex);
  if (channelParts.length !== 3) return undefined;

  const channels = channelParts.map(parseRgbChannel);
  if (channels.length !== 3 || channels.some((channel) => !Number.isFinite(channel))) {
    return undefined;
  }

  const [red = 0, green = 0, blue = 0] = channels;
  return (red << 16) + (green << 8) + blue;
}

function parseOklchColor(value: string): number | undefined {
  const match = /^oklch\((.+)\)$/.exec(value);
  if (!match) return undefined;

  const parts = parseColorFunctionParts(match[1]);
  const separatorIndex = parts.indexOf("/");
  const colorParts = separatorIndex === -1 ? parts.slice(0, 3) : parts.slice(0, separatorIndex);
  if (colorParts.length !== 3) return undefined;

  const lightness = parseLightness(colorParts[0] ?? "");
  const chroma = Number(colorParts[1]);
  const hue = Number(colorParts[2]);
  if (![lightness, chroma, hue].every((part) => part !== undefined && Number.isFinite(part))) {
    return undefined;
  }

  return oklchToHex(lightness as number, chroma, hue);
}

function parseColorFunctionParts(value: string | undefined): string[] {
  return (value ?? "").includes(",")
    ? (value ?? "").split(",").map((part) => part.trim())
    : (value ?? "").replace("/", " / ").split(/\s+/).filter(Boolean);
}

function oklchToHex(lightness: number, chroma: number, hue: number): number {
  const hueRadians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(hueRadians);
  const b = chroma * Math.sin(hueRadians);

  const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = lPrime ** 3;
  const m = mPrime ** 3;
  const s = sPrime ** 3;

  const red = linearRgbToByte(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const green = linearRgbToByte(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const blue = linearRgbToByte(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  return (red << 16) + (green << 8) + blue;
}

function linearRgbToByte(value: number): number {
  const clamped = clamp01(value);
  const gamma = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
  return clampByte(gamma * 255);
}

function parseLightness(value: string): number | undefined {
  if (value.endsWith("%")) return parsePercentage(value);
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function parseRgbChannel(value: string): number | undefined {
  const parsed = value.endsWith("%") ? parsePercentage(value) * 255 : Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return clampByte(parsed);
}

function parsePercentage(value: string): number {
  return Number(value.slice(0, -1)) / 100;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clampByte(value: number): number {
  return Math.round(Math.min(255, Math.max(0, value)));
}

function finitePositive(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

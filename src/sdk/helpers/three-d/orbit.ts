import type * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface VizOrbitOptions {
  /** Whether the controller is interactive on creation. Defaults to true. */
  enabled?: boolean;
  /** Damping for inertial drag. Defaults to true; uses dampingFactor 0.08. */
  dampingEnabled?: boolean;
  /** Optional dolly/zoom clamps applied only when defined. */
  minDistance?: number;
  maxDistance?: number;
  /** Whether two-finger / right-button pan is allowed. Defaults to true. */
  enablePan?: boolean;
  /** Whether wheel and dolly/pinch zoom are allowed. Defaults to true. */
  enableZoom?: boolean;
  /** Whether the camera should auto-rotate. Defaults to false. */
  autoRotate?: boolean;
  /** OrbitControls auto-rotate speed (units of OrbitControls). Defaults to 0.5. */
  autoRotateSpeed?: number;
  /**
   * Optional orbit pivot. When all components are finite, the target is copied
   * before the first update so OrbitControls does not re-aim non-origin scenes
   * at (0, 0, 0).
   */
  target?: readonly [number, number, number] | { x: number; y: number; z: number };
}

export interface VizOrbitController {
  /** Reflects the underlying OrbitControls.enabled flag. */
  enabled: boolean;
  /** Toggle interactivity at runtime (e.g. while dragging selection rect). */
  setEnabled(value: boolean): void;
  /** Toggle auto-rotate at runtime. */
  setAutoRotate(value: boolean): void;
  /** Advance damping/auto-rotate; call from the host render loop. */
  update(): void;
  /** Restore the OrbitControls saved camera/target state. */
  reset(): void;
  /** Detach listeners and release the OrbitControls instance. */
  dispose(): void;
}

const DEFAULT_DAMPING_FACTOR = 0.08;
const DEFAULT_AUTO_ROTATE_SPEED = 0.5;

/**
 * Create an OrbitControls wrapper with shared defaults. Renderers should call
 * `update()` once per animation frame and `dispose()` on teardown.
 */
export function createVizOrbitController(
  camera: THREE.Camera,
  domElement: HTMLElement,
  options: VizOrbitOptions = {},
): VizOrbitController {
  const controls = new OrbitControls(camera, domElement);
  const dampingEnabled = options.dampingEnabled ?? true;
  controls.enableDamping = dampingEnabled;
  controls.dampingFactor = DEFAULT_DAMPING_FACTOR;
  controls.screenSpacePanning = false;
  controls.enablePan = options.enablePan ?? true;
  const enableZoom = options.enableZoom ?? true;
  controls.enableZoom = enableZoom;
  const controlsWithOptionalDolly = controls as OrbitControls & { enableDolly?: boolean };
  if ("enableDolly" in controlsWithOptionalDolly) {
    controlsWithOptionalDolly.enableDolly = enableZoom;
  }
  controls.autoRotate = options.autoRotate ?? false;
  controls.autoRotateSpeed = options.autoRotateSpeed ?? DEFAULT_AUTO_ROTATE_SPEED;
  controls.enabled = options.enabled ?? true;
  if (typeof options.minDistance === "number" && Number.isFinite(options.minDistance)) {
    controls.minDistance = options.minDistance;
  }
  if (typeof options.maxDistance === "number" && Number.isFinite(options.maxDistance)) {
    controls.maxDistance = options.maxDistance;
  }
  applyOrbitTarget(controls, options.target);

  // OrbitControls snapshots reset state during construction, before this
  // helper applies options. Re-save so reset() restores the caller's framed
  // camera position and non-origin pivot.
  controls.saveState();

  return {
    get enabled() {
      return controls.enabled;
    },
    set enabled(value: boolean) {
      controls.enabled = value;
    },
    setEnabled(value: boolean) {
      controls.enabled = value;
    },
    setAutoRotate(value: boolean) {
      controls.autoRotate = value;
    },
    update() {
      controls.update();
    },
    reset() {
      controls.reset();
    },
    dispose() {
      controls.dispose();
    },
  };
}

function applyOrbitTarget(
  controls: OrbitControls,
  target?: readonly [number, number, number] | { x: number; y: number; z: number },
): void {
  if (target === undefined) return;

  const [tx, ty, tz] = Array.isArray(target)
    ? (target as readonly [number, number, number])
    : [
        (target as { x: number; y: number; z: number }).x,
        (target as { x: number; y: number; z: number }).y,
        (target as { x: number; y: number; z: number }).z,
      ];
  if (
    typeof tx === "number" &&
    typeof ty === "number" &&
    typeof tz === "number" &&
    Number.isFinite(tx) &&
    Number.isFinite(ty) &&
    Number.isFinite(tz)
  ) {
    controls.target.set(tx, ty, tz);
  }
}

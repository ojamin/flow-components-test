import type * as THREE from "three";
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
    target?: readonly [number, number, number] | {
        x: number;
        y: number;
        z: number;
    };
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
/**
 * Create an OrbitControls wrapper with shared defaults. Renderers should call
 * `update()` once per animation frame and `dispose()` on teardown.
 */
export declare function createVizOrbitController(camera: THREE.Camera, domElement: HTMLElement, options?: VizOrbitOptions): VizOrbitController;

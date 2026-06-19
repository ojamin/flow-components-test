import * as THREE from "three";
export interface PointerRectLike {
    left: number;
    top: number;
    width: number;
    height: number;
}
export interface PointerLike {
    clientX: number;
    clientY: number;
}
export interface VizPickPayload<TPayload = unknown> {
    objectId: string;
    payload: TPayload;
    point: [number, number, number];
    distance: number;
}
export interface VizPickSuppressor {
    /** True if the most recent pointer interaction crossed the drag threshold. */
    wasDrag(): boolean;
    /** Detach pointer listeners. Safe to call multiple times. */
    dispose(): void;
}
export declare function pointerToNormalizedDeviceCoordinates(pointer: PointerLike, rect: PointerRectLike): THREE.Vector2 | null;
export declare function pickFirstThreeObject<TPayload>(intersections: readonly THREE.Intersection<THREE.Object3D>[], payloadKey?: string): VizPickPayload<TPayload> | null;
/**
 * Track whether the most recent pointer interaction was a drag, so renderers
 * can suppress click-style picking on drag-release.
 */
export declare function createVizPickSuppressor(domElement: HTMLElement): VizPickSuppressor;

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

const DRAG_THRESHOLD_PX = 4;

export function pointerToNormalizedDeviceCoordinates(
  pointer: PointerLike,
  rect: PointerRectLike,
): THREE.Vector2 | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  return new THREE.Vector2(
    ((pointer.clientX - rect.left) / rect.width) * 2 - 1,
    -((pointer.clientY - rect.top) / rect.height) * 2 + 1,
  );
}

export function pickFirstThreeObject<TPayload>(
  intersections: readonly THREE.Intersection<THREE.Object3D>[],
  payloadKey = "payload",
): VizPickPayload<TPayload> | null {
  const hit = intersections[0];
  if (!hit) return null;
  const payload = hit.object.userData[payloadKey] as TPayload | undefined;
  if (payload === undefined) return null;
  return {
    objectId: hit.object.name || hit.object.uuid,
    payload,
    point: [hit.point.x, hit.point.y, hit.point.z],
    distance: hit.distance,
  };
}

/**
 * Track whether the most recent pointer interaction was a drag, so renderers
 * can suppress click-style picking on drag-release.
 */
export function createVizPickSuppressor(domElement: HTMLElement): VizPickSuppressor {
  let dragged = false;
  let startX = 0;
  let startY = 0;
  let active = false;

  const onPointerDown = (event: PointerEvent) => {
    dragged = false;
    active = true;
    startX = event.clientX;
    startY = event.clientY;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!active || dragged) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
      dragged = true;
    }
  };

  const onPointerEnd = () => {
    // Keep `dragged` set through synthetic click handlers after pointerup.
    active = false;
  };

  domElement.addEventListener("pointerdown", onPointerDown);
  domElement.addEventListener("pointermove", onPointerMove);
  domElement.addEventListener("pointerup", onPointerEnd);
  domElement.addEventListener("pointercancel", onPointerEnd);

  let disposed = false;
  return {
    wasDrag() {
      return dragged;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      domElement.removeEventListener("pointerdown", onPointerDown);
      domElement.removeEventListener("pointermove", onPointerMove);
      domElement.removeEventListener("pointerup", onPointerEnd);
      domElement.removeEventListener("pointercancel", onPointerEnd);
    },
  };
}

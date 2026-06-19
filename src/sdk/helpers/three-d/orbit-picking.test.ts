import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createVizOrbitController,
  createVizPickSuppressor,
  pickFirstThreeObject,
  pointerToNormalizedDeviceCoordinates,
} from "@flow-builder/components/sdk/three-d";

describe("SDK Three-d orbit and picking helpers", () => {
  describe("createVizOrbitController", () => {
    let camera: THREE.PerspectiveCamera;
    let domElement: HTMLElement;

    beforeEach(() => {
      camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 200);
      camera.position.set(8, 6, 10);
      domElement = document.createElement("div");
      Object.defineProperties(domElement, {
        clientWidth: { value: 320 },
        clientHeight: { value: 180 },
      });
      domElement.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          width: 320,
          height: 180,
          right: 320,
          bottom: 180,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
      document.body.appendChild(domElement);
    });

    afterEach(() => {
      domElement.remove();
    });

    it("preserves a non-origin target before update and reset", () => {
      camera.position.set(0, 0, 10);
      const initialPosition = camera.position.clone();
      const target: [number, number, number] = [10, 0, 10];
      const controller = createVizOrbitController(camera, domElement, { target });

      controller.update();
      expectCameraToFace(camera, target);

      camera.position.set(5, 5, 5);
      camera.lookAt(0, 0, 0);
      controller.reset();

      expect(camera.position.distanceTo(initialPosition)).toBeLessThan(0.001);
      expectCameraToFace(camera, target);
      controller.dispose();
    });

    it("exposes runtime toggles and disposes OrbitControls listeners", () => {
      const removeSpy = vi.spyOn(domElement, "removeEventListener");
      const controller = createVizOrbitController(camera, domElement, {
        enabled: false,
        dampingEnabled: false,
        enablePan: false,
        enableZoom: false,
        autoRotate: true,
        minDistance: 2,
        maxDistance: 50,
      });

      expect(controller.enabled).toBe(false);
      controller.setEnabled(true);
      controller.setAutoRotate(false);
      expect(controller.enabled).toBe(true);
      expect(() => controller.update()).not.toThrow();

      controller.dispose();
      expect(removeSpy).toHaveBeenCalled();
    });
  });

  describe("picking helpers", () => {
    it("maps pointers to normalized device coordinates and ignores invalid rects", () => {
      expect(
        pointerToNormalizedDeviceCoordinates(
          { clientX: 50, clientY: 25 },
          { left: 0, top: 0, width: 100, height: 100 },
        ),
      ).toMatchObject({ x: 0, y: 0.5 });
      expect(
        pointerToNormalizedDeviceCoordinates(
          { clientX: 50, clientY: 25 },
          { left: 0, top: 0, width: 0, height: 100 },
        ),
      ).toBeNull();
    });

    it("returns the first payload-bearing Three intersection", () => {
      const object = new THREE.Object3D();
      object.name = "point-a";
      object.userData.customPayload = { id: "a" };

      expect(
        pickFirstThreeObject<{ id: string }>(
          [
            {
              object,
              point: new THREE.Vector3(1, 2, 3),
              distance: 4,
            } as THREE.Intersection<THREE.Object3D>,
          ],
          "customPayload",
        ),
      ).toEqual({ objectId: "point-a", payload: { id: "a" }, point: [1, 2, 3], distance: 4 });

      expect(pickFirstThreeObject([], "customPayload")).toBeNull();
      expect(
        pickFirstThreeObject([{ object: new THREE.Object3D() } as THREE.Intersection]),
      ).toBeNull();
    });

    it("suppresses click picks after drags and detaches listeners on dispose", () => {
      const domElement = document.createElement("div");
      document.body.appendChild(domElement);
      const removeSpy = vi.spyOn(domElement, "removeEventListener");
      const suppressor = createVizPickSuppressor(domElement);

      dispatchPointer(domElement, "pointerdown", 0, 0);
      dispatchPointer(domElement, "pointermove", 10, 0);
      dispatchPointer(domElement, "pointerup", 10, 0);
      expect(suppressor.wasDrag()).toBe(true);

      dispatchPointer(domElement, "pointerdown", 50, 50);
      expect(suppressor.wasDrag()).toBe(false);

      suppressor.dispose();
      expect(removeSpy).toHaveBeenCalledTimes(4);
      suppressor.dispose();
      expect(removeSpy).toHaveBeenCalledTimes(4);

      dispatchPointer(domElement, "pointerdown", 0, 0);
      dispatchPointer(domElement, "pointermove", 100, 100);
      expect(suppressor.wasDrag()).toBe(false);
      domElement.remove();
    });
  });
});

function expectCameraToFace(camera: THREE.Camera, target: readonly [number, number, number]) {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const expected = new THREE.Vector3(...target).sub(camera.position).normalize();
  expect(forward.dot(expected)).toBeGreaterThan(0.999);
}

function dispatchPointer(domElement: HTMLElement, type: string, clientX: number, clientY: number) {
  const event = new (globalThis.PointerEvent ?? Event)(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
  } as PointerEventInit);
  domElement.dispatchEvent(event);
}

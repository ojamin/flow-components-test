import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";

import {
  createVizThreeScene,
  disposeThreeObject,
  resolveVizThreeSceneColors,
  resolveVizThreeSize,
} from "@flow-builder/components/sdk/three-d";

describe("SDK Three-d scene helpers", () => {
  it("creates a disposable Three scene with injectable renderer for WebGL-free tests", () => {
    const themeContext = {
      properties: {
        color: {
          pageBackground: "#010203",
          chart1: "#040506",
        },
      },
    };
    const container = document.createElement("div");
    Object.defineProperties(container, {
      clientWidth: { value: 320 },
      clientHeight: { value: 180 },
    });
    const renderer = createRendererDouble();
    const createRenderer = vi.fn(() => renderer);
    const controller = createVizThreeScene(container, {
      theme: themeContext,
      createRenderer,
    });

    expect(resolveVizThreeSceneColors(themeContext).background).toBe(0x010203);
    expect(resolveVizThreeSize(undefined, 0, undefined)).toEqual({ width: 640, height: 360 });
    expect(createRenderer).toHaveBeenCalledWith({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    expect(container.contains(renderer.domElement)).toBe(true);
    expect(controller.camera.aspect).toBeCloseTo(320 / 180);

    controller.resize(640, 320);
    expect(renderer.setSize).toHaveBeenLastCalledWith(640, 320, false);
    expect(controller.camera.aspect).toBe(2);

    controller.dispose();
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(renderer.forceContextLoss).toHaveBeenCalledOnce();
    expect(container.contains(renderer.domElement)).toBe(false);
  });

  it("disposes geometries and material arrays while traversing Three objects", () => {
    const geometry = new THREE.BufferGeometry();
    const materialA = new THREE.MeshBasicMaterial();
    const materialB = new THREE.MeshBasicMaterial();
    const geometryDispose = vi.spyOn(geometry, "dispose");
    const materialADispose = vi.spyOn(materialA, "dispose");
    const materialBDispose = vi.spyOn(materialB, "dispose");
    const mesh = new THREE.Mesh(geometry, [materialA, materialB]);
    const scene = new THREE.Scene();
    scene.add(mesh);

    disposeThreeObject(scene);

    expect(geometryDispose).toHaveBeenCalledOnce();
    expect(materialADispose).toHaveBeenCalledOnce();
    expect(materialBDispose).toHaveBeenCalledOnce();
  });
});

function createRendererDouble() {
  return {
    domElement: document.createElement("canvas"),
    setPixelRatio: vi.fn(),
    setSize: vi.fn(),
    setClearColor: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    forceContextLoss: vi.fn(),
  };
}

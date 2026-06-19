import { afterEach } from "vitest";
import { config } from "@vue/test-utils";
import { h } from "vue";

// Keep package tests independent from the host app setup while preserving the
// lightweight browser APIs package renderers expect in jsdom.
config.global.stubs = {
  Icon: {
    name: "Icon",
    render() {
      return h("svg", { class: "iconify-icon", "data-icon-stub": "true" });
    },
  },
};

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver;
}

if (typeof SVGElement !== "undefined") {
  const svgElementPrototype = SVGElement.prototype as unknown as Record<string, unknown>;
  if (!svgElementPrototype.getBBox) {
    svgElementPrototype.getBBox = () => ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  }
}

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: /min-width/.test(query),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

if (typeof HTMLCanvasElement !== "undefined") {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    writable: true,
    configurable: true,
    value: (() => null) as HTMLCanvasElement["getContext"],
  });
}

afterEach(() => {
  document.body.innerHTML = "";
});

import { createCanvas as e } from "../browser/index.js";
//#region src/sdk/helpers/capabilities/index.ts
var t = [
	"webgl2",
	"webgl",
	"experimental-webgl"
];
function n(e = {}) {
	let n = i(e);
	if (!n) return {
		supported: !1,
		reason: "Canvas is unavailable in this environment."
	};
	if (typeof n.getContext != "function") return {
		supported: !1,
		reason: "Canvas does not expose a WebGL context API."
	};
	let r = !1;
	for (let i of e.contextNames ?? t) {
		let e = a(n, i);
		if (e.threw && (r = !0), e.value) return {
			supported: !0,
			contextName: i
		};
	}
	return r ? {
		supported: !1,
		reason: "WebGL context creation threw before a context could be created."
	} : {
		supported: !1,
		reason: "WebGL context creation failed or is disabled."
	};
}
function r(t) {
	return n({ createCanvas: () => e({}, t) });
}
function i(e) {
	if (e.canvas) return e.canvas;
	try {
		return e.createCanvas?.();
	} catch {
		return null;
	}
}
function a(e, t) {
	try {
		return {
			value: e.getContext(t, {
				antialias: !0,
				alpha: !0
			}),
			threw: !1
		};
	} catch {
		return {
			value: null,
			threw: !0
		};
	}
}
//#endregion
export { r as detectBrowserWebGLSupport, n as detectWebGLSupport };

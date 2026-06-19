import { getBuiltInComponentTheme as e } from "../../../themes/index.js";
import { resolveThemeProperty as t } from "../../theme.js";
import { REDUCED_MOTION_QUERY as n, createFrameLoop as r, resolveReducedMotionState as i } from "../rendering/index.js";
import { detectBrowserWebGLSupport as a, detectWebGLSupport as o } from "../capabilities/index.js";
import { createVizOrbitController as s } from "./orbit.js";
import { createVizPickSuppressor as c, pickFirstThreeObject as l, pointerToNormalizedDeviceCoordinates as u } from "./picking.js";
import { createVizStaleAsyncSetupGuard as d } from "./stale-async.js";
import * as f from "three";
//#region src/sdk/helpers/three-d/index.ts
var p = {
	width: 640,
	height: 360
}, m = e("default"), h = E(void 0, "chart1"), g = E(void 0, "foreground"), _ = 16777215;
function v(e) {
	let t = D(e);
	return {
		background: E(t, "pageBackground"),
		ground: E(t, "surfaceMuted"),
		grid: E(t, "border"),
		gridDim: E(t, "surfaceMuted"),
		ink: E(t, "foreground"),
		accent: E(t, "chart1"),
		accent2: E(t, "chart2"),
		accent3: E(t, "chart3"),
		accent4: E(t, "chart4"),
		accent5: E(t, "chart5")
	};
}
function y(e, t, n) {
	return {
		width: B(t) ?? B(e?.clientWidth) ?? p.width,
		height: B(n) ?? B(e?.clientHeight) ?? p.height
	};
}
function b(e, t = {}) {
	let n = v(t.theme), r = y(e, t.width, t.height), i = new f.Scene(), a = (t.createRenderer ?? S)({
		antialias: !0,
		alpha: !0,
		preserveDrawingBuffer: !0
	}), o = C(r, t);
	return a.setPixelRatio(1), a.setSize(r.width, r.height, !1), a.setClearColor(n.background, t.clearAlpha ?? 0), e.appendChild(a.domElement), w(i, n), {
		scene: i,
		camera: o,
		renderer: a,
		colors: n,
		resize(t, n) {
			let r = y(e, t, n);
			o.aspect = r.width / r.height, o.updateProjectionMatrix(), a.setSize(r.width, r.height, !1);
		},
		render() {
			a.render(i, o);
		},
		dispose() {
			x(i), a.dispose();
			try {
				a.forceContextLoss?.();
			} catch {}
			a.domElement.remove();
		}
	};
}
function x(e) {
	e.traverse((e) => {
		let t = e;
		t.geometry?.dispose(), Array.isArray(t.material) ? t.material.forEach((e) => e.dispose()) : t.material?.dispose();
	});
}
function S(e) {
	return new f.WebGLRenderer(e);
}
function C(e, t) {
	let n = new f.PerspectiveCamera(t.fov ?? 40, e.width / e.height, .1, 200);
	return n.position.fromArray(t.cameraPosition ?? [
		8,
		6,
		10
	]), n.lookAt(new f.Vector3().fromArray(t.cameraTarget ?? [
		0,
		0,
		0
	])), n;
}
function w(e, t) {
	e.add(new f.AmbientLight(_, .35));
	let n = new f.DirectionalLight(_, .85);
	n.position.set(6, 10, 8), e.add(n);
	let r = new f.DirectionalLight(t.accent, .3);
	r.position.set(-6, 4, -8), e.add(r);
}
function T(e, t = 16777215) {
	if (typeof e == "number" && Number.isInteger(e) && e >= 0 && e <= 16777215) return e;
	if (typeof e != "string") return t;
	let n = e.trim().toLowerCase(), r = k(n);
	if (r !== void 0) return r;
	let i = A(n) ?? j(n);
	return i === void 0 ? t : i;
}
function E(e, n) {
	let r = O(n);
	return T(t(e, `color.${n}`, r), T(r));
}
function D(e) {
	if (!(typeof e != "object" || !e || Array.isArray(e))) return e;
}
function O(e) {
	let t = m?.properties.color[e];
	if (!t) throw Error(`Missing default component-theme color role "${e}"`);
	return t;
}
function k(e) {
	let t = e.startsWith("#") ? e.slice(1) : e.startsWith("0x") ? e.slice(2) : "";
	if (t) {
		if (/^[0-9a-f]{3}$/.test(t)) return Number.parseInt(t.split("").map((e) => `${e}${e}`).join(""), 16);
		if (/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(t)) return Number.parseInt(t.slice(0, 6), 16);
	}
}
function A(e) {
	let t = /^rgba?\((.+)\)$/.exec(e);
	if (!t) return;
	let n = M(t[1]), r = n.indexOf("/"), i = r === -1 ? n.slice(0, 3) : n.slice(0, r);
	if (i.length !== 3) return;
	let a = i.map(I);
	if (a.length !== 3 || a.some((e) => !Number.isFinite(e))) return;
	let [o = 0, s = 0, c = 0] = a;
	return (o << 16) + (s << 8) + c;
}
function j(e) {
	let t = /^oklch\((.+)\)$/.exec(e);
	if (!t) return;
	let n = M(t[1]), r = n.indexOf("/"), i = r === -1 ? n.slice(0, 3) : n.slice(0, r);
	if (i.length !== 3) return;
	let a = F(i[0] ?? ""), o = Number(i[1]), s = Number(i[2]);
	if ([
		a,
		o,
		s
	].every((e) => e !== void 0 && Number.isFinite(e))) return N(a, o, s);
}
function M(e) {
	return (e ?? "").includes(",") ? (e ?? "").split(",").map((e) => e.trim()) : (e ?? "").replace("/", " / ").split(/\s+/).filter(Boolean);
}
function N(e, t, n) {
	let r = n * Math.PI / 180, i = t * Math.cos(r), a = t * Math.sin(r), o = e + .3963377774 * i + .2158037573 * a, s = e - .1055613458 * i - .0638541728 * a, c = e - .0894841775 * i - 1.291485548 * a, l = o ** 3, u = s ** 3, d = c ** 3, f = P(4.0767416621 * l - 3.3077115913 * u + .2309699292 * d), p = P(-1.2684380046 * l + 2.6097574011 * u - .3413193965 * d), m = P(-.0041960863 * l - .7034186147 * u + 1.707614701 * d);
	return (f << 16) + (p << 8) + m;
}
function P(e) {
	let t = R(e);
	return z((t <= .0031308 ? 12.92 * t : 1.055 * t ** (1 / 2.4) - .055) * 255);
}
function F(e) {
	if (e.endsWith("%")) return L(e);
	let t = Number(e);
	if (Number.isFinite(t)) return t;
}
function I(e) {
	let t = e.endsWith("%") ? L(e) * 255 : Number(e);
	if (Number.isFinite(t)) return z(t);
}
function L(e) {
	return Number(e.slice(0, -1)) / 100;
}
function R(e) {
	return Math.min(1, Math.max(0, e));
}
function z(e) {
	return Math.round(Math.min(255, Math.max(0, e)));
}
function B(e) {
	return typeof e == "number" && Number.isFinite(e) && e > 0 ? e : void 0;
}
//#endregion
export { h as DEFAULT_VIZ_THREE_ACCENT_HEX, g as DEFAULT_VIZ_THREE_FOREGROUND_HEX, _ as DEFAULT_VIZ_THREE_LIGHT_HEX, n as REDUCED_MOTION_QUERY, r as createFrameLoop, s as createVizOrbitController, c as createVizPickSuppressor, d as createVizStaleAsyncSetupGuard, b as createVizThreeScene, a as detectBrowserWebGLSupport, o as detectWebGLSupport, x as disposeThreeObject, l as pickFirstThreeObject, u as pointerToNormalizedDeviceCoordinates, i as resolveReducedMotionState, E as resolveThemeColorForThreeHex, v as resolveVizThreeSceneColors, y as resolveVizThreeSize, T as toThreeHexColor };

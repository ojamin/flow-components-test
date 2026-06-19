import { componentThemeColorRoles as e, componentThemeFontRoles as t, componentThemeMotionRoles as n, componentThemePropertiesSchema as r, componentThemeRadiusRoles as i, componentThemeShadowRoles as a, componentThemeSpacingRoles as o } from "../themes/schema.js";
import { getBuiltInComponentTheme as s } from "../themes/index.js";
import { formatComponentThemeCanvasColor as c, parseComponentThemeCssColor as l } from "./theme-color-utils.js";
//#region src/sdk/theme.ts
var u = ["light", "dark"], d = "#ffffff", f = Object.freeze({
	color: e,
	font: t,
	radius: i,
	spacing: o,
	motion: n,
	shadow: a
}), p = f, m = new Set(["shadow"]), h = "data-ct-scope", g = "--ct", _ = "";
function v(e) {
	return e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
function y() {
	return Object.freeze(Object.fromEntries(Object.entries(p).map(([e, t]) => [e, Object.freeze(Object.fromEntries(t.map((t) => [t, `${g}-${e}-${v(t)}`])))])));
}
var b = y(), x = Object.freeze(Object.entries(p).flatMap(([e, t]) => t.map((t) => `${e}.${t}`))), S = Object.freeze(Object.fromEntries(x.map((e) => {
	let [t, n] = e.split(".");
	return [e, b[t][n]];
})));
function C(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function w(e, t, n) {
	return e === "motion" && (t === "durationFastMs" || t === "durationNormalMs") ? typeof n == "number" && Number.isFinite(n) && Number.isInteger(n) && n >= 0 : typeof n == "string" && n.trim().length > 0;
}
function T(e) {
	let [t, n, ...r] = e.split(".");
	if (!(!t || !n) && !(r.length > 0) && E(t) && p[t].includes(n)) return [t, n];
}
function E(e) {
	return Object.prototype.hasOwnProperty.call(p, e);
}
function D(e) {
	return typeof e == "string" ? e.trim() : e;
}
function O(e) {
	if (typeof e == "number") return Number.isFinite(e) ? e : "";
	if (typeof e == "string") {
		let t = e.trim();
		return t.length > 0 ? t : "";
	}
	return "";
}
function k(e, t, n) {
	let r = T(t);
	if (!r || !C(e) || !C(e.properties)) return O(n);
	let [i, a] = r, o = e.properties[i];
	if (!C(o)) return O(n);
	let s = o[a];
	return w(i, a, s) ? D(s) : O(n);
}
function A(e, t, n) {
	return typeof n == "number" && e === "motion" && (t === "durationFastMs" || t === "durationNormalMs") ? `${n}ms` : String(n);
}
function j(e) {
	return /^-?\d+(?:\.\d+)?(?:deg|rad|grad|turn)?\s+-?\d+(?:\.\d+)?%\s+-?\d+(?:\.\d+)?%(?:\s*\/\s*(?:\d+(?:\.\d+)?%?|\.\d+))?$/.test(e.trim());
}
function M(e, t) {
	return j(t) ? `hsl(var(${e}))` : t;
}
function N(e, t) {
	let n = C(e) ? e : void 0, r = n && C(n.properties) ? n.properties : e, i = C(r) ? { properties: r } : void 0;
	return Object.fromEntries(x.flatMap((e) => {
		let [n, r] = T(e), a = S[e], o = [a, A(n, r, k(i, e, t))];
		return n === "color" ? [o, [`--color-ct-${v(r)}`, M(a, o[1])]] : [o];
	}));
}
function P(e, t) {
	let n = r.parse(e), i = C(t) ? t : {};
	return Object.fromEntries(Object.entries(p).flatMap(([e, t]) => {
		let r = e, a = C(n[r]) ? n[r] : {}, o = C(i[e]) ? i[e] : {}, s = m.has(r) && Object.keys(a).length === 0, c = Object.fromEntries(t.flatMap((e) => {
			let t = o[e], n = w(r, e, t) ? t : a[e];
			return n === void 0 ? [] : [[e, n]];
		}));
		return s && t.some((e) => c[e] === void 0) ? [] : [[e, c]];
	}));
}
function F(e, t = "light", n = {}) {
	let r = P(e.properties, e.palettes?.light);
	if (t === "light") return {
		properties: r,
		diagnostics: []
	};
	let i = e.palettes?.dark;
	return {
		properties: P(r, i),
		diagnostics: I(e, r, i, n)
	};
}
function I(e, t, n, r) {
	let i = C(n) ? n : {}, a = r.pathPrefix ?? "palettes.dark", o = r.fallbackPathPrefix ?? "properties", s = [];
	for (let n of x) {
		let r = T(n);
		if (!r) continue;
		let [c, l] = r, u = i[c];
		if (w(c, l, C(u) ? u[l] : void 0)) continue;
		let d = t[c];
		if (!C(d)) continue;
		let f = d[l];
		if (!w(c, l, f)) continue;
		let p = `${a}.${c}.${l}`, m = `${o}.${c}.${l}`;
		s.push({
			code: "missing-dark-palette-role-fallback",
			themeId: e.id,
			mode: "dark",
			propertyKey: n,
			path: p,
			fallbackPath: m,
			message: `Theme "${e.id}" is missing dark palette value "${n}"; falling back to "${m}".`
		});
	}
	return s;
}
var L = s("default");
function R(e, t) {
	let n = V(t), r = k(e, `color.${t}`, n);
	return l(String(r)) ?? H(t);
}
function z(e, t) {
	return c(R(e, t));
}
function B(e, t) {
	return z(e, t);
}
function V(e) {
	let t = L?.properties.color[e];
	if (!t) throw Error(`Missing default component-theme color role "${e}"`);
	return t;
}
function H(e) {
	let t = l(V(e));
	if (!t) throw Error(`Default component-theme color role "${e}" is not convertible`);
	return t;
}
//#endregion
export { S as componentThemeCssVariableByPropertyKey, g as componentThemeCssVariablePrefix, b as componentThemeCssVariableSlots, d as componentThemeDefaultLightColor, u as componentThemePaletteModes, _ as componentThemePropertyFallback, x as componentThemePropertyKeys, f as componentThemePropertyRolesByGroup, h as componentThemeScopeAttribute, P as composeThemeProperties, N as createThemeCssVariableMap, w as isValidComponentThemePropertyValue, F as resolveComponentThemePaletteProperties, z as resolveThemeColorForCanvas, B as resolveThemeColorForSvg, R as resolveThemeColorRgba, k as resolveThemeProperty, v as themeRoleKeyToCssVariableSuffix };

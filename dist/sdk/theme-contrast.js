import { parseComponentThemeCssColor as e } from "./theme-color-utils.js";
import { resolveComponentThemePaletteProperties as t } from "./theme.js";
//#region src/sdk/theme-contrast.ts
var n = Object.freeze([
	{
		foregroundRole: "foreground",
		backgroundRole: "pageBackground",
		minimumContrastRatio: 4.5
	},
	{
		foregroundRole: "foreground",
		backgroundRole: "surface",
		minimumContrastRatio: 4.5
	},
	{
		foregroundRole: "cardForeground",
		backgroundRole: "surface",
		minimumContrastRatio: 4.5
	},
	{
		foregroundRole: "popoverForeground",
		backgroundRole: "popover",
		minimumContrastRatio: 4.5
	},
	{
		foregroundRole: "accentForeground",
		backgroundRole: "accent",
		minimumContrastRatio: 4.5
	},
	{
		foregroundRole: "secondaryForeground",
		backgroundRole: "secondary",
		minimumContrastRatio: 4.5
	},
	{
		foregroundRole: "destructiveForeground",
		backgroundRole: "destructive",
		minimumContrastRatio: 4.5
	},
	{
		foregroundRole: "foregroundMuted",
		backgroundRole: "surfaceMuted",
		minimumContrastRatio: 4.5
	}
]);
function r(e) {
	return ["light", "dark"].flatMap((n) => {
		let r = t(e, n).properties;
		return i(e, n, r);
	});
}
function i(e, t, r) {
	let i = [], l = h(r.color) ? r.color : {};
	for (let r of n) {
		let n = o(t, r.foregroundRole), u = o(t, r.backgroundRole), d = a(l, r.foregroundRole), f = a(l, r.backgroundRole), m = s(r);
		if (!d || !f) {
			let a = d ? r.backgroundRole : r.foregroundRole;
			i.push({
				code: "missing-component-theme-role-pair",
				severity: "warning",
				themeId: e.id,
				mode: t,
				foregroundRole: r.foregroundRole,
				backgroundRole: r.backgroundRole,
				path: o(t, a),
				foregroundPath: n,
				backgroundPath: u,
				minimumContrastRatio: r.minimumContrastRatio,
				recovery: m,
				message: `Theme "${e.id}" ${t} palette is missing color.${a} for the color.${r.foregroundRole} on color.${r.backgroundRole} contrast pair. ${m}`
			});
			continue;
		}
		let h = c(d, f);
		if (h === void 0 || h < r.minimumContrastRatio) {
			let a = h === void 0 ? void 0 : p(h);
			i.push({
				code: "low-component-theme-role-pair-contrast",
				severity: "warning",
				themeId: e.id,
				mode: t,
				foregroundRole: r.foregroundRole,
				backgroundRole: r.backgroundRole,
				path: n,
				foregroundPath: n,
				backgroundPath: u,
				...a === void 0 ? {} : { contrastRatio: a },
				minimumContrastRatio: r.minimumContrastRatio,
				recovery: m,
				message: `Theme "${e.id}" ${t} palette color.${r.foregroundRole} on color.${r.backgroundRole} contrast is ${a ?? "unreadable"}:1; expected at least ${r.minimumContrastRatio}:1. ${m}`
			});
		}
	}
	return i;
}
function a(t, n) {
	let r = t[n];
	return typeof r == "string" ? e(r) : void 0;
}
function o(e, t) {
	return `palettes.${e}.color.${t}`;
}
function s(e) {
	return `Add color.${e.foregroundRole} and color.${e.backgroundRole} values that contrast at least ${e.minimumContrastRatio}:1, or choose a built-in accessible theme palette.`;
}
function c(e, t) {
	let n = l(t), r = d(u(e, n)), i = d(n), a = Math.max(r, i), o = Math.min(r, i);
	if (!(!Number.isFinite(a) || !Number.isFinite(o))) return (a + .05) / (o + .05);
}
function l(e) {
	return u(e, {
		red: 255,
		green: 255,
		blue: 255,
		alpha: 1
	});
}
function u(e, t) {
	let n = m(e.alpha), r = 1 - n;
	return {
		red: e.red * n + t.red * r,
		green: e.green * n + t.green * r,
		blue: e.blue * n + t.blue * r,
		alpha: 1
	};
}
function d(e) {
	return .2126 * f(e.red) + .7152 * f(e.green) + .0722 * f(e.blue);
}
function f(e) {
	let t = m(e / 255);
	return t <= .04045 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4;
}
function p(e) {
	return Number(e.toFixed(3));
}
function m(e) {
	return Math.min(1, Math.max(0, e));
}
function h(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
//#endregion
export { r as collectComponentThemeRolePairDiagnostics, i as collectComponentThemeRolePairDiagnosticsForMode, n as componentThemeContrastRolePairs };

import { componentThemePropertyRolesByGroup as e, isValidComponentThemePropertyValue as t } from "./theme.js";
//#region src/sdk/theme-aliases.ts
var n = [
	["background", "pageBackground"],
	["foreground", "foreground"],
	["card", "surface"],
	["card-foreground", "cardForeground"],
	["popover", "popover"],
	["popover-foreground", "popoverForeground"],
	["primary", "accent"],
	["primary-foreground", "accentForeground"],
	["secondary", "secondary"],
	["secondary-foreground", "secondaryForeground"],
	["muted", "surfaceMuted"],
	["muted-foreground", "foregroundMuted"],
	["accent", "accentSubtle"],
	["accent-foreground", "accentSubtleForeground"],
	["destructive", "destructive"],
	["destructive-foreground", "destructiveForeground"],
	["border", "border"],
	["input", "input"],
	["ring", "focusRing"],
	["chart-1", "chart1"],
	["chart-2", "chart2"],
	["chart-3", "chart3"],
	["chart-4", "chart4"],
	["chart-5", "chart5"],
	["sidebar", "sidebar"],
	["sidebar-foreground", "sidebarForeground"],
	["sidebar-primary", "sidebarPrimary"],
	["sidebar-primary-foreground", "sidebarPrimaryForeground"],
	["sidebar-accent", "sidebarAccent"],
	["sidebar-accent-foreground", "sidebarAccentForeground"],
	["sidebar-border", "sidebarBorder"],
	["sidebar-ring", "sidebarRing"]
], r = Object.freeze(Object.fromEntries(n)), i = Object.keys(e), a = e.color, o = n.map(([e]) => e), s = Object.freeze([...i, ...o]), c = Object.freeze([...a, ...o]);
function l(e, t = "propertyOverrides") {
	let n = {}, r = [];
	for (let [i, a] of Object.entries(e)) {
		if (g(i)) {
			v(a) ? u(n, r, i, a, `${t}.${i}`) : r.push({
				path: `${t}.${i}`,
				reason: "invalid-theme-property-value",
				message: "Component theme payload group must be an object.",
				group: i,
				expected: "object of component-theme role values",
				recovery: "Wrap role values in a supported component-theme group object."
			});
			continue;
		}
		if (_(i)) {
			d(n, r, i, a, `${t}.${i}`);
			continue;
		}
		r.push(h(i, `${t}.${i}`, s));
	}
	return r.length > 0 ? {
		ok: !1,
		diagnostics: y(r)
	} : {
		ok: !0,
		value: n
	};
}
function u(t, n, r, i, a) {
	let o = e[r];
	for (let [e, s] of Object.entries(i)) {
		if (o.includes(e)) {
			f(t, n, r, e, s, `${a}.${e}`);
			continue;
		}
		if (r === "color" && _(e)) {
			d(t, n, e, s, `${a}.${e}`);
			continue;
		}
		n.push(h(e, `${a}.${e}`, r === "color" ? c : o, {
			reason: "unsupported-theme-property-key",
			message: "Component theme payload contains an unsupported property key.",
			group: r
		}));
	}
}
function d(e, t, n, i, a) {
	f(e, t, "color", r[n], i, a, n);
}
function f(e, n, r, i, a, o, s) {
	let c = e[r] ??= {}, l = `${r}.${i}`, u = r === "color" ? p(a) : a;
	if (!t(r, i, u)) {
		n.push({
			path: o,
			reason: "invalid-theme-property-value",
			message: "Component theme alias normalization received an invalid property value.",
			group: r,
			key: i,
			...s ? { aliasKey: s } : {},
			canonicalKey: l,
			expected: r === "motion" ? "valid component-theme value" : "non-empty string"
		});
		return;
	}
	let d = c[i];
	if (d !== void 0 && d !== u) {
		n.push({
			path: o,
			reason: "conflicting-theme-property-alias",
			message: "Component theme payload contains conflicting values for the same canonical role.",
			group: r,
			key: i,
			...s ? { aliasKey: s } : {},
			canonicalKey: l,
			recovery: `Keep only one value for ${l}, or make the canonical key and shadcn alias values match.`
		});
		return;
	}
	c[i] = u;
}
function p(e) {
	if (typeof e != "string") return e;
	let t = e.trim(), n = [
		"h",
		"s",
		"l"
	].join("");
	return m(t) ? `${n}(${t})` : e;
}
function m(e) {
	return /^-?\d+(?:\.\d+)?(?:deg|rad|grad|turn)?\s+-?\d+(?:\.\d+)?%\s+-?\d+(?:\.\d+)?%(?:\s*\/\s*(?:\d+(?:\.\d+)?%?|\.\d+))?$/.test(e);
}
function h(e, t, n, r = {}) {
	let i = b(e, n);
	return {
		path: t,
		reason: r.reason ?? "unsupported-theme-alias",
		message: r.message ?? "Component theme payload contains an unsupported shadcn alias or theme property key.",
		...r.group === void 0 ? {} : { group: r.group },
		supportedKeys: [...n],
		...i.length > 0 ? { suggestions: i } : {},
		recovery: "Use a supported shadcn token alias or the canonical grouped component-theme property key."
	};
}
function g(t) {
	return Object.prototype.hasOwnProperty.call(e, t);
}
function _(e) {
	return Object.prototype.hasOwnProperty.call(r, e);
}
function v(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function y(e) {
	return [...e].sort((e, t) => {
		let n = e.path.localeCompare(t.path);
		return n === 0 ? e.reason.localeCompare(t.reason) : n;
	});
}
function b(e, t) {
	let n = e.toLowerCase();
	return t.map((e) => ({
		candidate: e,
		distance: x(n, e.toLowerCase())
	})).filter(({ candidate: e, distance: t }) => t <= Math.max(2, Math.floor(e.length / 3))).sort((e, t) => e.distance - t.distance || e.candidate.localeCompare(t.candidate)).slice(0, 3).map(({ candidate: e }) => e);
}
function x(e, t) {
	let n = Array.from({ length: t.length + 1 }, (e, t) => t);
	for (let r = 0; r < e.length; r += 1) {
		let i = [r + 1];
		for (let a = 0; a < t.length; a += 1) i[a + 1] = Math.min(i[a] + 1, n[a + 1] + 1, n[a] + (e[r] === t[a] ? 0 : 1));
		n.splice(0, n.length, ...i);
	}
	return n[t.length] ?? 0;
}
//#endregion
export { n as componentThemeShadcnColorAliasEntries, l as normalizeComponentThemePropertyAliases };

import { componentThemeShadcnColorAliasEntries as e, normalizeComponentThemePropertyAliases as t } from "./theme-aliases.js";
var n = Object.freeze(Object.fromEntries(e)), r = /([^{}]+)\{([^{}]*)\}/g, i = /\/\*[\s\S]*?\*\//g, a = /^--([A-Za-z0-9_-]+)\s*:\s*([\s\S]+)$/u;
function o(e, t = "themeCss") {
	let n = {
		light: void 0,
		dark: void 0
	}, a = [], o = e.replace(i, ""), c = 0, u = 0;
	for (let e of o.matchAll(r)) {
		let r = e[1]?.trim() ?? "", i = l(r);
		if (!i) {
			a.push({
				path: `${t}.selector[${u}]`,
				reason: "unsupported-theme-css-selector",
				message: "Theme CSS import only supports :root and .dark variable blocks.",
				selector: r,
				recovery: "Paste shadcn theme variables inside a :root or .dark block."
			}), u += 1;
			continue;
		}
		c += 1;
		let o = s(e[2] ?? "", i, t);
		a.push(...o.diagnostics), o.overrides && (n[i] = o.overrides), u += 1;
	}
	return c === 0 && a.push({
		path: t,
		reason: "theme-css-block-not-found",
		message: "Theme CSS import did not contain a supported :root or .dark block.",
		recovery: "Paste a shadcn :root block, .dark block, or both blocks before importing."
	}), a.length > 0 ? {
		ok: !1,
		diagnostics: d(a)
	} : {
		ok: !0,
		value: {
			...n.light ? { light: n.light } : {},
			...n.dark ? { dark: n.dark } : {}
		}
	};
}
function s(e, r, i) {
	let o = e.split(";"), s = {}, l = {}, f = [];
	o.forEach((e, t) => {
		let o = e.trim();
		if (!o) return;
		let d = a.exec(o);
		if (!d) {
			f.push({
				path: `${i}.${r}.declaration[${t}]`,
				reason: "unsupported-theme-css-declaration",
				message: "Theme CSS import only supports CSS custom property declarations.",
				declarationIndex: t,
				recovery: "Remove non-variable CSS declarations before importing theme data."
			});
			return;
		}
		let p = d[1] ?? "", m = (d[2] ?? "").trim();
		if (p === "radius") {
			c(s, m);
			return;
		}
		let h = n[p];
		if (h && l[h] !== void 0 && l[h] !== m) {
			f.push(u(i, r, p, h));
			return;
		}
		s[p] = m, h && (l[h] = m);
	});
	let p = t(s, `${i}.${r}`);
	return p.ok ? {
		overrides: p.value,
		diagnostics: d(f)
	} : (f.push(...p.diagnostics), { diagnostics: d(f) });
}
function c(e, t) {
	e.radius = {
		sm: `calc(${t} - 4px)`,
		md: `calc(${t} - 2px)`,
		lg: t,
		xl: `calc(${t} + 4px)`,
		full: "9999px"
	};
}
function l(e) {
	if (e === ":root") return "light";
	if (e === ".dark") return "dark";
}
function u(e, t, n, r) {
	return {
		path: `${e}.${t}.${n}`,
		reason: "conflicting-theme-property-alias",
		message: "Component theme payload contains conflicting values for the same canonical role.",
		group: "color",
		key: r,
		aliasKey: n,
		canonicalKey: `color.${r}`,
		recovery: `Keep only one value for color.${r}, or make repeated shadcn CSS variable values match.`
	};
}
function d(e) {
	return [...e].sort((e, t) => {
		let n = e.path.localeCompare(t.path);
		return n === 0 ? e.reason.localeCompare(t.reason) : n;
	});
}
//#endregion
export { o as parseShadcnThemeCssBlocks };

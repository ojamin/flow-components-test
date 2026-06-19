//#region src/sdk/theme-color-utils.ts
function e(e) {
	let t = e.trim().toLowerCase();
	if (t) return n(t) ?? r(t) ?? i(t) ?? o(t);
}
function t(e) {
	return e.alpha < 1 ? `rgba(${e.red}, ${e.green}, ${e.blue}, ${v(e.alpha)})` : `#${_(e.red)}${_(e.green)}${_(e.blue)}`;
}
function n(e) {
	let t = e.startsWith("#") ? e.slice(1) : "";
	if (t) {
		if (/^[0-9a-f]{3,4}$/.test(t)) {
			let [e = "0", n = "0", r = "0", i = "f"] = t.split("");
			return {
				red: Number.parseInt(`${e}${e}`, 16),
				green: Number.parseInt(`${n}${n}`, 16),
				blue: Number.parseInt(`${r}${r}`, 16),
				alpha: Number.parseInt(`${i}${i}`, 16) / 255
			};
		}
		if (/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(t)) return {
			red: Number.parseInt(t.slice(0, 2), 16),
			green: Number.parseInt(t.slice(2, 4), 16),
			blue: Number.parseInt(t.slice(4, 6), 16),
			alpha: t.length === 8 ? Number.parseInt(t.slice(6, 8), 16) / 255 : 1
		};
	}
}
function r(e) {
	let t = /^rgba?\((.+)\)$/.exec(e);
	if (!t?.[1]) return;
	let n = t[1].includes(",") ? t[1].split(",").map((e) => e.trim()) : t[1].replace("/", " / ").split(/\s+/).filter(Boolean), r = n.indexOf("/"), i = r === -1 ? n.slice(0, 3) : n.slice(0, r), a = r === -1 ? n[3] : n[r + 1];
	if (i.length !== 3) return;
	let o = i.map(f);
	if (o.some((e) => e === void 0)) return;
	let s = a === void 0 ? 1 : p(a);
	if (s !== void 0) return {
		red: o[0],
		green: o[1],
		blue: o[2],
		alpha: s
	};
}
function i(e) {
	let t = l(e.startsWith("hsl(") && e.endsWith(")") ? e.slice(4, -1) : e), n = t.indexOf("/"), r = n === -1 ? t.slice(0, 3) : t.slice(0, n), i = n === -1 ? t[3] : t[n + 1];
	if (r.length !== 3) return;
	let o = u(r[0] ?? ""), s = m(r[1] ?? ""), c = m(r[2] ?? ""), d = i === void 0 ? 1 : p(i);
	if ([
		o,
		s,
		c,
		d
	].every((e) => Number.isFinite(e))) return a(o, s, c, d);
}
function a(e, t, n, r) {
	let i = (1 - Math.abs(2 * n - 1)) * t, a = (e % 360 + 360) % 360 / 60, o = i * (1 - Math.abs(a % 2 - 1)), [s, c, l] = a < 1 ? [
		i,
		o,
		0
	] : a < 2 ? [
		o,
		i,
		0
	] : a < 3 ? [
		0,
		i,
		o
	] : a < 4 ? [
		0,
		o,
		i
	] : a < 5 ? [
		o,
		0,
		i
	] : [
		i,
		0,
		o
	], u = n - i / 2;
	return {
		red: g((s + u) * 255),
		green: g((c + u) * 255),
		blue: g((l + u) * 255),
		alpha: h(r)
	};
}
function o(e) {
	let t = /^oklch\((.+)\)$/.exec(e);
	if (!t?.[1]) return;
	let n = l(t[1]), r = n.indexOf("/"), i = r === -1 ? n.slice(0, 3) : n.slice(0, r), a = r === -1 ? n[3] : n[r + 1];
	if (i.length !== 3) return;
	let o = d(i[0] ?? ""), c = Number(i[1]), f = u(i[2] ?? ""), m = a === void 0 ? 1 : p(a);
	if ([
		o,
		c,
		f,
		m
	].every((e) => e !== void 0 && Number.isFinite(e))) return s(o, c, f, m);
}
function s(e, t, n, r) {
	let i = n * Math.PI / 180, a = t * Math.cos(i), o = t * Math.sin(i), s = e + .3963377774 * a + .2158037573 * o, l = e - .1055613458 * a - .0638541728 * o, u = e - .0894841775 * a - 1.291485548 * o, d = s ** 3, f = l ** 3, p = u ** 3;
	return {
		red: c(4.0767416621 * d - 3.3077115913 * f + .2309699292 * p),
		green: c(-1.2684380046 * d + 2.6097574011 * f - .3413193965 * p),
		blue: c(-.0041960863 * d - .7034186147 * f + 1.707614701 * p),
		alpha: h(r)
	};
}
function c(e) {
	let t = h(e), n = t <= .0031308 ? 12.92 * t : 1.055 * t ** (1 / 2.4) - .055;
	return Math.round(h(n) * 255);
}
function l(e) {
	return e.replace(/,/g, " ").replace("/", " / ").split(/\s+/).filter(Boolean);
}
function u(e) {
	return e.endsWith("deg") ? Number(e.slice(0, -3)) : e.endsWith("rad") ? Number(e.slice(0, -3)) * 180 / Math.PI : e.endsWith("grad") ? Number(e.slice(0, -4)) * .9 : e.endsWith("turn") ? Number(e.slice(0, -4)) * 360 : Number(e);
}
function d(e) {
	if (e.endsWith("%")) return m(e);
	let t = Number(e);
	if (Number.isFinite(t)) return t;
}
function f(e) {
	let t = e.endsWith("%") ? m(e) * 255 : Number(e);
	if (Number.isFinite(t)) return g(t);
}
function p(e) {
	let t = e.endsWith("%") ? m(e) : Number(e);
	if (Number.isFinite(t)) return h(t);
}
function m(e) {
	return e.endsWith("%") ? Number(e.slice(0, -1)) / 100 : NaN;
}
function h(e) {
	return Math.min(1, Math.max(0, e));
}
function g(e) {
	return Math.round(Math.min(255, Math.max(0, e)));
}
function _(e) {
	return g(e).toString(16).padStart(2, "0");
}
function v(e) {
	return Number(h(e).toFixed(4)).toString();
}
//#endregion
export { t as formatComponentThemeCanvasColor, e as parseComponentThemeCssColor };

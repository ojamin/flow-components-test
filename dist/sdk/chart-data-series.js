import { getDataTypeSchema as e } from "./data-types.js";
import { deriveChartFieldOptions as t, validateChartFieldSelection as n } from "./chart-data-helpers.js";
//#region src/sdk/chart-data-series.ts
function r(t) {
	let n = e(t);
	if (!n) throw Error(`Missing canonical data type schema "${t}".`);
	return n;
}
var i = r("chart-series-xy");
function a(e, t, n) {
	return {
		tone: e,
		title: t,
		description: n
	};
}
function o(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function s(e) {
	return e.trim();
}
function c(e) {
	return e.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
}
function l(e, t) {
	let n = c(t);
	if (n.length === 0) return { ok: !1 };
	let r = e;
	for (let e of n) {
		if (r === null) return { ok: !1 };
		if (Array.isArray(r)) {
			let t = Number(e);
			if (!Number.isInteger(t) || t < 0 || t >= r.length) return { ok: !1 };
			r = r[t];
		} else if (typeof r == "object") {
			if (!Object.prototype.hasOwnProperty.call(r, e)) return { ok: !1 };
			r = r[e];
		} else return { ok: !1 };
	}
	return {
		ok: !0,
		value: r
	};
}
function u(e) {
	if (o(e)) return e;
	if (typeof e == "string") {
		let t = e.trim();
		return t.length > 0 ? t : null;
	}
	return typeof e == "boolean" ? String(e) : null;
}
function d(e, t, n, r) {
	return e.length === 0 ? {
		ok: !1,
		error: "No rows produced chartable values for the selected fields.",
		data: e,
		totalRowCount: t,
		skippedRowCount: t,
		state: a("empty", "No chartable rows", "The selected fields are valid, but no row currently produces a complete chart point.")
	} : r.safeParse(e).success ? {
		ok: !0,
		error: null,
		data: e,
		totalRowCount: t,
		skippedRowCount: t - e.length,
		state: a("ready", null, null)
	} : {
		ok: !1,
		error: n,
		data: [],
		totalRowCount: t,
		skippedRowCount: t,
		state: a("error", "Chart data is invalid", n)
	};
}
function f(e, r, c, f = t(e)) {
	let p = n(f, "x", r);
	if (!p.ok) return {
		ok: !1,
		error: p.error,
		data: [],
		totalRowCount: e.length,
		skippedRowCount: e.length,
		state: a("error", "Choose a valid X field", p.error)
	};
	let m = n(f, "y", c);
	if (!m.ok) return {
		ok: !1,
		error: m.error,
		data: [],
		totalRowCount: e.length,
		skippedRowCount: e.length,
		state: a("error", "Choose a valid Y field", m.error)
	};
	let h = e.flatMap((e) => {
		let t = l(e, s(r)), n = l(e, s(c)), i = t.ok ? u(t.value) : null, a = n.ok && o(n.value) ? n.value : null;
		return i !== null && a !== null ? [{
			x: i,
			y: a
		}] : [];
	}), g = h.some((e) => typeof e.x != "number");
	return d(h.map((e, t) => g ? {
		x: t,
		y: e.y,
		xLabel: String(e.x)
	} : {
		x: e.x,
		y: e.y,
		xLabel: null
	}), e.length, "Mapped chart points must contain a string-or-number X value and a finite numeric Y value.", i);
}
//#endregion
export { f as mapRowsToChartSeriesXy };

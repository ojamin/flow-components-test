import { getDataTypeSchema as e } from "./data-types.js";
import { deriveChartFieldOptions as t, deriveSelectedChartFieldOptions as n, mapRowsToChartSlices as r, validateChartFieldSelection as i } from "./chart-data-helpers.js";
//#region src/sdk/chart-derivation-helpers.ts
var a = o("chart-series-xy");
function o(t) {
	let n = e(t);
	if (!n) throw Error(`Missing canonical data type schema "${t}".`);
	return n;
}
function s(e) {
	return e.trim();
}
function c(e, t, n) {
	return {
		tone: e,
		title: t,
		description: n
	};
}
function l(e) {
	return e.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
}
function u(e, t) {
	let n = l(t);
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
function d(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function f(e) {
	if (d(e)) return e;
	if (typeof e == "string") {
		let t = e.trim();
		return t.length > 0 ? t : null;
	}
	return typeof e == "boolean" ? String(e) : null;
}
function p(e, t, n, r) {
	return e.length === 0 ? {
		ok: !1,
		error: "No rows produced chartable values for the selected fields.",
		data: e,
		totalRowCount: t,
		skippedRowCount: t,
		state: c("empty", "No chartable rows", "The selected fields are valid, but no row currently produces a complete chart point.")
	} : r.safeParse(e).success ? {
		ok: !0,
		error: null,
		data: e,
		totalRowCount: t,
		skippedRowCount: t - e.length,
		state: c("ready", null, null)
	} : {
		ok: !1,
		error: n,
		data: [],
		totalRowCount: t,
		skippedRowCount: t,
		state: c("error", "Chart data is invalid", n)
	};
}
function m(e, t, r, o = n(e, [{
	role: "x",
	path: t
}, {
	role: "y",
	path: r
}]), l, m = e.length) {
	let h = i(o, "x", t);
	if (!h.ok) return {
		ok: !1,
		error: h.error,
		data: [],
		totalRowCount: m,
		skippedRowCount: m,
		state: c("error", "Choose a valid X field", h.error)
	};
	let g = i(o, "y", r);
	if (!g.ok) return {
		ok: !1,
		error: g.error,
		data: [],
		totalRowCount: m,
		skippedRowCount: m,
		state: c("error", "Choose a valid Y field", g.error)
	};
	let _ = typeof l == "number" && Number.isFinite(l) && l > 0 ? Math.floor(l) : null, v = [];
	for (let n of e) {
		if (_ !== null && v.length >= _) break;
		let e = u(n, s(t)), i = u(n, s(r)), a = e.ok ? f(e.value) : null, o = i.ok && d(i.value) ? i.value : null;
		a !== null && o !== null && v.push({
			x: a,
			y: o
		});
	}
	let y = v.some((e) => typeof e.x != "number");
	return p(v.map((e, t) => y ? {
		x: t,
		y: e.y,
		xLabel: String(e.x)
	} : {
		x: e.x,
		y: e.y,
		xLabel: null
	}), m, "Mapped chart points must contain a string-or-number X value and a finite numeric Y value.", a);
}
function h(e) {
	return {
		id: e.path,
		path: e.path,
		label: e.label,
		sampleValue: e.sampleValue,
		availableRowCount: e.availableRowCount,
		numericRowCount: e.numericRowCount,
		categoricalRowCount: e.categoricalRowCount,
		supportedRoles: [...e.supportedRoles]
	};
}
function g(e, r = {}) {
	return (r.selections ? n(e, r.selections) : t(e)).map(h);
}
function _(e, t) {
	if (t.kind === "xy") {
		let r = m(e, t.xField, t.yField, [...t.fieldOptions ?? n(e, [{
			role: "x",
			path: t.xField
		}, {
			role: "y",
			path: t.yField
		}])], t.maxMappedRows, t.totalRowCount);
		return {
			kind: "xy",
			ok: r.ok,
			error: r.error,
			data: r.data,
			fields: {
				x: t.xField,
				y: t.yField
			},
			totalRowCount: r.totalRowCount,
			skippedRowCount: r.skippedRowCount,
			state: r.state
		};
	}
	let i = r(e, t.labelField, t.valueField, [...t.fieldOptions ?? n(e, [{
		role: "label",
		path: t.labelField
	}, {
		role: "value",
		path: t.valueField
	}])]), a = t.totalRowCount ?? i.totalRowCount;
	return {
		kind: "slice",
		ok: i.ok,
		error: i.error,
		data: i.data,
		fields: {
			label: t.labelField,
			value: t.valueField
		},
		totalRowCount: a,
		skippedRowCount: Math.max(0, a - i.data.length),
		state: i.state
	};
}
//#endregion
export { g as deriveDatasetChartFieldOptions, _ as deriveDatasetChartSeriesMapping };

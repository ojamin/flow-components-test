import { getDataTypeSchema as e } from "./data-types.js";
import { formatJsonPrimitive as t, formatStructuredKeyLabel as n, resolveStructuredDataPath as r, validateTableRows as i } from "./structured-data-helpers.js";
//#region src/sdk/chart-data-helpers.ts
function a(t) {
	let n = e(t);
	if (!n) throw Error(`Missing canonical data type schema "${t}".`);
	return n;
}
var o = a("chart-slices");
function s(e, t, n) {
	return {
		tone: e,
		title: t,
		description: n
	};
}
function c(e) {
	return e.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean).map((e) => n(e, "start-case")).join(" · ");
}
function l(e) {
	return e.trim().length > 0 ? c(e) : "Root array";
}
function u(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function d(e) {
	return e === !0 || e === !1 || u(e) || typeof e == "string" && e.trim().length > 0;
}
function f(e, n, r, i) {
	if (Array.isArray(e)) {
		e.forEach((e, t) => {
			f(e, `${n}[${t}]`, r, i);
		});
		return;
	}
	if (typeof e == "object" && e) {
		Object.entries(e).forEach(([e, t]) => {
			f(t, n.length > 0 ? `${n}.${e}` : e, r, i);
		});
		return;
	}
	if (n.length === 0 || r.has(n)) return;
	r.add(n);
	let a = i.get(n), o = a ?? {
		path: n,
		label: c(n),
		sampleValue: null,
		availableRowCount: 0,
		numericRowCount: 0,
		categoricalRowCount: 0
	};
	o.availableRowCount += 1, o.sampleValue === null && (o.sampleValue = t(e)), u(e) && (o.numericRowCount += 1), d(e) && (o.categoricalRowCount += 1), a || i.set(n, o);
}
function p(e, n, r) {
	let i = /* @__PURE__ */ new Set();
	n.forEach((n) => {
		let a = g(n.path);
		if (a.length === 0 || i.has(a)) return;
		let o = v(e, a);
		if (!o.ok) return;
		let s = o.value;
		if (s === void 0 || Array.isArray(s) || typeof s == "object" && s) return;
		i.add(a);
		let l = r.get(a), f = l ?? {
			path: a,
			label: c(a),
			sampleValue: null,
			availableRowCount: 0,
			numericRowCount: 0,
			categoricalRowCount: 0
		};
		f.availableRowCount += 1, f.sampleValue === null && (f.sampleValue = t(s)), u(s) && (f.numericRowCount += 1), d(s) && (f.categoricalRowCount += 1), l || r.set(a, f);
	});
}
function m(e) {
	let t = /* @__PURE__ */ new Set();
	return e.categoricalRowCount > 0 && (t.add("x"), t.add("label")), e.numericRowCount > 0 && (t.add("x"), t.add("y"), t.add("label"), t.add("value")), Array.from(t);
}
function h(e) {
	switch (e) {
		case "x": return {
			missing: "Choose an X field before this chart can render.",
			invalid: "The X field must resolve to text, booleans, or finite numbers in the current rows."
		};
		case "y": return {
			missing: "Choose a Y field before this chart can render.",
			invalid: "The Y field must resolve to finite numbers in the current rows."
		};
		case "label": return {
			missing: "Choose a label field before this chart can render.",
			invalid: "The label field must resolve to text, booleans, or finite numbers in the current rows."
		};
		default: return {
			missing: "Choose a value field before this chart can render.",
			invalid: "The value field must resolve to finite numbers in the current rows."
		};
	}
}
function g(e) {
	return e.trim();
}
function _(e) {
	return e.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
}
function v(e, t) {
	let n = _(t);
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
function y(e) {
	if (u(e)) return String(e);
	if (typeof e == "string") {
		let t = e.trim();
		return t.length > 0 ? t : null;
	}
	return typeof e == "boolean" ? String(e) : null;
}
function b(e, t, n, r) {
	return e.length === 0 ? {
		ok: !1,
		error: "No rows produced chartable values for the selected fields.",
		data: e,
		totalRowCount: t,
		skippedRowCount: t,
		state: s("empty", "No chartable rows", "The selected fields are valid, but no row currently produces a complete chart point.")
	} : r.safeParse(e).success ? {
		ok: !0,
		error: null,
		data: e,
		totalRowCount: t,
		skippedRowCount: t - e.length,
		state: s("ready", null, null)
	} : {
		ok: !1,
		error: n,
		data: [],
		totalRowCount: t,
		skippedRowCount: t,
		state: s("error", "Chart data is invalid", n)
	};
}
function x(e, t) {
	if (e === void 0) {
		let e = l(t);
		return {
			ok: !1,
			error: null,
			pathLabel: e,
			rows: [],
			state: s("loading", "Loading chart data", `Waiting for data at ${e} so the chart preview can render as soon as rows arrive.`)
		};
	}
	let n = r(e, t);
	if (!n.ok) return {
		ok: !1,
		error: n.error,
		pathLabel: n.pathLabel,
		rows: [],
		state: s("error", "Rows path unavailable", n.error)
	};
	let a = i(n.value);
	return a.ok ? a.rows.length === 0 ? {
		ok: !1,
		error: null,
		pathLabel: n.pathLabel,
		rows: a.rows,
		state: s("empty", "No rows to chart", `Resolved ${n.pathLabel}, but the array is empty.`)
	} : {
		ok: !0,
		error: null,
		pathLabel: n.pathLabel,
		rows: a.rows,
		state: s("ready", null, null)
	} : {
		ok: !1,
		error: a.error,
		pathLabel: n.pathLabel,
		rows: [],
		state: s("error", "Rows path must resolve to chart rows", a.error)
	};
}
function S(e, t) {
	if (e === void 0) {
		let e = l(t);
		return {
			ok: !1,
			error: null,
			pathLabel: e,
			rows: [],
			state: s("loading", "Loading chart data", `Waiting for data at ${e} so the chart preview can render as soon as rows arrive.`)
		};
	}
	let n = r(e, t);
	if (!n.ok) return {
		ok: !1,
		error: n.error,
		pathLabel: n.pathLabel,
		rows: [],
		state: s("error", "Rows path unavailable", n.error)
	};
	if (!Array.isArray(n.value)) {
		let e = "Rows path must resolve to an array of objects.";
		return {
			ok: !1,
			error: e,
			pathLabel: n.pathLabel,
			rows: [],
			state: s("error", "Rows path must resolve to chart rows", e)
		};
	}
	return n.value.length === 0 ? {
		ok: !1,
		error: null,
		pathLabel: n.pathLabel,
		rows: n.value,
		state: s("empty", "No rows to chart", `Resolved ${n.pathLabel}, but the array is empty.`)
	} : {
		ok: !0,
		error: null,
		pathLabel: n.pathLabel,
		rows: n.value,
		state: s("ready", null, null)
	};
}
function C(e, t) {
	let n = i(e);
	return n.ok ? {
		ok: !0,
		rows: n.rows
	} : {
		ok: !1,
		error: `Rows at ${w(t)} are invalid: ${n.error ?? "Rows must be an array of row objects."}`
	};
}
function w(e) {
	let t = e.trim();
	return t.length === 0 || t === "__root__" || t === "$" ? "Root array" : t.startsWith("$.") ? l(t.slice(2)) : l(t);
}
function T(e, t, n, r) {
	if (Array.isArray(e)) {
		let a = i(e);
		if (a.ok) {
			n.push({
				path: t,
				pathLabel: t.trim().length > 0 ? t : "(root)",
				label: l(t),
				rowCount: a.rows.length,
				...r.includeFieldCount ? { fieldCount: O(a.rows).length } : {}
			});
			return;
		}
		e.forEach((e, i) => {
			(Array.isArray(e) || typeof e == "object" && e) && T(e, `${t}[${i}]`, n, r);
		});
		return;
	}
	typeof e == "object" && e && Object.entries(e).forEach(([e, i]) => {
		T(i, t.length > 0 ? `${t}.${e}` : e, n, r);
	});
}
function E(e, t = {}) {
	if (e === void 0) return [];
	let n = [];
	return T(e, "", n, { includeFieldCount: t.includeFieldCount ?? !0 }), Array.from(new Map(n.map((e) => [e.path, e])).values()).sort((e, t) => e.path.length === 0 ? -1 : t.path.length === 0 ? 1 : e.path.length - t.path.length || e.path.localeCompare(t.path));
}
function D(e) {
	let t = [`${e.rowCount} rows`];
	return e.fieldCount !== void 0 && t.push(`${e.fieldCount} fields`), `${e.label} · ${t.join(" · ")}`;
}
function O(e) {
	let t = /* @__PURE__ */ new Map();
	return e.forEach((e) => {
		f(e, "", /* @__PURE__ */ new Set(), t);
	}), Array.from(t.values()).map((e) => ({
		path: e.path,
		label: e.label,
		sampleValue: e.sampleValue,
		availableRowCount: e.availableRowCount,
		numericRowCount: e.numericRowCount,
		categoricalRowCount: e.categoricalRowCount,
		supportedRoles: m(e)
	}));
}
function k(e, t) {
	let n = Array.from(new Map(t.map((e) => [g(e.path), e]).filter(([e]) => e.length > 0)).values()), r = /* @__PURE__ */ new Map();
	return e.forEach((e) => {
		p(e, n, r);
	}), n.flatMap((e) => {
		let t = r.get(g(e.path));
		return t ? [{
			path: t.path,
			label: t.label,
			sampleValue: t.sampleValue,
			availableRowCount: t.availableRowCount,
			numericRowCount: t.numericRowCount,
			categoricalRowCount: t.categoricalRowCount,
			supportedRoles: m(t)
		}] : [];
	});
}
function A(e, t) {
	return e.filter((e) => e.supportedRoles.includes(t));
}
function j(e) {
	let t = [`${e.availableRowCount} rows`];
	return e.sampleValue !== null && t.unshift(`sample ${e.sampleValue}`), `${e.label} · ${t.join(" · ")}`;
}
function M(e, t, n) {
	let r = g(n), i = h(t);
	if (r.length === 0) return {
		ok: !1,
		error: i.missing
	};
	let a = e.find((e) => e.path === r);
	return a ? a.supportedRoles.includes(t) ? {
		ok: !0,
		error: null,
		option: a
	} : {
		ok: !1,
		error: i.invalid
	} : {
		ok: !1,
		error: `The current rows do not expose "${r}" as a selectable field yet.`
	};
}
function N(e, t, n) {
	let r = M(e, t, n);
	return r.ok ? r.option.path : A(e, t)[0]?.path ?? "";
}
function P(e, t, n, r = k(e, [{
	role: "label",
	path: t
}, {
	role: "value",
	path: n
}])) {
	let i = M(r, "label", t);
	if (!i.ok) return {
		ok: !1,
		error: i.error,
		data: [],
		totalRowCount: e.length,
		skippedRowCount: e.length,
		state: s("error", "Choose a valid label field", i.error)
	};
	let a = M(r, "value", n);
	return a.ok ? b(e.flatMap((e) => {
		let r = v(e, g(t)), i = v(e, g(n)), a = r.ok ? y(r.value) : null, o = i.ok && u(i.value) ? i.value : null;
		return a !== null && o !== null ? [{
			label: a,
			value: o
		}] : [];
	}), e.length, "Mapped chart slices must contain a non-empty label and a finite numeric value.", o) : {
		ok: !1,
		error: a.error,
		data: [],
		totalRowCount: e.length,
		skippedRowCount: e.length,
		state: s("error", "Choose a valid value field", a.error)
	};
}
//#endregion
export { O as deriveChartFieldOptions, E as deriveChartRowsPathOptions, k as deriveSelectedChartFieldOptions, A as filterChartFieldOptions, j as formatChartFieldOptionSummary, D as formatChartRowsPathOptionSummary, P as mapRowsToChartSlices, x as resolveChartRows, S as resolveServiceChartRows, N as suggestChartFieldPath, M as validateChartFieldSelection, C as validateServiceChartRows };

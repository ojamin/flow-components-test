//#region src/sdk/structured-data-helpers.ts
function e(e, t = 96) {
	let n = JSON.stringify(e);
	return n.length <= t ? n : `${n.slice(0, t - 1)}…`;
}
function t(e, t) {
	let n = t.split("."), r = e;
	for (let e of n) {
		if (typeof r != "object" || !r || Array.isArray(r)) return {
			ok: !1,
			error: `Could not resolve path "${t}".`
		};
		if (!Object.prototype.hasOwnProperty.call(r, e)) return {
			ok: !1,
			error: `Binding path could not resolve property '${e}'.`
		};
		r = r[e];
	}
	return {
		ok: !0,
		value: r
	};
}
function n(e, n) {
	let r = n.trim(), i = r.length > 0 ? r : "(root)";
	if (e === void 0) return {
		ok: !1,
		error: "Connect data to inspect this view.",
		pathLabel: i,
		value: void 0
	};
	if (r.length === 0) return {
		ok: !0,
		error: null,
		pathLabel: i,
		value: e
	};
	let a = t(e, r);
	return a.ok ? {
		ok: !0,
		error: null,
		pathLabel: i,
		value: a.value
	} : {
		ok: !1,
		error: a.error ?? `Could not resolve path "${r}".`,
		pathLabel: i,
		value: void 0
	};
}
function r(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function i(e, n) {
	let r = n.trim();
	return r.length === 0 ? {
		ok: !0,
		value: e
	} : t(e, r);
}
function a(e) {
	return Array.isArray(e) ? "array" : e === null ? "null" : typeof e == "object" ? "object" : typeof e;
}
function o(e) {
	return typeof e == "string" ? JSON.stringify(e) : e === null ? "null" : String(e);
}
function s(e) {
	return JSON.stringify(e, null, 2);
}
function c(e, t = {}) {
	if (!Array.isArray(e)) return {
		ok: !1,
		error: "Rows path must resolve to an array of objects.",
		rows: []
	};
	let n = Math.max(0, Math.floor(t.startIndex ?? 0)), i = t.maxRows !== void 0, a = i ? Math.min(e.length, n + Math.max(0, Math.floor(t.maxRows ?? 0))) : e.length, o = i ? e.slice(n, a) : e, s = o.findIndex((e) => !r(e));
	return s >= 0 ? {
		ok: !1,
		error: `Row ${n + s + 1} must be an object to render a table.`,
		rows: []
	} : {
		ok: !0,
		error: null,
		rows: o
	};
}
function l(e, t, n) {
	if (t === "selected") return Array.from(new Set(n.map((e) => e.trim()).filter(Boolean)));
	let r = /* @__PURE__ */ new Set(), i = [];
	return e.forEach((e) => {
		Object.keys(e).forEach((e) => {
			r.has(e) || (r.add(e), i.push(e));
		});
	}), i;
}
function u(e, t) {
	let n = Array.isArray(e) ? e.length : 0, r = d(n, t), i = c(e, r ?? {});
	return i.ok ? {
		ok: !0,
		error: null,
		columns: l(i.rows, t.columnsMode, t.selectedColumns),
		rows: i.rows,
		rowCount: n,
		validatedRange: f(n, r)
	} : {
		ok: !1,
		error: i.error,
		columns: [],
		rows: [],
		rowCount: n,
		validatedRange: f(n, r)
	};
}
function d(e, t) {
	if (t.columnsMode !== "auto") return {
		startIndex: Math.max(0, Math.floor(t.visibleStartIndex ?? 0)),
		maxRows: Math.max(0, Math.floor(t.visibleRowCount ?? 0))
	};
}
function f(e, t) {
	if (t === void 0) return e > 0 ? {
		startIndex: 0,
		rowCount: e
	} : null;
	let n = Math.max(0, Math.floor(t.startIndex ?? 0)), r = Math.max(0, Math.floor(t.maxRows ?? e));
	return {
		startIndex: n,
		rowCount: Math.max(0, Math.min(e, n + r) - n)
	};
}
function p(e, t) {
	if (t === "none") return e;
	let n = e.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_.-]+/g, " ").replace(/\s+/g, " ").trim();
	return n.length === 0 ? e : t === "uppercase" ? n.toUpperCase() : n.split(" ").map((e) => `${e.charAt(0).toUpperCase()}${e.slice(1).toLowerCase()}`).join(" ");
}
function m(e) {
	return e == null || typeof e == "string" && e.trim() === "";
}
//#endregion
export { l as deriveTableColumns, u as deriveTableMetadata, e as formatCompactJsonValue, o as formatJsonPrimitive, p as formatStructuredKeyLabel, a as getJsonValueKind, m as isBlankStructuredValue, r as isJsonObjectRecord, i as resolveJsonPath, n as resolveStructuredDataPath, s as stringifyJsonValue, c as validateTableRows };

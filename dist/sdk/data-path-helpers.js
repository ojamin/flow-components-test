//#region src/sdk/data-path-helpers.ts
var e = /^[A-Za-z_$][\w$]*$/;
function t(e) {
	return e === "$" || e.startsWith("$.") || e.startsWith("$[") ? e : e.length === 0 ? "$" : e.startsWith("[") ? `$${e}` : `$.${e}`;
}
function n(e) {
	return e === "$" ? "" : e.startsWith("$.") ? e.slice(2) : e.startsWith("$[") ? e.slice(1) : e;
}
function r(e, t = "jsonpath") {
	return i(e, t).ok;
}
function i(e, n = "jsonpath") {
	let r = n === "jsonpath" ? e : t(e);
	if (r.trim() !== r || !r.startsWith("$")) return l(e, "Path must start with $ and cannot include surrounding spaces.");
	let i = [], a = 1;
	for (; a < r.length;) {
		let t = r[a];
		if (t === ".") {
			let t = /^[A-Za-z_$][\w$]*/.exec(r.slice(a + 1));
			if (!t) return l(e, "Path contains an invalid property segment.");
			i.push({
				kind: "property",
				key: t[0]
			}), a += t[0].length + 1;
			continue;
		}
		if (t === "[") {
			let t = r.indexOf("]", a + 1);
			if (t < 0) return l(e, "Path contains an unterminated bracket segment.");
			let n = r.slice(a + 1, t);
			if (n === "*") i.push({ kind: "wildcard" });
			else if (/^\d+$/.test(n)) i.push({
				kind: "index",
				index: Number.parseInt(n, 10)
			});
			else return l(e, "Path bracket segments support indexes or * only.");
			a = t + 1;
			continue;
		}
		return l(e, "Path contains unsupported syntax.");
	}
	return {
		ok: !0,
		path: r,
		tokens: i,
		issueKind: null,
		message: null
	};
}
function a(e, t) {
	if (e === void 0) return {
		ok: !1,
		value: void 0,
		issueKind: "unsupported-source",
		message: "No data source is available for this path."
	};
	let n = i(t, t.startsWith("$") ? "jsonpath" : "relative");
	return n.ok ? c(e, n.tokens, t) : {
		ok: !1,
		value: void 0,
		issueKind: n.issueKind,
		message: n.message
	};
}
function o(e, n = "relative") {
	let r = e.reduce((e, t) => t.kind === "property" ? e.length === 0 ? t.key : `${e}.${t.key}` : `${e}${t.kind === "index" ? `[${t.index}]` : "[*]"}`, "");
	return n === "jsonpath" ? t(r) : r;
}
function s(t) {
	return e.test(t);
}
function c(e, t, n) {
	if (t.length === 0) return {
		ok: !0,
		value: e,
		issueKind: null,
		message: null
	};
	let [r, ...i] = t;
	if (!r) return {
		ok: !0,
		value: e,
		issueKind: null,
		message: null
	};
	if (r.kind === "property") return typeof e != "object" || !e || Array.isArray(e) || !Object.prototype.hasOwnProperty.call(e, r.key) ? u(n, `Path could not resolve property "${r.key}".`) : c(e[r.key], i, n);
	if (r.kind === "index") return !Array.isArray(e) || r.index >= e.length ? u(n, `Path could not resolve index ${r.index}.`) : c(e[r.index], i, n);
	if (!Array.isArray(e)) return u(n, "Wildcard selection requires an array value.");
	let a = [];
	for (let t of e) {
		let e = c(t, i, n);
		e.ok && e.value !== void 0 && a.push(e.value);
	}
	return {
		ok: !0,
		value: a,
		issueKind: null,
		message: null
	};
}
function l(e, t) {
	return {
		ok: !1,
		path: e,
		tokens: [],
		issueKind: "invalid-syntax",
		message: t
	};
}
function u(e, t) {
	return {
		ok: !1,
		value: void 0,
		issueKind: "missing-data",
		message: `${t} (${e})`
	};
}
//#endregion
export { o as formatDataPathTokens, s as isSafeDataPathProperty, r as isValidDataPath, t as normalizeToJsonPath, n as normalizeToRelativePath, a as resolveDataPath, i as validateDataPath };

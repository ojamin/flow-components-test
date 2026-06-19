import e from "dompurify";
//#region src/sdk/helpers/sanitization/index.ts
var t = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
}, n = {
	ALLOW_DATA_ATTR: !1,
	ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
	FORBID_TAGS: [
		"embed",
		"foreignObject",
		"form",
		"head",
		"html",
		"iframe",
		"math",
		"object",
		"script",
		"style",
		"svg"
	],
	USE_PROFILES: { html: !0 }
};
function r() {
	return globalThis.window ?? null;
}
function i(t) {
	if (!t) return null;
	try {
		let n = e(t);
		return (e, t) => n.sanitize(e, t);
	} catch {
		return null;
	}
}
function a(e) {
	return e.replace(/[&<>"']/g, (e) => t[e] ?? e);
}
function o(e, t = {}) {
	let o = t.window === void 0 ? r() : t.window, s = t.sanitizer ?? i(o);
	if (!s) {
		let t = a(e);
		return {
			error: null,
			html: t,
			usedFallback: !0,
			wasSanitized: t !== e
		};
	}
	try {
		let t = s(e, n);
		return {
			error: null,
			html: t,
			usedFallback: !1,
			wasSanitized: t !== e
		};
	} catch {
		return {
			error: "HTML sanitizer failed.",
			html: a(e),
			usedFallback: !0,
			wasSanitized: !0
		};
	}
}
function s(e, t = {}) {
	return o(e, t).html;
}
//#endregion
export { a as escapeHtml, s as sanitizeHtml, o as sanitizeHtmlToResult };

//#region src/sdk/helpers/browser/index.ts
function e() {
	let e = globalThis;
	return {
		document: e.document ?? null,
		navigator: e.navigator ?? null,
		window: e.window ?? (e.open ? e : null)
	};
}
function t() {
	let e = globalThis;
	return typeof e.fetch == "function" ? e.fetch.bind(e) : null;
}
function n(t) {
	return t ?? e();
}
function r(e) {
	let t = n(e);
	return !!(t.window && t.document);
}
function i(e = {}, t) {
	let r = n(t), i = null;
	try {
		i = r.document?.createElement?.("canvas") ?? null;
	} catch {
		return null;
	}
	return !i || !("width" in i) || !("height" in i) ? null : (e.width !== void 0 && (i.width = e.width), e.height !== void 0 && (i.height = e.height), i);
}
async function a(e, n, r = {}, i = t()) {
	if (!i) throw Error("Fetch API is unavailable in this environment.");
	return i(e, {
		method: r.method ?? "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(n)
	});
}
function o(e, t = "_blank", r) {
	let i = n(r);
	return typeof i.window?.open == "function" ? (i.window.open(e, t), !0) : !1;
}
function s(e, t, r) {
	let i = n(r), a = i.document?.createElement?.("a");
	if (!a || typeof a.click != "function" || !i.document?.body) return !1;
	let o = new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), s = URL.createObjectURL(o);
	try {
		return a.href = s, a.download = e.endsWith(".json") ? e : `${e}.json`, i.document.body.appendChild?.(a), a.click(), i.document.body.removeChild?.(a), !0;
	} finally {
		URL.revokeObjectURL(s);
	}
}
function c(e, t) {
	let r = n(t), i = null;
	try {
		i = r.document?.getElementById?.(e) ?? null;
	} catch {
		return !1;
	}
	if (!i || typeof i.focus != "function") return !1;
	try {
		i.focus();
	} catch {
		return !1;
	}
	return !0;
}
function l(e, t) {
	return n(t).window?.matchMedia?.(e) ?? null;
}
function u(e) {
	let t = n(e).window?.devicePixelRatio;
	return typeof t == "number" && Number.isFinite(t) && t > 0 ? t : 1;
}
function d(e) {
	let t = n(e), r = t.window?.scrollY ?? t.window?.pageYOffset ?? 0;
	return typeof r == "number" && Number.isFinite(r) ? Math.max(0, r) : 0;
}
function f(e, t, r, i) {
	let a = n(i);
	return typeof a.window?.addEventListener == "function" ? (a.window.addEventListener(e, t, r), !0) : !1;
}
function p(e, t, r, i) {
	n(i).window?.removeEventListener?.(e, t, r);
}
function m(e, t) {
	return n(t).window?.requestAnimationFrame?.(e) ?? null;
}
function h(e, t) {
	e != null && n(t).window?.cancelAnimationFrame?.(e);
}
function g(e, t, r) {
	return n(r).window?.setTimeout?.(e, t) ?? null;
}
function _(e, t) {
	e != null && n(t).window?.clearTimeout?.(e);
}
function v(e, t, n, r) {
	return _(e, r), g(t, n, r);
}
function y(e, t) {
	return _(e, t), null;
}
function b(e) {
	let t = n(e);
	return t.window?.isSecureContext === !0 ? typeof t.navigator?.clipboard?.writeText == "function" ? { available: !0 } : {
		available: !1,
		message: "Clipboard writes are not available in this browser.",
		reason: "unsupported"
	} : {
		available: !1,
		message: "Clipboard writes require a secure browser context.",
		reason: "insecure-context"
	};
}
function x(e) {
	return b(e).available;
}
async function S(e, t) {
	let r = b(t);
	if (!r.available) return {
		ok: !1,
		message: r.message,
		reason: "unavailable",
		unavailableReason: r.reason
	};
	let i = n(t);
	try {
		return await i.navigator?.clipboard?.writeText?.(e), { ok: !0 };
	} catch {
		return {
			ok: !1,
			message: "Clipboard write failed.",
			reason: "error"
		};
	}
}
//#endregion
export { f as addBrowserWindowEventListener, h as cancelAnimationFrame, y as cleanupBrowserTimeout, _ as clearBrowserTimeout, i as createCanvas, s as downloadJsonFile, c as focusElementById, b as getClipboardWriteAvailability, u as getDevicePixelRatio, d as getViewportScrollY, r as isBrowser, x as isClipboardWriteAvailable, l as matchMedia, o as openBrowserUrl, a as postBrowserJson, p as removeBrowserWindowEventListener, m as requestAnimationFrame, v as resetBrowserTimeout, g as setBrowserTimeout, S as writeClipboardText };

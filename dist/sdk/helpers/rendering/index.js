import { cancelAnimationFrame as e, matchMedia as t, requestAnimationFrame as n } from "../browser/index.js";
//#region src/sdk/helpers/rendering/index.ts
var r = "(prefers-reduced-motion: reduce)";
function i(e = {}) {
	let n = e.prefersReducedMotion ?? e.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? t("(prefers-reduced-motion: reduce)", e.environment)?.matches ?? !1, r = e.motionDurationMs ?? e.theme?.motion?.durationMs, i = typeof r == "number" && r <= 0;
	return {
		autoAnimationEnabled: !!(e.autoAnimation ?? !0) && !n && !i,
		prefersReducedMotion: n
	};
}
function a(t, r = {}) {
	let i = !1, a = null, o = () => {
		let e = n(s, r.environment);
		return a = e, e == null ? (i = !1, !1) : !0;
	}, s = (e) => {
		if (a = null, i) {
			try {
				t(e);
			} catch (e) {
				i = !1, r.onError?.(e);
				return;
			}
			i && o();
		}
	};
	return {
		isRunning: () => i,
		start: () => i ? !0 : (i = !0, o()),
		stop: () => {
			!i && a == null || (i = !1, e(a, r.environment), a = null);
		}
	};
}
function o(e, t, n) {
	t.push(e), n?.(e);
}
function s(e = {}) {
	let t = /* @__PURE__ */ new Set(), n = !1;
	return {
		add: (r) => {
			if (n) {
				let t = [];
				try {
					r();
				} catch (n) {
					o(n, t, e.onError);
				}
				return () => !1;
			}
			return t.add(r), () => t.delete(r);
		},
		dispose: () => {
			if (n) return {
				disposed: !1,
				errors: []
			};
			n = !0;
			let r = [];
			for (let n of t) try {
				n();
			} catch (t) {
				o(t, r, e.onError);
			}
			return t.clear(), {
				disposed: !0,
				errors: r
			};
		},
		isDisposed: () => n
	};
}
//#endregion
export { r as REDUCED_MOTION_QUERY, s as createDisposalScope, a as createFrameLoop, i as resolveReducedMotionState };

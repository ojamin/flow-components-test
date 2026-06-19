//#region src/sdk/helpers/three-d/stale-async.ts
function e() {
	let e = 0;
	return {
		begin() {
			return e += 1, { id: e };
		},
		invalidate(t) {
			(!t || t.id === e) && (e += 1);
		},
		isCurrent(t) {
			return t.id === e;
		},
		accept(t, n, r) {
			return t.id === e ? (r(n), !0) : (n.dispose(), !1);
		}
	};
}
//#endregion
export { e as createVizStaleAsyncSetupGuard };

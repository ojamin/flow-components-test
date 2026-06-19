//#region src/sdk/component-readiness.ts
var e = "flow-builder:component-readiness";
function t(t, n) {
	t.dispatchEvent(new CustomEvent(e, {
		bubbles: !0,
		detail: n
	}));
}
//#endregion
export { e as COMPONENT_READINESS_EVENT, t as dispatchComponentReadinessEvent };

import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, unref as a } from "vue";
//#region src/sdk/component-ui/skeleton/Skeleton.vue?vue&type=script&setup=true&lang.ts
var o = /* @__PURE__ */ n({
	__name: "Skeleton",
	props: { class: { type: [
		Boolean,
		null,
		String,
		Object,
		Array
	] } },
	setup(n) {
		let o = n;
		return (n, s) => (i(), t("div", {
			"data-slot": "skeleton",
			class: r(a(e)("bg-ct-surface-muted rounded-ct-md animate-pulse", o.class))
		}, null, 2));
	}
});
//#endregion
export { o as default };

import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, unref as o } from "vue";
//#region src/sdk/component-ui/dialog/DialogFooter.vue?vue&type=script&setup=true&lang.ts
var s = /* @__PURE__ */ n({
	__name: "DialogFooter",
	props: { class: { type: [
		Boolean,
		null,
		String,
		Object,
		Array
	] } },
	setup(n) {
		let s = n;
		return (n, c) => (i(), t("div", {
			"data-slot": "dialog-footer",
			class: r(o(e)("-mx-5 -mb-5 mt-1 flex flex-col-reverse gap-2 rounded-b-ct-xl border-t border-ct-border bg-ct-surface-muted/70 p-4 sm:flex-row sm:justify-end", s.class))
		}, [a(n.$slots, "default")], 2));
	}
});
//#endregion
export { s as default };

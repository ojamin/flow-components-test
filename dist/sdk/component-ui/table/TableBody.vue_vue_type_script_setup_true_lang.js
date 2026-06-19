import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, unref as o } from "vue";
//#region src/sdk/component-ui/table/TableBody.vue?vue&type=script&setup=true&lang.ts
var s = /* @__PURE__ */ n({
	__name: "TableBody",
	props: { class: { type: [
		Boolean,
		null,
		String,
		Object,
		Array
	] } },
	setup(n) {
		let s = n;
		return (n, c) => (i(), t("tbody", {
			"data-slot": "table-body",
			class: r(o(e)("[&_tr:last-child]:border-0", s.class))
		}, [a(n.$slots, "default")], 2));
	}
});
//#endregion
export { s as default };

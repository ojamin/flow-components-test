import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, unref as o } from "vue";
//#region src/sdk/component-ui/table/TableHeader.vue?vue&type=script&setup=true&lang.ts
var s = /* @__PURE__ */ n({
	__name: "TableHeader",
	props: { class: { type: [
		Boolean,
		null,
		String,
		Object,
		Array
	] } },
	setup(n) {
		let s = n;
		return (n, c) => (i(), t("thead", {
			"data-slot": "table-header",
			class: r(o(e)("[&_tr]:border-b", s.class))
		}, [a(n.$slots, "default")], 2));
	}
});
//#endregion
export { s as default };

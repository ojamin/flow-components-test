import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, unref as o } from "vue";
//#region src/sdk/component-ui/table/TableCell.vue?vue&type=script&setup=true&lang.ts
var s = /* @__PURE__ */ n({
	__name: "TableCell",
	props: { class: { type: [
		Boolean,
		null,
		String,
		Object,
		Array
	] } },
	setup(n) {
		let s = n;
		return (n, c) => (i(), t("td", {
			"data-slot": "table-cell",
			class: r(o(e)("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", s.class))
		}, [a(n.$slots, "default")], 2));
	}
});
//#endregion
export { s as default };

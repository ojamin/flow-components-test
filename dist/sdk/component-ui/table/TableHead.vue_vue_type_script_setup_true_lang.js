import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, unref as o } from "vue";
//#region src/sdk/component-ui/table/TableHead.vue?vue&type=script&setup=true&lang.ts
var s = /* @__PURE__ */ n({
	__name: "TableHead",
	props: { class: { type: [
		Boolean,
		null,
		String,
		Object,
		Array
	] } },
	setup(n) {
		let s = n;
		return (n, c) => (i(), t("th", {
			"data-slot": "table-head",
			class: r(o(e)("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0", s.class))
		}, [a(n.$slots, "default")], 2));
	}
});
//#endregion
export { s as default };

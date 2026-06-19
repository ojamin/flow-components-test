import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, unref as o } from "vue";
//#region src/sdk/component-ui/table/TableRow.vue?vue&type=script&setup=true&lang.ts
var s = /* @__PURE__ */ n({
	__name: "TableRow",
	props: { class: { type: [
		Boolean,
		null,
		String,
		Object,
		Array
	] } },
	setup(n) {
		let s = n;
		return (n, c) => (i(), t("tr", {
			"data-slot": "table-row",
			class: r(o(e)("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors has-aria-expanded:bg-muted/50", s.class))
		}, [a(n.$slots, "default")], 2));
	}
});
//#endregion
export { s as default };

import { cn as e } from "../cn.js";
import { createElementBlock as t, createElementVNode as n, defineComponent as r, normalizeClass as i, openBlock as a, renderSlot as o, unref as s } from "vue";
//#region src/sdk/component-ui/table/Table.vue?vue&type=script&setup=true&lang.ts
var c = /* @__PURE__ */ r({
	__name: "Table",
	props: {
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		containerClass: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	setup(r) {
		let c = r;
		return (r, l) => (a(), t("div", {
			"data-slot": "table-container",
			class: i(s(e)("relative w-full overflow-x-auto", c.containerClass))
		}, [n("table", {
			"data-slot": "table",
			class: i(s(e)("w-full caption-bottom text-sm", c.class))
		}, [o(r.$slots, "default")], 2)], 2));
	}
});
//#endregion
export { c as default };

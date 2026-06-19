import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, unref as o } from "vue";
//#region src/sdk/component-ui/card/CardTitle.vue?vue&type=script&setup=true&lang.ts
var s = /* @__PURE__ */ n({
	__name: "CardTitle",
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
			"data-slot": "card-title",
			class: r(o(e)("text-base leading-snug font-medium group-data-[size=sm]/card:text-sm cn-font-heading", s.class))
		}, [a(n.$slots, "default")], 2));
	}
});
//#endregion
export { s as default };

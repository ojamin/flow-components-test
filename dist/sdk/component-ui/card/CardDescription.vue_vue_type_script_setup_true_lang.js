import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, unref as o } from "vue";
//#region src/sdk/component-ui/card/CardDescription.vue?vue&type=script&setup=true&lang.ts
var s = /* @__PURE__ */ n({
	__name: "CardDescription",
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
			"data-slot": "card-description",
			class: r(o(e)("text-muted-foreground text-sm", s.class))
		}, [a(n.$slots, "default")], 2));
	}
});
//#endregion
export { s as default };

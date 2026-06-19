import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, unref as o } from "vue";
//#region src/sdk/component-ui/card/Card.vue?vue&type=script&setup=true&lang.ts
var s = ["data-size"], c = /* @__PURE__ */ n({
	__name: "Card",
	props: {
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		size: { default: "default" }
	},
	setup(n) {
		let c = n;
		return (l, u) => (i(), t("div", {
			"data-slot": "card",
			"data-size": n.size,
			class: r(o(e)("ring-foreground/10 bg-card text-card-foreground gap-4 overflow-hidden rounded-xl py-4 text-sm ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col", c.class))
		}, [a(l.$slots, "default")], 10, s));
	}
});
//#endregion
export { c as default };

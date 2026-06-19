import { cn as e } from "../cn.js";
import { alertVariants as t } from "./index.js";
import { createElementBlock as n, defineComponent as r, normalizeClass as i, openBlock as a, renderSlot as o, unref as s } from "vue";
//#region src/sdk/component-ui/alert/Alert.vue?vue&type=script&setup=true&lang.ts
var c = /* @__PURE__ */ r({
	__name: "Alert",
	props: {
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		variant: {}
	},
	setup(r) {
		let c = r;
		return (l, u) => (a(), n("div", {
			"data-slot": "alert",
			class: i(s(e)(s(t)({ variant: r.variant }), c.class)),
			role: "alert"
		}, [o(l.$slots, "default")], 2));
	}
});
//#endregion
export { c as default };

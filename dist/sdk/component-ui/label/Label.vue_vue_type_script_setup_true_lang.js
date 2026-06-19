import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, mergeProps as r, openBlock as i, renderSlot as a, unref as o, withCtx as s } from "vue";
import { reactiveOmit as c } from "@vueuse/core";
import { Label as l } from "reka-ui";
//#region src/sdk/component-ui/label/Label.vue?vue&type=script&setup=true&lang.ts
var u = /* @__PURE__ */ n({
	__name: "Label",
	props: {
		for: {},
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	setup(n) {
		let u = n, d = c(u, "class");
		return (n, c) => (i(), t(o(l), r({ "data-slot": "label" }, o(d), { class: o(e)("gap-2 text-sm leading-none font-medium group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed", u.class) }), {
			default: s(() => [a(n.$slots, "default")]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { u as default };

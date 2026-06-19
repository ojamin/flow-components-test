import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, mergeProps as r, openBlock as i, renderSlot as a, unref as o, withCtx as s } from "vue";
import { reactiveOmit as c } from "@vueuse/core";
import { TabsContent as l } from "reka-ui";
//#region src/sdk/component-ui/tabs/TabsContent.vue?vue&type=script&setup=true&lang.ts
var u = /* @__PURE__ */ n({
	__name: "TabsContent",
	props: {
		value: {},
		forceMount: { type: Boolean },
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
		return (n, c) => (i(), t(o(l), r({
			"data-slot": "tabs-content",
			class: o(e)("text-sm flex-1 outline-none", u.class)
		}, o(d)), {
			default: s(() => [a(n.$slots, "default")]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { u as default };

import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, mergeProps as r, openBlock as i, renderSlot as a, unref as o, withCtx as s } from "vue";
import { reactiveOmit as c } from "@vueuse/core";
import { DialogTitle as l, useForwardProps as u } from "reka-ui";
//#region src/sdk/component-ui/dialog/DialogTitle.vue?vue&type=script&setup=true&lang.ts
var d = /* @__PURE__ */ n({
	__name: "DialogTitle",
	props: {
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
		let d = n, f = u(c(d, "class"));
		return (n, c) => (i(), t(o(l), r({ "data-slot": "dialog-title" }, o(f), { class: o(e)("text-lg font-semibold leading-6 text-ct-popover-foreground", d.class) }), {
			default: s(() => [a(n.$slots, "default")]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { d as default };

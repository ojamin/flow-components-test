import { cn as e } from "../cn.js";
import { createBlock as t, createVNode as n, defineComponent as r, mergeProps as i, openBlock as a, renderSlot as o, unref as s, withCtx as c } from "vue";
import { reactiveOmit as l } from "@vueuse/core";
import { SelectScrollDownButton as u, useForwardProps as d } from "reka-ui";
import { Icon as f } from "@iconify/vue";
//#region src/sdk/component-ui/select/SelectScrollDownButton.vue?vue&type=script&setup=true&lang.ts
var p = /* @__PURE__ */ r({
	__name: "SelectScrollDownButton",
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
	setup(r) {
		let p = r, m = d(l(p, "class"));
		return (r, l) => (a(), t(s(u), i({ "data-slot": "select-scroll-down-button" }, s(m), { class: s(e)("bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*=size-])]:size-4", p.class) }), {
			default: c(() => [o(r.$slots, "default", {}, () => [n(s(f), { icon: "lucide:chevron-down" })])]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { p as default };

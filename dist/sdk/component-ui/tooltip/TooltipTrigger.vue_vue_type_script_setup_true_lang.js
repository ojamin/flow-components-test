import { createBlock as e, defineComponent as t, mergeProps as n, openBlock as r, renderSlot as i, unref as a, withCtx as o } from "vue";
import { TooltipTrigger as s } from "reka-ui";
//#region src/sdk/component-ui/tooltip/TooltipTrigger.vue?vue&type=script&setup=true&lang.ts
var c = /* @__PURE__ */ t({
	__name: "TooltipTrigger",
	props: {
		reference: {},
		asChild: { type: Boolean },
		as: {}
	},
	setup(t) {
		let c = t;
		return (t, l) => (r(), e(a(s), n({ "data-slot": "tooltip-trigger" }, c), {
			default: o(() => [i(t.$slots, "default")]),
			_: 3
		}, 16));
	}
});
//#endregion
export { c as default };

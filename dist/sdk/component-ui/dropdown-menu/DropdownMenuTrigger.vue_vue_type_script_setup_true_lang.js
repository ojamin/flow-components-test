import { createBlock as e, defineComponent as t, mergeProps as n, openBlock as r, renderSlot as i, unref as a, withCtx as o } from "vue";
import { DropdownMenuTrigger as s, useForwardProps as c } from "reka-ui";
//#region src/sdk/component-ui/dropdown-menu/DropdownMenuTrigger.vue?vue&type=script&setup=true&lang.ts
var l = /* @__PURE__ */ t({
	__name: "DropdownMenuTrigger",
	props: {
		disabled: { type: Boolean },
		asChild: { type: Boolean },
		as: {}
	},
	setup(t) {
		let l = c(t);
		return (t, c) => (r(), e(a(s), n({ "data-slot": "dropdown-menu-trigger" }, a(l)), {
			default: o(() => [i(t.$slots, "default")]),
			_: 3
		}, 16));
	}
});
//#endregion
export { l as default };

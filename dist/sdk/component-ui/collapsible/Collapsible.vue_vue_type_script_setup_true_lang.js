import { createBlock as e, defineComponent as t, guardReactiveProps as n, mergeProps as r, normalizeProps as i, openBlock as a, renderSlot as o, unref as s, withCtx as c } from "vue";
import { CollapsibleRoot as l, useForwardPropsEmits as u } from "reka-ui";
//#region src/sdk/component-ui/collapsible/Collapsible.vue?vue&type=script&setup=true&lang.ts
var d = /* @__PURE__ */ t({
	__name: "Collapsible",
	props: {
		defaultOpen: { type: Boolean },
		open: { type: Boolean },
		disabled: { type: Boolean },
		unmountOnHide: { type: Boolean },
		asChild: { type: Boolean },
		as: {}
	},
	emits: ["update:open"],
	setup(t, { emit: d }) {
		let f = u(t, d);
		return (t, u) => (a(), e(s(l), r({ "data-slot": "collapsible" }, s(f)), {
			default: c((e) => [o(t.$slots, "default", i(n(e)))]),
			_: 3
		}, 16));
	}
});
//#endregion
export { d as default };

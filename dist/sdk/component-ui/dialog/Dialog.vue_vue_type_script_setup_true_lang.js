import { createBlock as e, defineComponent as t, guardReactiveProps as n, mergeProps as r, normalizeProps as i, openBlock as a, renderSlot as o, unref as s, withCtx as c } from "vue";
import { DialogRoot as l, useForwardPropsEmits as u } from "reka-ui";
//#region src/sdk/component-ui/dialog/Dialog.vue?vue&type=script&setup=true&lang.ts
var d = /* @__PURE__ */ t({
	__name: "Dialog",
	props: {
		open: { type: Boolean },
		defaultOpen: { type: Boolean },
		modal: { type: Boolean }
	},
	emits: ["update:open"],
	setup(t, { emit: d }) {
		let f = u(t, d);
		return (t, u) => (a(), e(s(l), r({ "data-slot": "dialog" }, s(f)), {
			default: c((e) => [o(t.$slots, "default", i(n(e)))]),
			_: 3
		}, 16));
	}
});
//#endregion
export { d as default };

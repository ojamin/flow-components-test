import { createBlock as e, defineComponent as t, mergeProps as n, openBlock as r, renderSlot as i, unref as a, withCtx as o } from "vue";
import { DialogTrigger as s } from "reka-ui";
//#region src/sdk/component-ui/dialog/DialogTrigger.vue?vue&type=script&setup=true&lang.ts
var c = /* @__PURE__ */ t({
	__name: "DialogTrigger",
	props: {
		asChild: { type: Boolean },
		as: {}
	},
	setup(t) {
		let c = t;
		return (t, l) => (r(), e(a(s), n({ "data-slot": "dialog-trigger" }, c), {
			default: o(() => [i(t.$slots, "default")]),
			_: 3
		}, 16));
	}
});
//#endregion
export { c as default };

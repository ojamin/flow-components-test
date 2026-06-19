import { createBlock as e, defineComponent as t, guardReactiveProps as n, mergeProps as r, normalizeProps as i, openBlock as a, renderSlot as o, unref as s, withCtx as c } from "vue";
import { SelectRoot as l, useForwardPropsEmits as u } from "reka-ui";
//#region src/sdk/component-ui/select/Select.vue?vue&type=script&setup=true&lang.ts
var d = /* @__PURE__ */ t({
	__name: "Select",
	props: {
		open: { type: Boolean },
		defaultOpen: { type: Boolean },
		defaultValue: {},
		modelValue: {},
		by: { type: [String, Function] },
		dir: {},
		multiple: { type: Boolean },
		autocomplete: {},
		disabled: { type: Boolean },
		name: {},
		required: { type: Boolean }
	},
	emits: ["update:modelValue", "update:open"],
	setup(t, { emit: d }) {
		let f = u(t, d);
		return (t, u) => (a(), e(s(l), r({ "data-slot": "select" }, s(f)), {
			default: c((e) => [o(t.$slots, "default", i(n(e)))]),
			_: 3
		}, 16));
	}
});
//#endregion
export { d as default };

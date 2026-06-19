import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, guardReactiveProps as r, mergeProps as i, normalizeProps as a, openBlock as o, renderSlot as s, unref as c, withCtx as l } from "vue";
import { reactiveOmit as u } from "@vueuse/core";
import { RadioGroupRoot as d, useForwardPropsEmits as f } from "reka-ui";
//#region src/sdk/component-ui/radio-group/RadioGroup.vue?vue&type=script&setup=true&lang.ts
var p = /* @__PURE__ */ n({
	__name: "RadioGroup",
	props: {
		modelValue: {},
		defaultValue: {},
		disabled: { type: Boolean },
		orientation: {},
		dir: {},
		loop: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		name: {},
		required: { type: Boolean },
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	emits: ["update:modelValue"],
	setup(n, { emit: p }) {
		let m = n, h = p, g = f(u(m, "class"), h);
		return (n, u) => (o(), t(c(d), i({ "data-slot": "radio-group" }, c(g), { class: c(e)("grid w-full gap-2", m.class) }), {
			default: l((e) => [s(n.$slots, "default", a(r(e)))]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { p as default };

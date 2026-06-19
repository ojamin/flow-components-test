import { cn as e } from "../cn.js";
import { createBlock as t, createElementVNode as n, createVNode as r, defineComponent as i, guardReactiveProps as a, mergeProps as o, normalizeProps as s, openBlock as c, renderSlot as l, unref as u, withCtx as d } from "vue";
import { reactiveOmit as f } from "@vueuse/core";
import { CheckboxIndicator as p, CheckboxRoot as m, useForwardPropsEmits as h } from "reka-ui";
//#region src/sdk/component-ui/checkbox/Checkbox.vue?vue&type=script&setup=true&lang.ts
var g = /* @__PURE__ */ i({
	__name: "Checkbox",
	props: {
		defaultValue: {},
		modelValue: {},
		disabled: { type: Boolean },
		value: {},
		id: {},
		trueValue: {},
		falseValue: {},
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
	setup(i, { emit: g }) {
		let _ = i, v = g, y = h(f(_, "class"), v);
		return (i, f) => (c(), t(u(m), o({ "data-slot": "checkbox" }, u(y), { class: u(e)("peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background text-primary-foreground outline-none transition-colors after:absolute after:left-1/2 after:top-1/2 after:size-6 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20", _.class) }), {
			default: d((e) => [r(u(p), {
				"data-slot": "checkbox-indicator",
				class: "grid place-content-center text-current"
			}, {
				default: d(() => [l(i.$slots, "default", s(a(e)), () => [f[0] ||= n("svg", {
					"aria-hidden": "true",
					viewBox: "0 0 24 24",
					class: "size-3.5",
					fill: "none",
					stroke: "currentColor",
					"stroke-linecap": "round",
					"stroke-linejoin": "round",
					"stroke-width": "3"
				}, [n("path", { d: "M20 6 9 17l-5-5" })], -1)])]),
				_: 2
			}, 1024)]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { g as default };

import { cn as e } from "../cn.js";
import { createBlock as t, createVNode as n, defineComponent as r, guardReactiveProps as i, mergeProps as a, normalizeProps as o, openBlock as s, renderSlot as c, unref as l, withCtx as u } from "vue";
import { reactiveOmit as d } from "@vueuse/core";
import { SwitchRoot as f, SwitchThumb as p, useForwardPropsEmits as m } from "reka-ui";
//#region src/sdk/component-ui/switch/Switch.vue?vue&type=script&setup=true&lang.ts
var h = /* @__PURE__ */ r({
	__name: "Switch",
	props: {
		defaultValue: {},
		modelValue: {},
		disabled: { type: Boolean },
		id: {},
		value: {},
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
		] },
		size: { default: "default" }
	},
	emits: ["update:modelValue"],
	setup(r, { emit: h }) {
		let g = r, _ = h, v = m(d(g, "class", "size"), _);
		return (d, m) => (s(), t(l(f), a({
			"data-slot": "switch",
			"data-size": r.size
		}, l(v), { class: l(e)("data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-unchecked:bg-input/80 shrink-0 rounded-full border border-transparent focus-visible:ring-3 aria-invalid:ring-3 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:left-1/2 after:top-1/2 after:h-6 after:w-full after:min-w-6 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] data-disabled:cursor-not-allowed data-disabled:opacity-50", g.class) }), {
			default: u((e) => [n(l(p), {
				"data-slot": "switch-thumb",
				class: "bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground rounded-full group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 pointer-events-none block ring-0 transition-transform"
			}, {
				default: u(() => [c(d.$slots, "thumb", o(i(e)))]),
				_: 2
			}, 1024)]),
			_: 3
		}, 16, ["data-size", "class"]));
	}
});
//#endregion
export { h as default };

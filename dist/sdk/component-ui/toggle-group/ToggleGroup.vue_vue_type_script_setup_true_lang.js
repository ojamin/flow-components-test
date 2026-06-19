import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, guardReactiveProps as r, mergeProps as i, normalizeProps as a, openBlock as o, provide as s, renderSlot as c, unref as l, withCtx as u } from "vue";
import { reactiveOmit as d } from "@vueuse/core";
import { ToggleGroupRoot as f, useForwardPropsEmits as p } from "reka-ui";
//#region src/sdk/component-ui/toggle-group/ToggleGroup.vue?vue&type=script&setup=true&lang.ts
var m = /* @__PURE__ */ n({
	__name: "ToggleGroup",
	props: {
		rovingFocus: { type: Boolean },
		disabled: { type: Boolean },
		orientation: {},
		dir: {},
		loop: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		name: {},
		required: { type: Boolean },
		type: {},
		modelValue: {},
		defaultValue: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		variant: {},
		size: {},
		spacing: { default: 0 }
	},
	emits: ["update:modelValue"],
	setup(n, { emit: m }) {
		let h = n, g = m;
		s("toggleGroup", {
			variant: h.variant,
			size: h.size,
			spacing: h.spacing
		});
		let _ = p(d(h, "class", "size", "variant"), g);
		return (s, d) => (o(), t(l(f), i({
			"data-slot": "toggle-group",
			"data-size": n.size,
			"data-variant": n.variant,
			"data-spacing": n.spacing
		}, l(_), { class: l(e)("rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch", h.class) }), {
			default: u((e) => [c(s.$slots, "default", a(r(e)))]),
			_: 3
		}, 16, [
			"data-size",
			"data-variant",
			"data-spacing",
			"class"
		]));
	}
});
//#endregion
export { m as default };

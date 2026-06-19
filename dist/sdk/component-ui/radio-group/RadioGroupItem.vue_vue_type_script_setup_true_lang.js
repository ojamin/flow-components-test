import { cn as e } from "../cn.js";
import { createBlock as t, createElementVNode as n, createVNode as r, defineComponent as i, mergeProps as a, openBlock as o, renderSlot as s, unref as c, withCtx as l } from "vue";
import { reactiveOmit as u } from "@vueuse/core";
import { RadioGroupIndicator as d, RadioGroupItem as f, useForwardProps as p } from "reka-ui";
//#region src/sdk/component-ui/radio-group/RadioGroupItem.vue?vue&type=script&setup=true&lang.ts
var m = /* @__PURE__ */ i({
	__name: "RadioGroupItem",
	props: {
		id: {},
		value: {},
		disabled: { type: Boolean },
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
	setup(i) {
		let m = i, h = p(u(m, "class"));
		return (i, u) => (o(), t(c(f), a({ "data-slot": "radio-group-item" }, c(h), { class: c(e)("peer relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-background text-primary-foreground outline-none transition-colors after:absolute after:left-1/2 after:top-1/2 after:size-6 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20", m.class) }), {
			default: l(() => [r(c(d), {
				"data-slot": "radio-group-indicator",
				class: "flex size-4 items-center justify-center"
			}, {
				default: l(() => [s(i.$slots, "default", {}, () => [u[0] ||= n("span", {
					"aria-hidden": "true",
					class: "size-2 rounded-full bg-current"
				}, null, -1)])]),
				_: 3
			})]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { m as default };

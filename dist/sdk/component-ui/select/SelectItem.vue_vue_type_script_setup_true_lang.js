import { cn as e } from "../cn.js";
import { createBlock as t, createElementVNode as n, createVNode as r, defineComponent as i, mergeProps as a, openBlock as o, renderSlot as s, unref as c, withCtx as l } from "vue";
import { reactiveOmit as u } from "@vueuse/core";
import { SelectItem as d, SelectItemIndicator as f, SelectItemText as p, useForwardProps as m } from "reka-ui";
import { Icon as h } from "@iconify/vue";
//#region src/sdk/component-ui/select/SelectItem.vue?vue&type=script&setup=true&lang.ts
var g = { class: "pointer-events-none absolute right-2 flex size-4 items-center justify-center" }, _ = /* @__PURE__ */ i({
	__name: "SelectItem",
	props: {
		value: {},
		disabled: { type: Boolean },
		textValue: {},
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	setup(i) {
		let _ = i, v = m(u(_, "class"));
		return (i, u) => (o(), t(c(d), a({ "data-slot": "select-item" }, c(v), { class: c(e)("focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm [&_svg:not([class*=size-])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", _.class) }), {
			default: l(() => [n("span", g, [r(c(f), null, {
				default: l(() => [s(i.$slots, "indicator-icon", {}, () => [r(c(h), {
					icon: "lucide:check",
					class: "pointer-events-none"
				})])]),
				_: 3
			})]), r(c(p), null, {
				default: l(() => [s(i.$slots, "default")]),
				_: 3
			})]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { _ as default };

import { cn as e } from "../cn.js";
import { createBlock as t, createVNode as n, defineComponent as r, mergeProps as i, openBlock as a, renderSlot as o, unref as s, withCtx as c } from "vue";
import { reactiveOmit as l } from "@vueuse/core";
import { SelectIcon as u, SelectTrigger as d, useForwardProps as f } from "reka-ui";
import { Icon as p } from "@iconify/vue";
//#region src/sdk/component-ui/select/SelectTrigger.vue?vue&type=script&setup=true&lang.ts
var m = /* @__PURE__ */ r({
	__name: "SelectTrigger",
	props: {
		disabled: { type: Boolean },
		reference: {},
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		size: { default: "default" }
	},
	setup(r) {
		let m = r, h = f(l(m, "class", "size"));
		return (l, f) => (a(), t(s(d), i({
			"data-slot": "select-trigger",
			"data-size": r.size
		}, s(h), { class: s(e)("border-input data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors select-none focus-visible:ring-3 aria-invalid:ring-3 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*=size-])]:size-4 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0", m.class) }), {
			default: c(() => [o(l.$slots, "default"), n(s(u), { "as-child": "" }, {
				default: c(() => [n(s(p), {
					icon: "lucide:chevron-down",
					class: "text-muted-foreground size-4 pointer-events-none"
				})]),
				_: 1
			})]),
			_: 3
		}, 16, ["data-size", "class"]));
	}
});
//#endregion
export { m as default };

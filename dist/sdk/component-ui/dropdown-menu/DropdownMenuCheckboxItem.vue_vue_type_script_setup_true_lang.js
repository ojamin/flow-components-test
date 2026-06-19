import { cn as e } from "../cn.js";
import { createBlock as t, createElementVNode as n, createVNode as r, defineComponent as i, mergeProps as a, openBlock as o, renderSlot as s, unref as c, withCtx as l } from "vue";
import { reactiveOmit as u } from "@vueuse/core";
import { DropdownMenuCheckboxItem as d, DropdownMenuItemIndicator as f, useForwardPropsEmits as p } from "reka-ui";
import { CheckIcon as m } from "lucide-vue-next";
//#region src/sdk/component-ui/dropdown-menu/DropdownMenuCheckboxItem.vue?vue&type=script&setup=true&lang.ts
var h = {
	class: "absolute right-2 flex items-center justify-center pointer-events-none",
	"data-slot": "dropdown-menu-checkbox-item-indicator"
}, g = /* @__PURE__ */ i({
	__name: "DropdownMenuCheckboxItem",
	props: {
		modelValue: { type: [Boolean, String] },
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
	emits: ["select", "update:modelValue"],
	setup(i, { emit: g }) {
		let _ = i, v = g, y = p(u(_, "class"), v);
		return (i, u) => (o(), t(c(d), a({ "data-slot": "dropdown-menu-checkbox-item" }, c(y), { class: c(e)("focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm data-inset:pl-7 [&_svg:not([class*=size-])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", _.class) }), {
			default: l(() => [n("span", h, [r(c(f), null, {
				default: l(() => [s(i.$slots, "indicator-icon", {}, () => [r(c(m))])]),
				_: 3
			})]), s(i.$slots, "default")]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { g as default };

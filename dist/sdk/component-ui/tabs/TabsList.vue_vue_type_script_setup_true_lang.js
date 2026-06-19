import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, mergeProps as r, openBlock as i, renderSlot as a, unref as o, withCtx as s } from "vue";
import { reactiveOmit as c } from "@vueuse/core";
import { TabsList as l } from "reka-ui";
//#region src/sdk/component-ui/tabs/TabsList.vue?vue&type=script&setup=true&lang.ts
var u = /* @__PURE__ */ n({
	__name: "TabsList",
	props: {
		loop: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		variant: { default: "default" }
	},
	setup(n) {
		let u = n, d = c(u, "class", "variant");
		return (c, f) => (i(), t(o(l), r({
			"data-slot": "tabs-list",
			"data-variant": n.variant
		}, o(d), { class: o(e)("rounded-lg p-[3px] group-data-horizontal/tabs:h-8 data-[variant=line]:rounded-none group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col", n.variant === "default" && "bg-muted", n.variant === "line" && "gap-1 bg-transparent", u.class) }), {
			default: s(() => [a(c.$slots, "default")]),
			_: 3
		}, 16, ["data-variant", "class"]));
	}
});
//#endregion
export { u as default };

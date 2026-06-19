import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, mergeProps as r, openBlock as i, unref as a } from "vue";
import { reactiveOmit as o } from "@vueuse/core";
import { Separator as s } from "reka-ui";
//#region src/sdk/component-ui/separator/Separator.vue?vue&type=script&setup=true&lang.ts
var c = /* @__PURE__ */ n({
	__name: "Separator",
	props: {
		orientation: { default: "horizontal" },
		decorative: {
			type: Boolean,
			default: !0
		},
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
	setup(n) {
		let c = n, l = o(c, "class");
		return (n, o) => (i(), t(a(s), r({ "data-slot": "separator" }, a(l), { class: a(e)("shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch", c.class) }), null, 16, ["class"]));
	}
});
//#endregion
export { c as default };

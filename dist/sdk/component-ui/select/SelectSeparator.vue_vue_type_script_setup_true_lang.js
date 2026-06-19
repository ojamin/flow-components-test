import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, mergeProps as r, openBlock as i, unref as a } from "vue";
import { reactiveOmit as o } from "@vueuse/core";
import { SelectSeparator as s } from "reka-ui";
//#region src/sdk/component-ui/select/SelectSeparator.vue?vue&type=script&setup=true&lang.ts
var c = /* @__PURE__ */ n({
	__name: "SelectSeparator",
	props: {
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
		return (n, o) => (i(), t(a(s), r({ "data-slot": "select-separator" }, a(l), { class: a(e)("bg-border -mx-1 my-1 h-px pointer-events-none", c.class) }), null, 16, ["class"]));
	}
});
//#endregion
export { c as default };

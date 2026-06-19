import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, mergeProps as r, openBlock as i, renderSlot as a, unref as o, withCtx as s } from "vue";
import { reactiveOmit as c } from "@vueuse/core";
import { SelectGroup as l } from "reka-ui";
//#region src/sdk/component-ui/select/SelectGroup.vue?vue&type=script&setup=true&lang.ts
var u = /* @__PURE__ */ n({
	__name: "SelectGroup",
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
		let u = n, d = c(u, "class");
		return (n, c) => (i(), t(o(l), r({ "data-slot": "select-group" }, o(d), { class: o(e)("scroll-my-1 p-1", u.class) }), {
			default: s(() => [a(n.$slots, "default")]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { u as default };

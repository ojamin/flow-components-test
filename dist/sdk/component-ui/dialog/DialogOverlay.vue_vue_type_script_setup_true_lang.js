import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, mergeProps as r, openBlock as i, renderSlot as a, unref as o, withCtx as s } from "vue";
import { reactiveOmit as c } from "@vueuse/core";
import { DialogOverlay as l } from "reka-ui";
//#region src/sdk/component-ui/dialog/DialogOverlay.vue?vue&type=script&setup=true&lang.ts
var u = /* @__PURE__ */ n({
	__name: "DialogOverlay",
	props: {
		forceMount: { type: Boolean },
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
		return (n, c) => (i(), t(o(l), r({ "data-slot": "dialog-overlay" }, o(d), { class: o(e)("fixed inset-0 isolate z-50 bg-ct-foreground/25 data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0 motion-reduce:animate-none motion-reduce:transition-none", u.class) }), {
			default: s(() => [a(n.$slots, "default")]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { u as default };

import { cn as e } from "../cn.js";
import { createBlock as t, defineComponent as n, mergeProps as r, openBlock as i, renderSlot as a, unref as o, withCtx as s } from "vue";
import { reactiveOmit as c } from "@vueuse/core";
import { AvatarImage as l } from "reka-ui";
//#region src/sdk/component-ui/avatar/AvatarImage.vue?vue&type=script&setup=true&lang.ts
var u = /* @__PURE__ */ n({
	__name: "AvatarImage",
	props: {
		src: {},
		referrerPolicy: {},
		crossOrigin: {},
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
		return (n, c) => (i(), t(o(l), r({ "data-slot": "avatar-image" }, o(d), { class: o(e)("aspect-square size-full object-cover", u.class) }), {
			default: s(() => [a(n.$slots, "default")]),
			_: 3
		}, 16, ["class"]));
	}
});
//#endregion
export { u as default };

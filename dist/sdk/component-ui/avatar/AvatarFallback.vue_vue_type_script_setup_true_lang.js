import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, unref as o } from "vue";
//#region src/sdk/component-ui/avatar/AvatarFallback.vue?vue&type=script&setup=true&lang.ts
var s = /* @__PURE__ */ n({
	__name: "AvatarFallback",
	props: { class: { type: [
		Boolean,
		null,
		String,
		Object,
		Array
	] } },
	setup(n) {
		let s = n;
		return (n, c) => (i(), t("span", {
			"data-slot": "avatar-fallback",
			class: r(o(e)("flex size-full items-center justify-center bg-ct-surface-muted text-ct-foreground-muted", s.class))
		}, [a(n.$slots, "default")], 2));
	}
});
//#endregion
export { s as default };

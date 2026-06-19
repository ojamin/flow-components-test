import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, isRef as r, normalizeClass as i, openBlock as a, unref as o, vModelText as s, withDirectives as c } from "vue";
import { useVModel as l } from "@vueuse/core";
//#region src/sdk/component-ui/input/Input.vue?vue&type=script&setup=true&lang.ts
var u = /* @__PURE__ */ n({
	__name: "Input",
	props: {
		defaultValue: {},
		modelValue: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	emits: ["update:modelValue"],
	setup(n, { emit: u }) {
		let d = n, f = l(d, "modelValue", u, {
			passive: !0,
			defaultValue: d.defaultValue
		});
		return (n, l) => c((a(), t("input", {
			"onUpdate:modelValue": l[0] ||= (e) => r(f) ? f.value = e : null,
			"data-slot": "input",
			class: i(o(e)("dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors file:h-6 file:text-sm file:font-medium focus-visible:ring-3 aria-invalid:ring-3 md:text-sm w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", d.class))
		}, null, 2)), [[s, o(f)]]);
	}
});
//#endregion
export { u as default };

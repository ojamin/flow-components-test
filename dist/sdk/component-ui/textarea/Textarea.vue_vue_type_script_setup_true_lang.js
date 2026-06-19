import { cn as e } from "../cn.js";
import { createElementBlock as t, defineComponent as n, isRef as r, normalizeClass as i, openBlock as a, unref as o, vModelText as s, withDirectives as c } from "vue";
import { useVModel as l } from "@vueuse/core";
//#region src/sdk/component-ui/textarea/Textarea.vue?vue&type=script&setup=true&lang.ts
var u = /* @__PURE__ */ n({
	__name: "Textarea",
	props: {
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		defaultValue: {},
		modelValue: {}
	},
	emits: ["update:modelValue"],
	setup(n, { emit: u }) {
		let d = n, f = l(d, "modelValue", u, {
			passive: !0,
			defaultValue: d.defaultValue
		});
		return (n, l) => c((a(), t("textarea", {
			"onUpdate:modelValue": l[0] ||= (e) => r(f) ? f.value = e : null,
			"data-slot": "textarea",
			class: i(o(e)("border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors focus-visible:ring-3 aria-invalid:ring-3 md:text-sm flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", d.class))
		}, null, 2)), [[s, o(f)]]);
	}
});
//#endregion
export { u as default };

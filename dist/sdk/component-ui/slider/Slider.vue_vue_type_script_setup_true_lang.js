import { cn as e } from "../cn.js";
import { Fragment as t, createBlock as n, createElementBlock as r, createVNode as i, defineComponent as a, mergeProps as o, openBlock as s, renderList as c, unref as l, withCtx as u } from "vue";
import { reactiveOmit as d } from "@vueuse/core";
import { SliderRange as f, SliderRoot as p, SliderThumb as m, SliderTrack as h, useForwardPropsEmits as g } from "reka-ui";
//#region src/sdk/component-ui/slider/Slider.vue?vue&type=script&setup=true&lang.ts
var _ = /* @__PURE__ */ a({
	__name: "Slider",
	props: {
		defaultValue: {},
		modelValue: {},
		disabled: { type: Boolean },
		orientation: {},
		dir: {},
		inverted: { type: Boolean },
		min: {},
		max: {},
		step: {},
		minStepsBetweenThumbs: {},
		thumbAlignment: {},
		asChild: { type: Boolean },
		as: {},
		name: {},
		required: { type: Boolean },
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	emits: ["update:modelValue", "valueCommit"],
	setup(a, { emit: _ }) {
		let v = a, y = _, b = g(d(v, "class"), y);
		return (a, d) => (s(), n(l(p), o({
			"data-slot": "slider",
			"data-vertical": v.orientation === "vertical" ? "" : void 0,
			class: l(e)("relative flex w-full touch-none select-none items-center data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col", v.class)
		}, l(b)), {
			default: u(({ modelValue: e }) => [i(l(h), {
				"data-slot": "slider-track",
				"data-horizontal": v.orientation === "vertical" ? void 0 : "",
				"data-vertical": v.orientation === "vertical" ? "" : void 0,
				class: "relative grow overflow-hidden rounded-full bg-muted data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
			}, {
				default: u(() => [i(l(f), {
					"data-slot": "slider-range",
					"data-horizontal": v.orientation === "vertical" ? void 0 : "",
					"data-vertical": v.orientation === "vertical" ? "" : void 0,
					class: "absolute bg-primary data-horizontal:h-full data-vertical:w-full"
				}, null, 8, ["data-horizontal", "data-vertical"])]),
				_: 1
			}, 8, ["data-horizontal", "data-vertical"]), (s(!0), r(t, null, c(e, (e, t) => (s(), n(l(m), {
				key: t,
				"data-slot": "slider-thumb",
				"data-vertical": v.orientation === "vertical" ? "" : void 0,
				class: "relative block size-3 shrink-0 select-none rounded-full border border-ring bg-background transition-[color,box-shadow] after:absolute after:left-1/2 after:top-1/2 after:size-6 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] hover:ring-3 hover:ring-ring/50 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50 active:ring-3 active:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
			}, null, 8, ["data-vertical"]))), 128))]),
			_: 1
		}, 16, ["data-vertical", "class"]));
	}
});
//#endregion
export { _ as default };

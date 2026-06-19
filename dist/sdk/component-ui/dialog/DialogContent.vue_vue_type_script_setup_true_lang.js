import { cn as e } from "../cn.js";
import t from "../button/Button.js";
import n from "./DialogClose.js";
import r from "./DialogOverlay.js";
import { createBlock as i, createCommentVNode as a, createElementVNode as o, createVNode as s, defineComponent as c, mergeProps as l, openBlock as u, renderSlot as d, unref as f, withCtx as p } from "vue";
import { reactiveOmit as m } from "@vueuse/core";
import { DialogContent as h, DialogPortal as g, useForwardPropsEmits as _ } from "reka-ui";
//#region src/sdk/component-ui/dialog/DialogContent.vue?vue&type=script&setup=true&lang.ts
var v = /* @__PURE__ */ c({
	inheritAttrs: !1,
	__name: "DialogContent",
	props: {
		forceMount: { type: Boolean },
		disableOutsidePointerEvents: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		disablePortal: {
			type: Boolean,
			default: !1
		},
		showCloseButton: {
			type: Boolean,
			default: !0
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(c, { emit: v }) {
		let y = c, b = v, x = _(m(y, "class", "disablePortal", "showCloseButton"), b);
		return (c, m) => (u(), i(f(g), { disabled: y.disablePortal }, {
			default: p(() => [s(r), s(f(h), l({ "data-slot": "dialog-content" }, {
				...c.$attrs,
				...f(x)
			}, { class: f(e)("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-ct-xl border border-ct-border bg-ct-popover p-5 text-sm leading-6 text-ct-popover-foreground shadow-ct-lg ring-1 ring-ct-border/70 outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 motion-reduce:animate-none motion-reduce:transition-none sm:w-full", y.class) }), {
				default: p(() => [d(c.$slots, "default"), y.showCloseButton ? (u(), i(n, {
					key: 0,
					"as-child": ""
				}, {
					default: p(() => [s(f(t), {
						"aria-label": "Close dialog",
						class: "absolute right-3 top-3 h-8 w-8 rounded-ct-md border border-transparent p-0 text-ct-foreground-muted hover:border-ct-border hover:bg-ct-surface-muted hover:text-ct-foreground focus-visible:border-ct-focus-ring focus-visible:ring-2 focus-visible:ring-ct-focus-ring/55",
						size: "icon-sm",
						type: "button",
						variant: "ghost"
					}, {
						default: p(() => [...m[0] ||= [o("span", {
							"aria-hidden": "true",
							class: "text-base leading-none"
						}, "×", -1), o("span", { class: "sr-only" }, "Close", -1)]]),
						_: 1
					})]),
					_: 1
				})) : a("", !0)]),
				_: 3
			}, 16, ["class"])]),
			_: 3
		}, 8, ["disabled"]));
	}
});
//#endregion
export { v as default };

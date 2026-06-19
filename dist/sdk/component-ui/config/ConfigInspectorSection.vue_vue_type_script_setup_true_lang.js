import e from "../button/Button.js";
import t from "../collapsible/Collapsible.js";
import n from "../collapsible/CollapsibleContent.js";
import r from "../collapsible/CollapsibleTrigger.js";
import i from "../tooltip/Tooltip.js";
import a from "../tooltip/TooltipContent.js";
import o from "../tooltip/TooltipProvider.js";
import s from "../tooltip/TooltipTrigger.js";
import c from "../separator/Separator.js";
import { createBlock as l, createCommentVNode as u, createElementVNode as d, createTextVNode as f, createVNode as p, defineComponent as m, normalizeClass as h, openBlock as g, ref as _, renderSlot as v, toDisplayString as y, unref as b, watch as x, withCtx as S } from "vue";
import { Icon as C } from "@iconify/vue";
//#region src/sdk/component-ui/config/ConfigInspectorSection.vue?vue&type=script&setup=true&lang.ts
var w = { class: "flex items-start justify-between gap-3" }, T = { class: "flex min-w-0 flex-1 items-center gap-1.5" }, E = { class: "min-w-0 text-sm font-semibold leading-tight" }, D = ["aria-label"], O = { class: "flex flex-col gap-4" }, k = /* @__PURE__ */ m({
	__name: "ConfigInspectorSection",
	props: {
		title: {},
		description: {},
		defaultOpen: {
			type: Boolean,
			default: !0
		},
		disabled: {
			type: Boolean,
			default: !1
		}
	},
	setup(m) {
		let k = m, A = _(k.defaultOpen);
		return x(() => k.defaultOpen, (e) => {
			A.value = e;
		}), (_, x) => (g(), l(b(t), {
			open: A.value,
			"onUpdate:open": x[0] ||= (e) => A.value = e,
			disabled: m.disabled,
			class: "flex flex-col gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0",
			"data-testid": "config-inspector-section"
		}, {
			default: S(() => [d("div", w, [d("div", T, [d("h3", E, y(m.title), 1), m.description ? (g(), l(b(o), {
				key: 0,
				"delay-duration": 120
			}, {
				default: S(() => [p(b(i), null, {
					default: S(() => [p(b(s), { "as-child": "" }, {
						default: S(() => [d("button", {
							"aria-label": `More information about ${m.title}`,
							class: "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
							"data-testid": "section-help-trigger",
							type: "button"
						}, [p(b(C), {
							class: "size-3.5",
							icon: "lucide:circle-help"
						})], 8, D)]),
						_: 1
					}), p(b(a), {
						class: "max-w-72 text-xs leading-relaxed",
						side: "left"
					}, {
						default: S(() => [f(y(m.description), 1)]),
						_: 1
					})]),
					_: 1
				})]),
				_: 1
			})) : u("", !0)]), p(b(r), { "as-child": "" }, {
				default: S(() => [p(b(e), {
					variant: "ghost",
					size: "icon-xs",
					disabled: m.disabled,
					"aria-label": A.value ? `Collapse ${m.title}` : `Expand ${m.title}`,
					"data-testid": "section-toggle"
				}, {
					default: S(() => [p(b(C), {
						icon: "lucide:chevron-down",
						class: h(["size-4 transition-transform duration-200", { "rotate-180": A.value }])
					}, null, 8, ["class"])]),
					_: 1
				}, 8, ["disabled", "aria-label"])]),
				_: 1
			})]), p(b(n), null, {
				default: S(() => [p(b(c), { class: "mb-3" }), d("div", O, [v(_.$slots, "default")])]),
				_: 3
			})]),
			_: 3
		}, 8, ["open", "disabled"]));
	}
});
//#endregion
export { k as default };

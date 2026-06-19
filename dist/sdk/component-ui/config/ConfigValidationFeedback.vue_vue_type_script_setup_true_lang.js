import { Fragment as e, computed as t, createElementBlock as n, createElementVNode as r, createVNode as i, defineComponent as a, normalizeClass as o, openBlock as s, renderList as c, toDisplayString as l, unref as u } from "vue";
import { Icon as d } from "@iconify/vue";
//#region src/sdk/component-ui/config/ConfigValidationFeedback.vue?vue&type=script&setup=true&lang.ts
var f = { "data-testid": "config-validation-feedback" }, p = {
	key: 0,
	class: "text-xs text-muted-foreground/60",
	"data-testid": "validation-empty"
}, m = {
	key: 1,
	class: "flex flex-col gap-1.5",
	role: "list",
	"aria-label": "Validation messages"
}, h = ["data-severity"], g = /* @__PURE__ */ a({
	__name: "ConfigValidationFeedback",
	props: { messages: {} },
	setup(a) {
		let g = a, _ = t(() => g.messages.length > 0), v = {
			error: {
				icon: "lucide:circle-x",
				variant: "destructive"
			},
			warning: {
				icon: "lucide:triangle-alert",
				variant: "warning"
			},
			info: {
				icon: "lucide:info",
				variant: "info"
			}
		};
		function y(e) {
			return v[e];
		}
		return (t, g) => (s(), n("div", f, [_.value ? (s(), n("ul", m, [(s(!0), n(e, null, c(a.messages, (e) => (s(), n("li", {
			key: e.id,
			"data-severity": e.severity,
			"data-testid": "validation-message",
			class: "flex items-start gap-2 text-xs",
			role: "listitem"
		}, [i(u(d), {
			icon: y(e.severity).icon,
			class: o(["mt-0.5 size-3.5 shrink-0", e.severity === "error" ? "text-destructive" : e.severity === "warning" ? "text-warning" : "text-info"]),
			"aria-hidden": "true"
		}, null, 8, ["icon", "class"]), r("span", { class: o(e.severity === "error" ? "text-destructive" : e.severity === "warning" ? "text-warning" : "text-muted-foreground") }, l(e.message), 3)], 8, h))), 128))])) : (s(), n("p", p, " No validation issues. "))]));
	}
});
//#endregion
export { g as default };

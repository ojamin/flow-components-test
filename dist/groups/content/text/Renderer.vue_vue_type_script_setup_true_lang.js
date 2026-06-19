import { resolveClampLinesClass as e, resolveContentTextAlignClass as t } from "../../../sdk/content-primitives.js";
import { textConfigDefaults as n } from "./types.js";
import { computed as r, createElementBlock as i, createElementVNode as a, createVNode as o, defineComponent as s, normalizeClass as c, openBlock as l, toDisplayString as u, unref as d } from "vue";
import { Icon as f } from "@iconify/vue";
//#region src/groups/content/text/Renderer.vue?vue&type=script&setup=true&lang.ts
var p = { class: "w-full" }, m = {
	key: 1,
	class: "flex items-center gap-2",
	"data-testid": "text-empty-state"
}, h = { class: "text-sm text-ct-foreground-muted" }, g = /* @__PURE__ */ s({
	__name: "Renderer",
	props: {
		config: {},
		label: {},
		fixtureData: {},
		runtimeOutputs: {},
		runtimeInputIds: {},
		updateRuntimeOutputs: { type: Function },
		device: {},
		themeContext: {},
		emitEvent: { type: Function },
		renderMode: {},
		diagnostics: {},
		datasetDerivationService: {}
	},
	setup(s) {
		let g = s, _ = r(() => ({
			...n,
			...g.config
		})), v = r(() => _.value.text.trim()), y = r(() => ["prose max-w-none", t(_.value.align)].filter(Boolean).join(" ")), b = r(() => {
			let n = ["whitespace-pre-line text-base leading-7 text-ct-foreground"];
			_.value.prose || n.push(t(_.value.align));
			let r = e(_.value.clampLines);
			return r && n.push(r), n.filter(Boolean).join(" ");
		});
		return (e, t) => (l(), i("section", p, [v.value ? (l(), i("div", {
			key: 0,
			class: c(_.value.prose ? y.value : void 0),
			"data-testid": "text-content"
		}, [a("p", {
			class: c(b.value),
			"data-testid": "text-body"
		}, u(v.value), 3)], 2)) : (l(), i("div", m, [o(d(f), {
			class: "size-4 shrink-0 text-ct-foreground-muted",
			icon: "lucide:text"
		}), a("p", h, u(g.fixtureData?.emptyStateTitle ?? "No text content — add copy or bind from data."), 1)]))]));
	}
});
//#endregion
export { g as default };

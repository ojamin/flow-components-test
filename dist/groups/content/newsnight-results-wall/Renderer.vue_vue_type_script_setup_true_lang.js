import { NewsnightResultsWallConfigDefaults as e } from "./types.js";
import { Fragment as t, computed as n, createElementBlock as r, createElementVNode as i, createStaticVNode as a, createTextVNode as o, defineComponent as s, normalizeClass as c, openBlock as l, renderList as u, toDisplayString as d } from "vue";
//#region src/groups/content/newsnight-results-wall/Renderer.vue?vue&type=script&setup=true&lang.ts
var f = {
	class: "w-full overflow-hidden rounded-md border border-white/10 bg-zinc-950 text-ct-foreground shadow-2xl",
	"data-testid": "newsnight-results-wall"
}, ee = { class: "grid gap-px bg-white/10 lg:grid-cols-[29%_46%_25%]" }, te = { class: "bg-zinc-950 p-4" }, ne = { class: "mb-3 flex items-start justify-between gap-3" }, re = { class: "mt-1 text-2xl font-black tracking-tight text-white" }, ie = { class: "rounded-sm border border-amber-300/50 bg-amber-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-amber-100" }, p = { class: "space-y-4" }, m = { class: "mb-1 flex items-end justify-between gap-3" }, h = { class: "text-sm font-bold text-white" }, g = { class: "text-right" }, _ = { class: "font-mono text-lg font-black text-white" }, v = { class: "font-mono text-xs text-zinc-400" }, y = { class: "h-3 overflow-hidden rounded-sm bg-white/10" }, b = { class: "mb-1 flex items-end justify-between gap-3" }, x = { class: "text-sm font-bold text-white" }, S = { class: "text-right" }, C = { class: "font-mono text-lg font-black text-white" }, w = { class: "font-mono text-xs text-zinc-400" }, T = { class: "h-3 overflow-hidden rounded-sm bg-white/10" }, E = { class: "mt-5 grid grid-cols-3 gap-px overflow-hidden rounded border border-white/10 bg-white/10 text-center" }, D = { class: "bg-white/[0.04] p-3" }, O = { class: "font-mono text-xl font-black text-white" }, k = { class: "bg-white/[0.04] p-3" }, A = { class: "font-mono text-xl font-black text-white" }, j = { class: "bg-zinc-900 p-4" }, M = { class: "relative min-h-[22rem] overflow-hidden rounded border border-white/10 bg-slate-950 p-4" }, ae = { class: "relative grid h-full grid-cols-5 gap-2" }, N = { class: "font-black text-slate-950" }, P = { class: "font-mono font-black text-slate-950" }, F = { class: "absolute bottom-4 left-4 rounded border border-white/10 bg-black/60 px-3 py-2 text-xs text-zinc-200" }, I = { class: "font-bold text-white" }, L = { class: "mt-4 grid gap-px overflow-hidden rounded border border-white/10 bg-white/10 md:grid-cols-4" }, R = { class: "mb-2 flex items-center justify-between text-xs" }, z = { class: "text-zinc-400" }, B = { class: "font-mono font-bold text-white" }, V = { class: "h-1.5 rounded bg-white/10" }, H = { class: "bg-zinc-950 p-4" }, U = { class: "space-y-3" }, W = { class: "flex items-start justify-between gap-3" }, G = { class: "font-black text-white" }, K = { class: "mt-1 text-xs text-zinc-400" }, q = /* @__PURE__ */ s({
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
		let q = s, J = n(() => ({
			...e,
			...q.config
		})), Y = n(() => J.value.candidateAVotes + J.value.candidateBVotes), X = n(() => Y.value > 0 ? Math.round(J.value.candidateAVotes / Y.value * 1e3) / 10 : 0), Z = n(() => Math.round((100 - X.value) * 10) / 10), oe = n(() => Math.abs(J.value.candidateAVotes - J.value.candidateBVotes)), se = n(() => $(X.value)), ce = n(() => $(Z.value)), le = [
			[
				"Denver",
				"D +42",
				"bg-cyan-400/75",
				"col-span-2"
			],
			[
				"Boulder",
				"D +36",
				"bg-cyan-300/65",
				""
			],
			[
				"Larimer",
				"D +9",
				"bg-cyan-200/55",
				""
			],
			[
				"Weld",
				"R +18",
				"bg-red-400/65",
				""
			],
			[
				"Mesa",
				"R +25",
				"bg-red-500/70",
				""
			],
			[
				"Jefferson",
				"D +7",
				"bg-violet-300/70",
				"col-span-2"
			],
			[
				"Arapahoe",
				"D +14",
				"bg-cyan-300/70",
				""
			],
			[
				"El Paso",
				"R +21",
				"bg-red-400/70",
				"row-span-2"
			],
			[
				"Pueblo",
				"D +3",
				"bg-violet-300/55",
				""
			],
			[
				"Adams",
				"D +17",
				"bg-cyan-300/65",
				""
			],
			[
				"Douglas",
				"R +16",
				"bg-red-300/65",
				""
			],
			[
				"La Plata",
				"D +12",
				"bg-cyan-300/60",
				""
			],
			[
				"Garfield",
				"R +8",
				"bg-red-300/55",
				""
			]
		], ue = [
			[
				"CO-03",
				"Mesa batch expected",
				"Lean R",
				"text-red-300"
			],
			[
				"AG",
				"Denver provisionals pending",
				"Toss-up",
				"text-amber-200"
			],
			[
				"Prop 118",
				"Urban vote overperforming",
				"Lean Yes",
				"text-cyan-200"
			],
			[
				"Senate",
				"Projected hold",
				"Likely D",
				"text-cyan-200"
			]
		], Q = [
			[
				"County intake",
				"98%",
				"bg-cyan-300",
				"w-[98%]"
			],
			[
				"Validation",
				"82%",
				"bg-violet-300",
				"w-[82%]"
			],
			[
				"Graphics QA",
				"71%",
				"bg-amber-300",
				"w-[71%]"
			],
			[
				"Ready to air",
				"64%",
				"bg-emerald-300",
				"w-[64%]"
			]
		];
		function $(e) {
			return e >= 60 ? "w-[60%]" : e >= 58 ? "w-[58%]" : e >= 56 ? "w-[56%]" : e >= 54 ? "w-[54%]" : e >= 52 ? "w-[52%]" : e >= 50 ? "w-[50%]" : e >= 48 ? "w-[48%]" : e >= 46 ? "w-[46%]" : e >= 44 ? "w-[44%]" : e >= 42 ? "w-[42%]" : "w-[40%]";
		}
		return (e, n) => (l(), r("section", f, [i("div", ee, [
			i("div", te, [
				i("div", ne, [i("div", null, [n[0] ||= i("p", { class: "text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200" }, "Race call desk", -1), i("h2", re, d(J.value.raceTitle), 1)]), i("span", ie, d(J.value.raceStatus), 1)]),
				i("div", p, [i("div", null, [i("div", m, [i("div", null, [i("p", h, d(J.value.candidateA), 1), n[1] ||= i("p", { class: "text-[11px] uppercase tracking-wider text-zinc-500" }, "Democratic", -1)]), i("div", g, [i("p", _, d(X.value) + "%", 1), i("p", v, d(J.value.candidateAVotes.toLocaleString()), 1)])]), i("div", y, [i("div", { class: c(["h-full rounded-sm bg-cyan-400", se.value]) }, null, 2)])]), i("div", null, [i("div", b, [i("div", null, [i("p", x, d(J.value.candidateB), 1), n[2] ||= i("p", { class: "text-[11px] uppercase tracking-wider text-zinc-500" }, "Republican", -1)]), i("div", S, [i("p", C, d(Z.value) + "%", 1), i("p", w, d(J.value.candidateBVotes.toLocaleString()), 1)])]), i("div", T, [i("div", { class: c(["h-full rounded-sm bg-red-500", ce.value]) }, null, 2)])])]),
				i("div", E, [
					i("div", D, [i("p", O, d(J.value.precinctsReporting) + "%", 1), n[3] ||= i("p", { class: "text-[10px] uppercase tracking-wider text-zinc-500" }, "Reporting", -1)]),
					i("div", k, [i("p", A, d(oe.value.toLocaleString()), 1), n[4] ||= i("p", { class: "text-[10px] uppercase tracking-wider text-zinc-500" }, "Margin", -1)]),
					n[5] ||= i("div", { class: "bg-white/[0.04] p-3" }, [i("p", { class: "font-mono text-xl font-black text-amber-200" }, "0.62"), i("p", { class: "text-[10px] uppercase tracking-wider text-zinc-500" }, "Call index")], -1)
				]),
				n[6] ||= i("div", { class: "mt-4 border-t border-white/10 pt-4" }, [i("p", { class: "mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-400" }, "Producer notes"), i("p", { class: "text-sm leading-5 text-zinc-300" }, " Hold call until Denver batch 11 and Pueblo verification clear. Lower-third package staged but not armed. ")], -1)
			]),
			i("div", j, [
				n[10] ||= i("div", { class: "mb-3 flex items-center justify-between" }, [i("div", null, [i("p", { class: "text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200" }, "Results wall"), i("h3", { class: "text-lg font-black text-white" }, "Colorado county map")]), i("div", { class: "rounded border border-white/10 bg-black/30 px-2 py-1 text-[10px] uppercase tracking-widest text-zinc-300" }, " 64 counties / live ")], -1),
				i("div", M, [
					n[8] ||= i("div", { class: "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.20),transparent_28%),radial-gradient(circle_at_72%_65%,rgba(239,68,68,0.18),transparent_30%)]" }, null, -1),
					i("div", ae, [(l(), r(t, null, u(le, ([e, t, n, r]) => i("div", {
						key: e,
						class: c([
							"flex min-h-16 flex-col justify-between rounded-sm border border-white/20 p-2 text-xs shadow-lg",
							n,
							r,
							e === J.value.selectedCounty ? "ring-2 ring-white" : ""
						])
					}, [i("span", N, d(e), 1), i("span", P, d(t), 1)], 2)), 64))]),
					i("div", F, [n[7] ||= o(" Selected: ", -1), i("span", I, d(J.value.selectedCounty), 1)]),
					n[9] ||= a("<div class=\"absolute bottom-4 right-4 flex gap-2 text-[10px] uppercase tracking-wider text-zinc-300\"><span class=\"inline-flex items-center gap-1\"><i class=\"size-2 rounded-full bg-cyan-300\"></i> Vega</span><span class=\"inline-flex items-center gap-1\"><i class=\"size-2 rounded-full bg-red-400\"></i> Cross</span><span class=\"inline-flex items-center gap-1\"><i class=\"size-2 rounded-full bg-violet-300\"></i> Close</span></div>", 1)
				]),
				i("div", L, [(l(), r(t, null, u(Q, ([e, t, n, r]) => i("div", {
					key: e,
					class: "bg-zinc-950 p-3"
				}, [i("div", R, [i("span", z, d(e), 1), i("span", B, d(t), 1)]), i("div", V, [i("div", { class: c([
					"h-full rounded",
					n,
					r
				]) }, null, 2)])])), 64))])
			]),
			i("div", H, [
				n[11] ||= i("p", { class: "mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200" }, "Newsroom rail", -1),
				i("div", U, [(l(), r(t, null, u(ue, ([e, t, n, r]) => i("div", {
					key: e,
					class: "border-b border-white/10 pb-3"
				}, [i("div", W, [i("div", null, [i("p", G, d(e), 1), i("p", K, d(t), 1)]), i("span", { class: c(["shrink-0 text-xs font-black uppercase", r]) }, d(n), 3)])])), 64))]),
				n[12] ||= a("<div class=\"mt-5 rounded border border-ct-destructive/40 bg-ct-destructive/10 p-3\"><p class=\"text-xs font-black uppercase tracking-widest text-red-200\">Verification required</p><p class=\"mt-2 text-sm leading-5 text-zinc-200\">Pueblo 14 provisional batch variance exceeds newsroom threshold.</p></div><div class=\"mt-5 grid grid-cols-2 gap-px overflow-hidden rounded border border-white/10 bg-white/10 text-xs\"><div class=\"bg-white/[0.04] p-3\"><p class=\"font-mono text-lg font-black text-white\">312</p><p class=\"uppercase tracking-wider text-zinc-500\">Feeds</p></div><div class=\"bg-white/[0.04] p-3\"><p class=\"font-mono text-lg font-black text-amber-200\">7</p><p class=\"uppercase tracking-wider text-zinc-500\">Flags</p></div><div class=\"bg-white/[0.04] p-3\"><p class=\"font-mono text-lg font-black text-cyan-200\">18</p><p class=\"uppercase tracking-wider text-zinc-500\">Live shots</p></div><div class=\"bg-white/[0.04] p-3\"><p class=\"font-mono text-lg font-black text-emerald-200\">94%</p><p class=\"uppercase tracking-wider text-zinc-500\">Healthy</p></div></div>", 2)
			])
		])]));
	}
});
//#endregion
export { q as default };

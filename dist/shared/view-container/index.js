import { createUuid as e } from "../../sdk/create-uuid.js";
import { z as t } from "zod";
//#region src/shared/view-container/index.ts
var n = t.string().trim().min(1), r = /^[a-z0-9]+(?:-[a-z0-9]+)*$/, i = "New view", a = [{
	canonicalIdTemplate: "view:<configured-view-id>",
	configSource: "views[].id",
	configSourceDescription: "Uses each normalized view id from the effective views config; resolveSlots remains the runtime source for realized slots.",
	acceptsChildren: !0,
	childScopeMode: "inherit",
	layoutKind: "grid",
	exampleConfig: { views: [{ id: "alpha" }] }
}], o = t.object({
	id: n,
	label: n,
	hashSlug: t.string().optional(),
	disabled: t.boolean().optional()
}), s = t.array(o), c = n.optional(), l = t.string().regex(r), u = t.object({
	activeViewId: n,
	hashSlug: l.optional()
}), d = t.object({
	activeViewId: n,
	previousViewId: n.optional(),
	hashSlug: l.optional()
}), f = {
	viewRequested: u,
	viewChanged: d
};
function p(e) {
	let t = C(e), n = w(t);
	return t.map((e, t) => ({
		id: e.id,
		label: e.label,
		...n[t] ? { hashSlug: n[t] } : {},
		disabled: e.disabled
	}));
}
function m(e, t) {
	let n = p(e), r = typeof t == "string" ? t.trim() : void 0, i = n.find((e) => e.id === r);
	return i && !i.disabled ? i.id : n.find((e) => !e.disabled)?.id;
}
function h(e, t = {}) {
	let n = t.slotIdPrefix ?? "view:";
	return p(e).map((e) => ({
		id: `${n}${e.id}`,
		label: e.label,
		acceptsChildren: !0,
		childScopeMode: "inherit",
		layoutKind: "grid"
	}));
}
function g(t = {}) {
	let n = O(t.idFactory?.()) ?? e(), r = D(t.label), i = S(t.hashSlug);
	return {
		id: n,
		label: r,
		...i ? { hashSlug: i } : {},
		...typeof t.disabled == "boolean" ? { disabled: t.disabled } : {}
	};
}
function _(e, t, n) {
	let r = D(n);
	return E(e, t, (e) => e.label === r ? e : {
		...e,
		label: r
	});
}
function v(e, t, n) {
	let r = e.findIndex((e) => e.id === t);
	if (r < 0) return e;
	let i = [...e], [a] = i.splice(r, 1);
	if (!a) return e;
	let o = k(n, i.length);
	return o === r ? e : (i.splice(o, 0, a), i);
}
function y(e, t, n) {
	let r = S(n);
	return E(e, t, (e) => {
		if (e.hashSlug === r) return e;
		let { hashSlug: t, ...n } = e;
		return {
			...n,
			...r ? { hashSlug: r } : {}
		};
	});
}
function b(e, t, n) {
	return E(e, t, (e) => (e.disabled ?? !1) === n ? e : {
		...e,
		disabled: n
	});
}
function x(e, t) {
	return e.some((e) => e.id === t) ? e.filter((e) => e.id !== t) : e;
}
function S(e) {
	if (typeof e == "string") return e.trim().replace(/^#+/, "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || void 0;
}
function C(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		let e = o.safeParse(r);
		!e.success || t.has(e.data.id) || (t.add(e.data.id), n.push({
			id: e.data.id,
			label: e.data.label,
			...e.data.hashSlug ? { hashSlug: e.data.hashSlug } : {},
			disabled: e.data.disabled ?? !1
		}));
	}
	return n;
}
function w(e) {
	let t = e.map((e) => S(e.hashSlug)), n = A(t);
	return T(t.map((t, r) => {
		if (!t) return;
		let i = e[r];
		if (i) return n.get(t) === 1 ? t : `${t}-${j(i.id)}`;
	}), e);
}
function T(e, t) {
	let n = /* @__PURE__ */ new Map(), r = Array.from({ length: e.length });
	e.forEach((e, t) => {
		e && n.set(e, [...n.get(e) ?? [], t]);
	});
	for (let [e, i] of n.entries()) {
		if (i.length === 1) {
			let t = i[0];
			t !== void 0 && (r[t] = e);
			continue;
		}
		[...i].sort((e, n) => (t[e]?.id ?? "").localeCompare(t[n]?.id ?? "")).forEach((n, i) => {
			let a = t[n];
			if (!a) return;
			let o = `${e}-${j(a.id)}`;
			r[n] = i === 0 ? o : `${o}-${i + 1}`;
		});
	}
	return r;
}
function E(e, t, n) {
	if (!e.some((e) => e.id === t)) return e;
	let r = !1, i = e.map((e) => {
		if (e.id !== t) return e;
		let i = n(e);
		return i !== e && (r = !0), i;
	});
	return r ? i : e;
}
function D(e) {
	return O(e) ?? i;
}
function O(e) {
	if (typeof e == "string") return e.trim() || void 0;
}
function k(e, t) {
	return Number.isFinite(e) ? Math.min(Math.max(Math.trunc(e), 0), t) : t;
}
function A(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) n && t.set(n, (t.get(n) ?? 0) + 1);
	return t;
}
function j(e) {
	return S(e) ?? "view";
}
//#endregion
export { g as createViewContainerItem, h as createViewContainerSlots, x as deleteViewContainerItem, l as hashSlugSchema, S as normalizeHashSlug, p as normalizeViewContainerItems, _ as renameViewContainerItem, v as reorderViewContainerItems, m as resolveActiveViewId, b as setViewContainerItemDisabled, y as setViewContainerItemHashSlug, d as viewChangedPayloadSchema, c as viewContainerActiveViewIdSchema, a as viewContainerDynamicSlotMetadata, f as viewContainerEventPayloadSchemas, o as viewContainerItemSchema, s as viewContainerItemsSchema, u as viewRequestedPayloadSchema };

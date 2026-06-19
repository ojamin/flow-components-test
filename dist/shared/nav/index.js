import { z as e } from "zod";
//#region src/shared/nav/index.ts
var t = e.string().trim().min(1), n = e.object({
	id: t.optional(),
	label: t,
	href: e.string().trim().optional(),
	description: e.string().trim().optional(),
	icon: e.string().trim().optional(),
	disabled: e.boolean().optional(),
	external: e.boolean().optional(),
	hashSlug: e.string().trim().optional(),
	children: e.array(e.unknown()).optional()
}), r = e.array(n), i = e.object({
	id: t.optional(),
	label: t,
	href: e.string().trim().default(""),
	description: e.string().trim().optional(),
	icon: e.string().trim().optional(),
	disabled: e.boolean().default(!1),
	external: e.boolean().default(!1),
	hashSlug: e.string().trim().optional()
}), a = i.extend({ children: e.array(e.unknown()).optional() }), o = i.extend({ children: e.array(a).optional() }), s = e.array(o), c = e.object({
	id: t,
	label: t,
	href: e.string().trim().optional(),
	hashSlug: e.string().trim().optional()
});
function l(e) {
	let t = [], n = e.map((e, n) => h(e, [n], 0, t)).filter((e) => e !== void 0), r = v(n), i = r.filter((e) => e.selectable), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
	for (let e of r) {
		let r = x(n, e) ?? [];
		s.has(e.id) ? t.push({
			code: "duplicate_id",
			message: `Navigation item id "${e.id}" is duplicated; active-id lookup will use the first occurrence.`,
			path: [...r, "id"],
			severity: "warning"
		}) : (s.add(e.id), a.set(e.id, e)), !(!e.hashTargetable || !e.hashSlug) && (c.has(e.hashSlug) ? t.push({
			code: "duplicate_hash_slug",
			message: `Navigation hash slug "${e.hashSlug}" is duplicated; hash lookup will use the first occurrence.`,
			path: [...r, "hashSlug"],
			severity: "warning"
		}) : (c.add(e.hashSlug), o.set(e.hashSlug, e)));
	}
	return {
		items: n,
		selectableItems: i,
		itemById: a,
		hashSlugMap: o,
		diagnostics: t
	};
}
function u(e, t = {}) {
	let n = y(e), r = S(t.activeItemId), i = r ? d(n, r) : void 0;
	if (i) return i.id;
	let a = S(t.activeHref);
	if (a) return n.selectableItems.find((e) => e.href === a)?.id;
}
function d(e, t) {
	let n = y(e), r = S(t);
	if (!r) return;
	let i = n.itemById.get(r);
	return i?.selectable ? i : n.selectableItems.find((e) => e.id === r);
}
function f(e, t = {}) {
	let n = y(e), r = t.includeNested ?? !0;
	return n.selectableItems.find((e) => r || e.depth === 0);
}
function p(e) {
	if (e) return {
		id: e.id,
		label: e.label,
		...e.href ? { href: e.href } : {},
		...e.hashSlug ? { hashSlug: e.hashSlug } : {}
	};
}
function m(e) {
	if (typeof e == "string") return C(e) || void 0;
}
function h(e, t, r, i, a = !1) {
	let o = n.safeParse(e);
	if (!o.success) {
		i.push({
			code: "invalid_item",
			message: "Navigation item must include a non-empty label.",
			path: t,
			severity: "warning"
		});
		return;
	}
	let s = g(o.data, t, r), c = _(s, i), l = c.length > 0, u = a || s.disabled, d = !u && !l, f = m(s.hashSlug), p = d && !!f;
	return l && s.href && i.push({
		code: "parent_href_ignored",
		message: "Navigation parent items with children are disclosure-only in V1; href is preserved but ignored for selection.",
		path: [...t, "href"],
		severity: "warning"
	}), l && f && i.push({
		code: "parent_hash_slug_ignored",
		message: "Navigation parent items with children are disclosure-only in V1; hashSlug is preserved but excluded from hash targets.",
		path: [...t, "hashSlug"],
		severity: "warning"
	}), {
		id: s.id,
		label: s.label,
		...s.href === void 0 ? {} : { href: s.href },
		...s.description ? { description: s.description } : {},
		...s.icon ? { icon: s.icon } : {},
		disabled: u,
		external: s.external,
		...f ? { hashSlug: f } : {},
		...l ? { children: c } : {},
		selectable: d,
		hashTargetable: p,
		depth: r
	};
}
function g(e, t, n) {
	let r = e.label.trim(), i = S(e.href), a = i ?? C(r);
	return {
		id: S(e.id) ?? (a || w(t)),
		label: r,
		...i === void 0 ? {} : { href: i },
		...e.description ? { description: e.description } : {},
		...e.icon ? { icon: e.icon } : {},
		disabled: e.disabled ?? !1,
		external: e.external ?? !1,
		...e.hashSlug ? { hashSlug: e.hashSlug } : {},
		childrenInputs: e.children,
		path: t,
		depth: n
	};
}
function _(e, t) {
	return e.childrenInputs?.length ? e.depth >= 1 ? (t.push({
		code: "children_depth_unsupported",
		message: "Navigation helpers support one child level; deeper children are ignored with this diagnostic.",
		path: [...e.path, "children"],
		severity: "warning"
	}), []) : e.childrenInputs.map((n, r) => h(n, [
		...e.path,
		"children",
		r
	], 1, t, e.disabled)).filter((e) => e !== void 0) : [];
}
function v(e) {
	return e.flatMap((e) => [e, ...e.children ? v(e.children) : []]);
}
function y(e) {
	return b(e) ? e : l(e);
}
function b(e) {
	return !Array.isArray(e) && "selectableItems" in e;
}
function x(e, t) {
	for (let [n, r] of e.entries()) {
		if (r === t) return [n];
		let e = r.children?.findIndex((e) => e === t) ?? -1;
		if (e >= 0) return [
			n,
			"children",
			e
		];
	}
}
function S(e) {
	if (typeof e == "string") return e.trim() || void 0;
}
function C(e) {
	return e.trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function w(e) {
	let t = e.map((e) => String(e).replace(/[^a-zA-Z0-9]+/g, "-")).join("-");
	return t ? `item-${t}` : "item";
}
//#endregion
export { f as findDefaultSelectableNavItem, d as findSelectableNavItem, a as navChildConfigItemSchema, o as navConfigItemSchema, s as navConfigItemsSchema, n as navItemSchema, r as navItemsSchema, m as normalizeNavHashSlug, l as normalizeNavItems, u as resolveActiveNavItemId, c as selectedNavItemSchema, p as toSelectedNavItem };

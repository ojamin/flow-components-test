import { z as e } from "zod";
//#region src/manifest.ts
var t = e.enum([
	"chart",
	"content",
	"civic",
	"data",
	"layout",
	"marketing",
	"theme",
	"transform",
	"vmap1",
	"viz"
]), n = e.string().regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)?$/, "Invalid component id."), r = e.string().regex(/^sha256:[a-f0-9]{64}$/, "Expected sha256:<64 lowercase hex characters>."), i = e.string().min(1).superRefine((t, n) => {
	(t.startsWith("/") || t.includes("\\") || t.split("/").includes("..")) && n.addIssue({
		code: e.ZodIssueCode.custom,
		message: "Path must be a package-local relative path without traversal."
	});
}), a = e.object({
	definition: i,
	renderer: i,
	configPanel: i,
	transform: i.optional()
}), o = e.object({
	mobileFullWidth: e.boolean().optional(),
	mobileMinRows: e.number().int().positive().optional()
}), s = e.object({
	id: e.string().min(1),
	label: e.string().min(1),
	description: e.string().min(1).optional(),
	appliesTo: e.enum(["fixture-data", "config"]).optional()
}), c = e.union([e.literal(!0), e.object({ notApplicable: e.string().min(1) })]), l = e.object({
	empty: c,
	loading: c,
	error: c,
	disabled: c,
	focus: c,
	keyboard: c,
	responsive: c
}), u = e.object({
	schemaVersion: e.literal(1),
	id: n,
	displayName: e.string().min(1),
	group: t,
	section: e.string().min(1).optional(),
	tags: e.array(e.string().min(1)),
	version: e.string().min(1),
	renderable: e.boolean(),
	responsiveDefaults: o.optional(),
	fixtureVariants: e.array(s).optional(),
	stateSupport: l.optional(),
	transformKind: e.enum(["module", "passthrough"]).default("module"),
	entry: a
}).superRefine((t, n) => {
	let r = t.entry.transform !== void 0;
	t.transformKind === "passthrough" && r && n.addIssue({
		code: e.ZodIssueCode.custom,
		path: ["entry", "transform"],
		message: "Passthrough component manifests must not declare entry.transform."
	}), t.transformKind === "module" && !r && n.addIssue({
		code: e.ZodIssueCode.custom,
		path: ["entry", "transform"],
		message: "Module component manifests must declare entry.transform."
	});
}), d = e.object({
	id: n,
	displayName: e.string().min(1),
	group: t,
	section: e.string().min(1).optional(),
	source: e.literal("static"),
	sourceId: e.string().min(1),
	version: e.string().min(1),
	renderable: e.boolean(),
	tags: e.array(e.string().min(1)),
	sourcePath: i,
	contentHash: r,
	runtimeRequirements: e.array(e.string().min(1)).optional(),
	responsiveDefaults: o.optional(),
	fixtureVariants: e.array(s).optional(),
	stateSupport: l.optional(),
	deprecated: e.boolean().optional(),
	experimental: e.boolean().optional()
}), f = e.object({
	id: t,
	displayName: e.string().min(1),
	componentIds: e.array(n)
}), p = e.object({
	schemaVersion: e.literal(1),
	sourceId: e.string().min(1),
	name: e.string().min(1),
	version: e.string().min(1),
	generatedAt: e.string().datetime(),
	packageName: e.string().min(1).optional(),
	commit: e.string().min(1).optional(),
	components: e.array(d),
	groups: e.array(f),
	fingerprints: e.object({
		manifestHash: r,
		filesHash: r
	})
});
function m(e, t = {}) {
	let n = u.parse(e);
	if (t.folderGroup && n.group !== t.folderGroup) throw Error(`Component manifest group "${n.group}" must match folder group "${t.folderGroup}".`);
	for (let e of t.requiredEntries ?? []) if (!n.entry[e]) throw Error(`Component manifest entry "${e}" is required.`);
	return n;
}
function h(e) {
	let t = p.parse(e), n = new Set(t.components.map((e) => e.id));
	for (let e of t.groups) for (let t of e.componentIds) if (!n.has(t)) throw Error(`Source manifest group "${e.id}" references unknown component "${t}".`);
	return t;
}
//#endregion
export { f as componentGroupSummarySchema, a as componentManifestEntrySchema, t as componentManifestGroupSchema, o as componentManifestResponsiveDefaultsSchema, u as componentManifestSchema, d as componentManifestSummarySchema, p as componentSourceManifestSchema, s as fixtureVariantMetaSchema, m as parseComponentManifest, h as parseComponentSourceManifest, c as stateApplicabilitySchema, l as stateSupportMetaSchema };

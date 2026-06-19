import { categoryOverrides as e, groupToCategory as t } from "./taxonomy.js";
//#region src/sdk/validate-component.ts
var n = [
	"empty",
	"loading",
	"error",
	"disabled",
	"focus",
	"keyboard",
	"responsive"
];
function r(e, t = {}) {
	let r = t.strict ? "error" : "warning", i = [];
	for (let t of e) if (t.renderable) {
		if ((!t.fixtureVariants || t.fixtureVariants.length === 0) && i.push({
			componentId: t.id,
			severity: r,
			field: "fixtureVariants",
			message: "Component definition is missing fixtureVariants metadata for package preview matrix coverage."
		}), !t.stateSupport) {
			i.push({
				componentId: t.id,
				severity: r,
				field: "stateSupport",
				message: "Component definition is missing StateSupport metadata for package preview matrix coverage."
			});
			continue;
		}
		for (let e of n) t.stateSupport[e] || i.push({
			componentId: t.id,
			severity: r,
			field: `stateSupport.${e}`,
			message: `Component definition is missing StateSupport.${e} metadata for package preview matrix coverage.`
		});
	}
	return i;
}
function i(n, r, i) {
	let a = [], o = r.id, s = (e, t, n, r) => a.push({
		componentId: o,
		field: e,
		manifestValue: t,
		definitionValue: n,
		message: r
	});
	n.id !== r.id && s("id", r.id, n.id, `Definition id "${n.id}" disagrees with manifest id "${r.id}"`), n.displayName !== r.displayName && s("displayName", r.displayName, n.displayName, `displayName disagrees: manifest="${r.displayName}" definition="${n.displayName}"`), String(n.version) !== r.version.split(".")[0] && s("version", r.version, n.version, `Major version disagrees: manifest="${r.version}" definition="${n.version}"`), n.renderable !== r.renderable && s("renderable", r.renderable, n.renderable, "renderable disagrees"), r.group !== i.folderGroup && s("group", r.group, i.folderGroup, `manifest.group "${r.group}" must match folder group "${i.folderGroup}"`);
	let c = i.folderGroup, l = i.taxonomy?.groupToCategory ?? t, u = (i.taxonomy?.categoryOverrides ?? e)[r.id] ?? l[c];
	return u ? u !== n.category && s("category", u, n.category, `Definition category "${n.category}" does not match group→category mapping for "${c}" (expected "${u}")`) : s("category", c, n.category, `No category mapping for folder group "${c}"`), a;
}
//#endregion
export { r as collectStateSupportMetadataIssues, i as findManifestDrift };

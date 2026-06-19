//#region src/sdk/manifest-metadata-validation.ts
var e = [
	"empty",
	"loading",
	"error",
	"disabled",
	"focus",
	"keyboard",
	"responsive"
];
function t(t) {
	let n = [];
	for (let r of t) if (r.renderable) {
		if ((!r.fixtureVariants || r.fixtureVariants.length === 0) && n.push(`${r.id} manifest is missing fixtureVariants metadata for package preview matrix coverage.`), !r.stateSupport) {
			n.push(`${r.id} manifest is missing StateSupport metadata for package preview matrix coverage.`);
			continue;
		}
		for (let t of e) r.stateSupport[t] || n.push(`${r.id} manifest is missing StateSupport.${t} metadata for package preview matrix coverage.`);
	}
	return n;
}
//#endregion
export { t as collectManifestMetadataIssues };

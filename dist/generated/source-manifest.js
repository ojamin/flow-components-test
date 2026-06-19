//#region src/generated/source-manifest.ts
var e = {
	schemaVersion: 1,
	sourceId: "flow-components-test",
	name: "Flow Components Test",
	version: "0.5.0",
	generatedAt: "1970-01-01T00:00:00.000Z",
	packageName: "@flow-builder/components",
	components: [{
		id: "demo.demo-button",
		displayName: "Button",
		group: "content",
		section: "basic",
		source: "static",
		sourceId: "flow-components-test",
		version: "1.0.0",
		renderable: !0,
		tags: [
			"cta",
			"link",
			"action"
		],
		sourcePath: "src/groups/content/button",
		contentHash: "sha256:4195792069a180b92ed941e7f7867404316aace673ec7e8474525ebd295b936c",
		fixtureVariants: [
			{
				id: "default",
				label: "Default button"
			},
			{
				id: "empty",
				label: "Missing label",
				appliesTo: "config"
			},
			{
				id: "disabled",
				label: "Disabled action",
				appliesTo: "config"
			}
		],
		stateSupport: {
			empty: !0,
			loading: { notApplicable: "Button does not perform component-owned async work." },
			error: { notApplicable: "Invalid or missing navigation targets render disabled fallbacks, not error UI." },
			disabled: !0,
			focus: !0,
			keyboard: !0,
			responsive: !0
		}
	}, {
		id: "demo.demo-text",
		displayName: "Text",
		group: "content",
		section: "basic",
		source: "static",
		sourceId: "flow-components-test",
		version: "1.0.1",
		renderable: !0,
		tags: [
			"text",
			"prose",
			"copy",
			"paragraph"
		],
		sourcePath: "src/groups/content/text",
		contentHash: "sha256:01b6f7921b28ec2dc378dac7d738eaf215bfb387f43005d674d294ba6284bc36",
		responsiveDefaults: { mobileFullWidth: !0 },
		fixtureVariants: [
			{
				id: "default",
				label: "Default copy"
			},
			{
				id: "empty",
				label: "Empty copy",
				description: "No text configured or resolved.",
				appliesTo: "config"
			},
			{
				id: "long",
				label: "Long copy",
				description: "Long prose for wrapping and clamping review.",
				appliesTo: "config"
			}
		],
		stateSupport: {
			empty: !0,
			loading: { notApplicable: "Text renders local config or already-resolved input data." },
			error: { notApplicable: "Text has no component-owned async or fallible runtime operation." },
			disabled: { notApplicable: "Text is non-interactive." },
			focus: { notApplicable: "Text exposes no focusable renderer surface." },
			keyboard: { notApplicable: "Text exposes no keyboard interaction." },
			responsive: !0
		}
	}],
	groups: [{
		id: "content",
		displayName: "Content",
		componentIds: ["demo.demo-button", "demo.demo-text"]
	}],
	fingerprints: {
		manifestHash: "sha256:94b18bc7eac090c2375dbe13415d45891d1cd286c0755bceedcf5fc14b3a0077",
		filesHash: "sha256:1655fbf74ae9168a78ba1e8abd75b2d61fccae462099180f484cde3b13918507"
	}
};
//#endregion
export { e as staticComponentSourceManifest };

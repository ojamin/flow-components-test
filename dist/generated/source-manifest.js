//#region src/generated/source-manifest.ts
var e = {
	schemaVersion: 1,
	sourceId: "flow-components-test-newsnight",
	name: "Newsnight Components",
	version: "0.5.0",
	generatedAt: "1970-01-01T00:00:00.000Z",
	packageName: "@flow-builder/newsnight-components",
	components: [
		{
			id: "demo.demo-button",
			displayName: "Button",
			group: "content",
			section: "basic",
			source: "static",
			sourceId: "flow-components-test-newsnight",
			version: "1.0.0",
			renderable: !0,
			tags: [
				"cta",
				"link",
				"action"
			],
			sourcePath: "src/groups/content/button",
			contentHash: "sha256:b3e96282766bf439f86def7dfcfde0f9d68a1cb3085a835a57bcd3ebd46aed9d",
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
		},
		{
			id: "demo.demo-text",
			displayName: "Text",
			group: "content",
			section: "basic",
			source: "static",
			sourceId: "flow-components-test-newsnight",
			version: "1.0.1",
			renderable: !0,
			tags: [
				"text",
				"prose",
				"copy",
				"paragraph"
			],
			sourcePath: "src/groups/content/text",
			contentHash: "sha256:d576a186d535865f450210a3c99cde2d8cdfee7d62e58ec4544f4964af028524",
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
		},
		{
			id: "content.newsnight-lower-third",
			displayName: "Newsnight Lower Third",
			group: "content",
			section: "custom",
			source: "static",
			sourceId: "flow-components-test-newsnight",
			version: "1.0.0",
			renderable: !0,
			tags: [
				"content",
				"newsnight",
				"broadcast",
				"lower-third",
				"producer"
			],
			sourcePath: "src/groups/content/newsnight-lower-third",
			contentHash: "sha256:26b5456547dedb56fbbdc8cd137c76bc5fa577c3c881a19960d230d5b22340de",
			fixtureVariants: [{
				id: "default",
				label: "Lower-third preview"
			}],
			stateSupport: {
				empty: { notApplicable: "Lower third always renders from configured copy." },
				loading: { notApplicable: "Lower third has no component-owned async operation." },
				error: { notApplicable: "Lower third has no component-owned fallible runtime operation." },
				disabled: { notApplicable: "Lower third is display-only." },
				focus: { notApplicable: "Lower third has no focusable renderer controls." },
				keyboard: { notApplicable: "Lower third exposes no keyboard interaction." },
				responsive: !0
			}
		},
		{
			id: "content.newsnight-masthead",
			displayName: "Newsnight Masthead",
			group: "content",
			section: "custom",
			source: "static",
			sourceId: "flow-components-test-newsnight",
			version: "1.0.0",
			renderable: !0,
			tags: [
				"content",
				"newsnight",
				"masthead",
				"broadcast",
				"ticker"
			],
			sourcePath: "src/groups/content/newsnight-masthead",
			contentHash: "sha256:0b36b75559a02908ab0e132a9c1dec0a2505485d6a50b82d7b79a6477a094b4b",
			fixtureVariants: [{
				id: "default",
				label: "Broadcast masthead"
			}],
			stateSupport: {
				empty: { notApplicable: "Masthead always renders from configured broadcast copy." },
				loading: { notApplicable: "Masthead has no component-owned async operation." },
				error: { notApplicable: "Masthead has no component-owned fallible runtime operation." },
				disabled: { notApplicable: "Masthead is display-only." },
				focus: { notApplicable: "Masthead has no focusable renderer controls." },
				keyboard: { notApplicable: "Masthead exposes no keyboard interaction." },
				responsive: !0
			}
		},
		{
			id: "content.newsnight-results-wall",
			displayName: "Newsnight Results Wall",
			group: "content",
			section: "custom",
			source: "static",
			sourceId: "flow-components-test-newsnight",
			version: "1.0.0",
			renderable: !0,
			tags: [
				"content",
				"newsnight",
				"results",
				"broadcast",
				"election",
				"dashboard"
			],
			sourcePath: "src/groups/content/newsnight-results-wall",
			contentHash: "sha256:78d21e8f9af4265d2fc3486db34b3a7d67b53ceb5b260841600d2f3dcb7b067b",
			fixtureVariants: [{
				id: "default",
				label: "Newsroom results wall"
			}],
			stateSupport: {
				empty: { notApplicable: "Results wall ships with configured demo data." },
				loading: { notApplicable: "Results wall has no component-owned async operation." },
				error: { notApplicable: "Results wall has no component-owned fallible runtime operation." },
				disabled: { notApplicable: "Results wall is display-only." },
				focus: { notApplicable: "Results wall has no focusable renderer controls." },
				keyboard: { notApplicable: "Results wall exposes no keyboard interaction." },
				responsive: !0
			}
		},
		{
			id: "content.status-badge",
			displayName: "Status Badge",
			group: "content",
			section: "custom",
			source: "static",
			sourceId: "flow-components-test-newsnight",
			version: "1.0.0",
			renderable: !0,
			tags: [
				"content",
				"status-badge",
				"status",
				"health"
			],
			sourcePath: "src/groups/content/status-badge",
			contentHash: "sha256:a3418d6e962ac20dc4412a4bb5b7170190a928b8262241435149b3205718f0ba",
			fixtureVariants: [
				{
					id: "default",
					label: "Default status"
				},
				{
					id: "empty",
					label: "Missing status copy",
					description: "Label and value are both empty.",
					appliesTo: "config"
				},
				{
					id: "warning",
					label: "Warning tone",
					description: "Operational warning state.",
					appliesTo: "config"
				}
			],
			stateSupport: {
				empty: !0,
				loading: { notApplicable: "Status Badge renders already-resolved config and input data." },
				error: { notApplicable: "Status Badge has no component-owned fallible runtime operation." },
				disabled: { notApplicable: "Status Badge is non-interactive." },
				focus: { notApplicable: "Status Badge exposes no focusable renderer surface." },
				keyboard: { notApplicable: "Status Badge exposes no keyboard interaction." },
				responsive: !0
			}
		}
	],
	groups: [{
		id: "content",
		displayName: "Content",
		componentIds: [
			"demo.demo-button",
			"demo.demo-text",
			"content.newsnight-lower-third",
			"content.newsnight-masthead",
			"content.newsnight-results-wall",
			"content.status-badge"
		]
	}],
	fingerprints: {
		manifestHash: "sha256:3c2c2cdd65277600b427783459c987bd814a943925e491396f3b5c672482d832",
		filesHash: "sha256:2be54f5d168fb2fbf0ce5a81efd63ecc0251710419b2f181719016c1163e621f"
	}
};
//#endregion
export { e as staticComponentSourceManifest };

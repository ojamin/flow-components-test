# Component config proof runbook

Use this runbook when a package component Config UI, manifest schema, `ConfigPanel.vue`, SchemaForm field, or config-to-render behavior changes.
It is written for agents who need a copy/pasteable app-integration proof path without rediscovering Builder, Preview, and packaged-export setup.
This page intentionally uses monorepo root app lanes because Builder, Preview, and packaged static export are host app surfaces.
For package-local standalone work, start with [Testing guide](testing-guide.md): `npm run check:standalone`, `npm run test:preview-app`, and `npm run preview:build` do not require parent app source.

## Verification ladder

Run the ladder from the monorepo repository root only when app-integration proof is requested, and adjust the affected lanes based on `check:changed:print` output and the user-facing behavior you changed.
`npm run refresh:generated` is a safe prerequisite convenience only; it is not proof that generated files are fresh.

1. Refresh generated artifacts that component contracts/config can invalidate:

   ```bash
   npm run refresh:generated
   ```

2. Print the changed-file plan:

   ```bash
   npm run check:changed:print -- --base develop
   ```

3. Run the package fast lane:

   ```bash
   npm run check:package:fast
   ```

4. Run the affected package group test lane, replacing `layout` with the changed group:

   ```bash
    npm run test:groups:layout --workspace @flow-builder/components
   ```

5. If public config contracts, SDK helpers, host catalog behavior, or the package preview app are touched, add the affected lanes:

   ```bash
   npm run test:sdk --workspace @flow-builder/components
   npm run test:app-integration:host --workspace @flow-builder/components
   npm run test:preview-app --workspace @flow-builder/components
   ```

6. Prove the Builder Config UI and downstream Preview/static behavior with the component-config lane.
   The root script builds first because the full lane includes packaged static-export proof:

   ```bash
   npm run test:e2e:component-config
   ```

   For a focused Builder/Preview-only iteration, run the visible Config proof spec directly:

   ```bash
   npm run test:e2e -- tests/e2e/config-panel-component-config-proof.spec.ts --workers=1
   ```

7. Run the app fast lane before handoff:

   ```bash
   npm run check:app:fast
   ```

Do not stop at changed-file planning or generated refresh.
Those commands narrow the first feedback loop; the affected package lanes, visible browser proof, and app fast lane are the proof path.

## Setup versus proof rules

- Prefer public automation APIs for deterministic setup: creating the project, creating a component instance, placing it in Builder, waiting for saved state, and reading persisted state.
- Exercise any changed user-facing Config control through the visible Builder Config UI before closeout.
- Do not prove a UI control by directly mutating a store, private Pinia state, or project JSON.
- A valid proof includes both durable state and user-visible output: persisted `paramValues`, Builder rendering, and Preview rendering.
- If a config change affects exported runtime output, exported assets, source materialization, or static-export eligibility, also prove packaged static-export cold-load behavior.

## Persisted `paramValues` assertion pattern

After interacting with the Config UI, assert the literal persisted value through the public automation surface or the helper wrapper:

```ts
await assertPersistedLiteralParamValue(page, {
  instanceId: "component-config-heading",
  paramKey: "level",
  expected: "h1",
});
```

This proves the Config UI wrote the shared component instance config state.
It does not replace Builder and Preview visible assertions.

## Preview and packaged-export triggers

Always include Preview proof when a Config value affects renderer output, bindings, emitted events, data loading, theme behavior, layout sizing, or accessibility-visible state.
Use the helper assertion that navigates to Preview and checks the rendered instance:

```ts
await assertPreviewInstanceTestIdTagName(page, {
  projectId: project.projectId,
  instanceId: "component-config-heading",
  testId: "heading-text",
  expectedTagName: "h1",
});
```

Add packaged-export proof when the changed Config path must survive production static export or when export/runtime materialization is part of the risk.
The full `npm run test:e2e:component-config` command already builds before running both component-config specs.
For a focused packaged-output proof after an existing build, run the static-export spec directly:

```bash
npm run test:e2e -- tests/e2e/static-export-component-config-proof.spec.ts --workers=1
```

## Proof-planning checklist

Before coding, mark each changed user-visible surface and copy the matching proof into the task plan.
Screenshots can support visual review, but screenshots alone do not prove persisted state; pair them with state, DOM, runtime, or packaged-output assertions.

| Changed surface                                                          | Required proof                                                                                                                            |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Generated component manifests, catalog entries, or source manifests      | `npm run refresh:generated`, then verify no stale generated diff remains.                                                                 |
| Package SDK, public config contracts, host catalog, or preview app seams | `npm run check:package:fast` plus affected `test:sdk`, `test:app-integration:host`, or `test:preview-app` lanes.                          |
| Package group renderer/config behavior                                   | `npm run check:package:fast` plus the affected group lane, for example `npm run test:groups:layout --workspace @flow-builder/components`. |
| Builder Config control                                                   | Visible Builder Config e2e interaction, persisted `paramValues` assertion, and Builder output assertion.                                  |
| Builder canvas/layout behavior                                           | Builder canvas e2e assertion for placement output, sizing, selection, or interaction state affected by the config.                        |
| Preview rendering/runtime behavior                                       | Preview e2e assertion whenever output, bindings, events, data, theme, sizing, or accessibility-visible state changes.                     |
| Packaged static export                                                   | `npm run build` and focused packaged-export e2e proof when exported runtime output or export eligibility can change.                      |
| Visual appearance review                                                 | Capture screenshots or run visual review only after state/output proof; include viewport/state notes with the artifact.                   |

Keep `npm run check:changed:print -- --base develop` in the ladder to plan affected lanes, but do not treat changed-file output or release gates as replacements for the user-visible proof above.

### Worked proof-plan example

Change: a package component adds a `Variant` Config select that changes renderer markup in Builder, Preview, and packaged static export.

Copy/paste plan:

```bash
npm run refresh:generated
npm run check:changed:print -- --base develop
npm run check:package:fast
npm run test:groups:layout --workspace @flow-builder/components
# If the change touches SDK/public contract seams, also run the applicable lanes:
npm run test:sdk --workspace @flow-builder/components
# Optional fast iteration before full closeout:
npm run test:e2e -- tests/e2e/config-panel-component-config-proof.spec.ts --workers=1
# Required full component-config lane for closeout:
npm run test:e2e:component-config
npm run check:app:fast
```

Evidence to capture: select `Variant` through Builder Config, assert the literal persisted `paramValues` value, assert Builder output, assert Preview output, assert the packaged site cold-loads with the selected variant, and request visual review only when screenshots or visual polish are part of the acceptance criteria.

## Minimal helper usage example

This example shows the intended setup and proof shape.
Adapt component IDs, instance IDs, field labels, test IDs, and expected values to the changed component.

```ts
import { expect, test } from "@playwright/test";

import {
  assertBuilderPlacementTestIdTagName,
  assertPersistedLiteralParamValue,
  assertPreviewInstanceTestIdTagName,
  builderPlacementOutput,
  createAndPlaceComponentInstance,
  createProjectFromHome,
  openBuilderConfigForPlacement,
  selectSchemaFormOption,
} from "./helpers/component-config-proof";

test("changed Config control persists and renders", async ({ page }) => {
  test.setTimeout(90_000);

  const project = await createProjectFromHome(page, {
    name: "Component Config Proof",
    pagePath: "/component-config-proof",
  });

  const placement = await createAndPlaceComponentInstance(page, {
    componentId: "content.heading",
    instanceId: "component-config-heading",
    paramValues: {
      text: { mode: "literal", value: "Config helper heading" },
      level: { mode: "literal", value: "h2" },
    },
    rect: { x: 0, y: 0, w: 24, h: 4 },
  });

  await openBuilderConfigForPlacement(page, {
    projectId: project.projectId,
    placementId: placement.id,
    configHeading: "Heading settings",
  });

  await selectSchemaFormOption(page, {
    fieldLabel: "Level",
    fieldKey: "level",
    optionName: "H1",
  });

  await assertPersistedLiteralParamValue(page, {
    instanceId: "component-config-heading",
    paramKey: "level",
    expected: "h1",
  });

  await assertBuilderPlacementTestIdTagName(page, {
    placementId: placement.id,
    testId: "heading-text",
    expectedTagName: "h1",
  });
  await expect(
    builderPlacementOutput(page, { placementId: placement.id, testId: "heading-text" }),
  ).toContainText("Config helper heading");

  await assertPreviewInstanceTestIdTagName(page, {
    projectId: project.projectId,
    instanceId: "component-config-heading",
    testId: "heading-text",
    expectedTagName: "h1",
  });
  // Add Preview text/content assertions when the changed Config value affects visible copy.
});
```

For packaged-output proof, use `exportAndOpenPackagedComponentConfigProof(...)` from `tests/e2e/helpers/component-config-proof.ts` as shown in `tests/e2e/static-export-component-config-proof.spec.ts`.

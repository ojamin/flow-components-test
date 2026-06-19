# Testing Guide

## Purpose

This guide collects package-local checks for component authors and agents.

## Component test files

Every package component folder must include:

```text
tests/cases.ts
tests/component.contract.test.ts
tests/component.render.test.ts
tests/component.transform.test.ts
```

The shared harness lives at `packages/components/src/testing/harness.ts` and is re-exported from `packages/components/src/testing` for component tests.

## Cases pattern

Put component-specific assertions in `tests/cases.ts`:

```ts
import { expect } from "vitest";

import type {
  StaticComponentContractCase,
  StaticComponentRenderCase,
  StaticComponentTransformCase,
} from "../../../../testing";

export const contractCases = [
  {
    name: "declares expected outputs",
    check: ({ definition }) => {
      expect(definition.outputs.map((output) => output.id)).toEqual(["all"]);
    },
  },
] as const satisfies readonly StaticComponentContractCase[];

export const renderCases = [
  {
    name: "renders configured label",
    paramValues: { label: { mode: "literal", value: "Promo Banner" } },
    check: ({ wrapper, capturedEvents, config }) => {
      expect(wrapper.text()).toContain("Promo Banner");
      expect(config.label).toBe("Promo Banner");
      expect(capturedEvents).toEqual([]);
    },
  },
] as const satisfies readonly StaticComponentRenderCase[];

export const transformCases = [
  {
    name: "passes fixture data to all",
    paramValues: { label: { mode: "literal", value: "Promo Banner" } },
    check: ({ outputs, config }) => {
      expect(config.label).toBe("Promo Banner");
      expect(outputs.all).toEqual({ label: "Promo Banner" });
    },
  },
] as const satisfies readonly StaticComponentTransformCase[];
```

Adjust the relative `../../../../testing` import only if the component folder depth changes; scaffolded package components under `src/groups/<group>/<folder>/tests` use that exact path.

## Contract tests

`component.contract.test.ts` should call `describeStaticComponentContract(componentDefinition, contractCases)`.
The harness verifies that the definition contract is valid, lazy renderer/config/transform modules load, the transform module exposes `outputSchema` and `transform`, and the config panel mounts with non-empty HTML.
Every component definition must declare `params`, using `params: {}` when it has no configurable params.
For components with configurable params, the harness also verifies that `paramsToConfigSchema(...)` stays in parity with `configSchema` and that every `bindable: true` param declares explicit compatible `bindFrom` sources.
For event-enabled components, the harness validates declared event payload schemas, requires `eventOutputs` to be present when `events` are declared, and verifies that each event-output binding targets a declared event and output.
Add contract cases for stable public expectations such as IDs, categories, slots, ports, dynamic port behavior, fixture presence, and compatibility invariants.

## Render tests

`component.render.test.ts` should call `describeStaticComponentRenderer(componentDefinition, renderCases)`.
The harness mounts the lazy renderer, parses config, supplies default fixture data from the definition, and expects non-empty HTML.
It also injects a synchronous `emitEvent(eventId, payload)` prop and exposes validated emissions as `capturedEvents` to render case checks.
Render cases may set `paramValues` on the harness case to exercise literal or bind-mode authoring state. The harness resolves those values against definition params and input values before mounting, then passes only the resolved `config` prop to the renderer. Do not pass raw `paramValues` or legacy `fields` through `mountOptions.props`; the harness rejects raw config-state props so renderer tests assert the runtime contract instead of editor storage details.
Add render cases for the component's real states: default, configured, empty, loading, error, disabled, responsive, or interactive output states where relevant.
Components with declared events must include renderer proof that each declared event can be emitted with a schema-valid payload; undeclared events and invalid payloads fail through the injected harness emitter.

## Transform tests

`component.transform.test.ts` should call `describeStaticComponentTransform(componentDefinition, transformCases)`.
The harness loads `definition.transform`, runs `transform(context)`, validates `outputSchema`, and checks outputs against the component's output port data types.
Module-transform components usually load `definition.transform` from `transform.ts`; passthrough components load the SDK-provided module returned by `createPassthroughTransform` and do not have a physical `transform.ts` file.
Transform cases may set `config` for schema/default variants or `paramValues` plus `inputs` for params-resolution variants. The harness resolves `paramValues` into schema-valid `config` before invoking the transform and exposes that resolved value as `context.config`. Transform assertions should inspect `context.config`, the case `config`, and outputs after resolution; transforms must not read raw `paramValues` or legacy instance config fields.
Add transform cases for fixture-driven outputs, config variants, input variants, empty/error behavior, and output-shape guarantees.

## Fixture data

Use `fixtures/sample-data.json` for representative data that the renderer, transform, and preview app can share.
Keep fixture data small, deterministic, and aligned with the declared outputs and displayed states.
Add additional fixtures only when tests or preview states need distinct examples.

## Sizing proof

Package renderers must preserve the sizing contract from the [Renderer guide](renderer-guide.md#sizing-contract).
The generic conformance test at `packages/components/src/sdk/__tests__/component-sizing-conformance.test.ts` checks all component root classes against each component's declared Builder height mode.
Use it when changing renderer roots or component sizing metadata:

```bash
npm run test:sdk -- src/sdk/__tests__/component-sizing-conformance.test.ts --maxWorkers=1
```

For browser-level proof across placement modes, use the package preview metric harness at `/#/content-height-metrics`.
The monorepo app-integration e2e spec `tests/e2e/content-height-package-metrics.spec.ts` builds the package preview app and checks every renderable package component across fixed, min, and auto width/height combinations; non-renderable components are skipped from the matrix by manifest.
That spec is host/repository integration proof, not required for package-local standalone authoring unless a maintainer asks for visual regression evidence.

```bash
npm run test:e2e -- tests/e2e/content-height-package-metrics.spec.ts --workers=1
```

## Package commands

Run package component tests through the package script:

```bash
npm run test:components
```

Run validation and generated-output freshness checks:

```bash
npm run generate:check
npm run validate
```

Regenerate generator-owned files after manifest or component source changes:

```bash
npm run generate
```

Run full package closeout checks:

```bash
npm run check:standalone
```

Package-local `check:standalone` runs generated-output validation, manifest validation, definition-loader proof, standalone policy checks, the high/critical production dependency audit, package and preview typechecks, package component tests, preview build, package build, `pack:dry-run`, `smoke:packed-consumer`, and `smoke:git-ref-consumer`.
Package-local `check` aliases the release check, which currently points to `check:standalone`.

## Toolchain and install proof

Package metadata declares the supported baseline:

- Node.js `>=22.0.0` through `engines.node`.
- npm `10.9.4` through `packageManager`.
- Vite+ through the `vite-plus` dev dependency and the `preview:dev` / `preview:build` scripts.
- Vue `^3.5.32` as a peer dependency.

Install and CI proof must use the standalone package lockfile:

```bash
npm ci
```

The monorepo currently includes `packages/components/package-lock.json` for this package.
Any temporary standalone checkout used for verification must contain the package lockfile before `npm ci` is considered proved.
Use `npm install` only when intentionally updating dependency metadata and the lockfile, then rerun `npm ci` in a clean package checkout before review.

## Package release and fast lanes

Use focused package-local lanes while iterating:

```bash
npm run typecheck:package
npm run typecheck:preview
npm run test:components:lanes:audit
npm run test:sdk
npm run test:groups
npm run test:preview-app
```

Use standalone policy and audit lanes when package metadata, imports, dependencies, fixtures, lifecycle scripts, export maps, or static-export hooks change:

```bash
npm run policy:standalone
npm run audit:prod
```

Use the committed-dist install smokes after package build/export-map changes:

```bash
npm run build
npm run smoke:packed-consumer
npm run smoke:git-ref-consumer
```

`smoke:git-ref-consumer` creates a temporary local Git repository on `protected-rehearsal`, commits the built `dist/` payload, installs it into a throwaway consumer with normal npm lifecycle handling enabled, and then builds that consumer.
It is the local equivalent of a protected Git-ref install and must not be replaced with app dependency-default changes.
The script cleans up its temp directories; if interrupted, remove only the matching `flow-builder-components-git-ref-smoke-*` temp directory.

The authoritative standalone closeout gate is:

```bash
npm run check:standalone
```

Run the package preview app when renderer/config/preview behavior changed:

```bash
npm run preview:dev
npm run preview:build
```

### App-integration lanes

The `test:components:lanes:audit` command is package coverage proof: it compares the broad component test file set with the split release-lane file set before those split lanes are trusted. During extraction it calls the monorepo helper under `scripts/testing`, but the package-local script name is the supported entry point.

Scripts named `test:app-integration:*` are monorepo host-compatibility checks.
They may call root app tests or root audit helpers and are not required for standalone package-local work.
Use them only when a change affects host catalog/source consumption or when a maintainer requests app integration evidence.

In the monorepo, the root changed-file planner can help decide whether app integration proof is needed:

```bash
npm run check:changed:print -- --base develop
```

Root `npm run check` / `npm run check:release` is branch-gated by `scripts/testing/run-release-check.mjs`: on non-`develop` branches it prints the changed-file planner advisory and exits unless forced with `FLOW_BUILDER_FULL_CHECK=1` or `--force-full-check`.
Use root `npm run check` only when the assignment asks for repository closeout beyond this package slice.

### Browser and Playwright policy

Package visual lanes must use the AIC-provided Playwright/Chrome browser installation.
Do not run `playwright install`, and do not download browsers into the repository, `packages/components/`, or Playwright cache directories as part of package-local setup.

### Visual/state regression lane

The package preview matrix has a Playwright state/screenshot regression lane that proves the `/matrix` route for representative components.
Run it from the repo root or the package directory:

```bash
npm run test:visual-state --workspace @flow-builder/components
# or, from packages/components:
npm run test:visual-state
```

The script builds the preview app (`npm run preview:build`), serves the production bundle on `127.0.0.1:4185` with `vp preview`, and runs `playwright test --config ./preview-app/playwright.config.ts`.

What the lane covers:

- State × theme matrix DOM for `demo.demo-button` and other package components (cells assert `data-state-applicability` matches the manifest, so dropping or relabeling `stateSupport` metadata fails the lane).
- Viewport switching (`?viewport=desktop|tablet|mobile`) drives the grid container width.
- Unknown component ids surface the matrix's "Component not found" error chrome instead of rendering blank.
- A full-page PNG of each matrix scenario is attached to the Playwright report under `packages/components/preview-app/playwright-report/` for visual review without committed snapshots.

Environment overrides:

- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` — system Chrome path. Defaults to `/opt/google/chrome/chrome` when present (AIC layout). The lane refuses to start without a system browser; it never downloads one.
- `PLAYWRIGHT_PREVIEW_APP_PORT`, `PLAYWRIGHT_PREVIEW_APP_HOST`, `PLAYWRIGHT_BASE_URL` — override the preview server bind address. Useful when the default port is occupied.
- `PLAYWRIGHT_SKIP_WEB_SERVER=1` — opt out of starting `vp preview` (assumes a server is already running at the base URL).

Artifacts and reports live under `packages/components/preview-app/playwright/.artifacts/`, `playwright-report/`, and `test-results/`; all three paths are gitignored by `packages/components/.gitignore`.

## Generated files

`src/generated/catalog.ts` and `src/generated/source-manifest.ts` are generator-owned checked-in artifacts.
Do not hand-edit them; run `npm run generate` instead.

## References

- [Authoring guide](authoring-guide.md)
- [Component contract](component-contract.md)
- [Manifest schema](manifest-schema.md)
- [Renderer guide](renderer-guide.md)

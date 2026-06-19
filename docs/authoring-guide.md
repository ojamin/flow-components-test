# Authoring Guide

## Purpose

This guide is the starting point for adding or changing built-in components in `@flow-builder/components`.
It keeps component work inside the package boundary so zero-knowledge agents can make accurate component changes without reaching into parent-app internals.

## Package component shape

Package components live under `src/groups/<group>/<folder>/` in the package checkout.
In the monorepo, that path is `packages/components/src/groups/<group>/<folder>/`.
Valid groups are `chart`, `content`, `data`, `layout`, `marketing`, `transform`, and `viz`.
For cohesive collection imports that may justify a new group, start with the [Collection import guide](collection-import-guide.md) before scaffolding.
Use the scaffold command instead of copying an existing component folder:

```bash
npm run scaffold -- --group content --folder promo-banner --id content.promo-banner --display-name "Promo Banner"
```

Preview the generated files without writing them:

```bash
npm run scaffold -- --group content --folder promo-banner --id content.promo-banner --display-name "Promo Banner" --dry-run
```

The scaffold defaults to a module-transform component and creates these files:

```text
packages/components/src/groups/<group>/<folder>/
├── component.manifest.json
├── component.ts
├── Renderer.vue
├── ConfigPanel.vue
├── transform.ts
├── types.ts
├── fixtures/sample-data.json
└── tests/
    ├── cases.ts
    ├── component.contract.test.ts
    ├── component.render.test.ts
    └── component.transform.test.ts
```

`npm run validate` requires that exact file set for module-transform component folders.
Set `--transform-kind passthrough` when the component should pass its `data` input through to the `all` output through `createPassthroughTransform` from `@flow-builder/components/sdk`.
Passthrough component folders must omit `transform.ts`, and their manifests must omit `entry.transform` while setting `transformKind` to `passthrough`.
Module-transform component folders keep `transformKind` as `module` and must include both `entry.transform` and `transform.ts`.

## Authoring boundaries

- Component code uses public package surfaces only: the root `@flow-builder/components/sdk`, approved SDK helper section subpaths documented in [SDK helper inventory and contract](sdk-helpers.md), `@flow-builder/components/component-ui`, package-local relative imports, Vue, Zod, and declared package dependencies.
- Use the root SDK for definition-loader-safe types and pure helpers; use SDK helper subpaths such as `sdk/browser`, `sdk/rendering`, `sdk/capabilities`, `sdk/three-d`, `sdk/interactions`, `sdk/data`, and `sdk/sanitization` when renderer/runtime helpers need browser, DOM, lifecycle, Three.js, interaction, data, or sanitizer support.
- Do not call browser globals such as `window`, `document`, `navigator`, `setTimeout`, or `requestAnimationFrame` directly when an SDK helper adapter exists.
- `@flow-builder/components/component-ui` is for config-panel and package UI facade primitives such as `SchemaConfigPanel`; it is not a general SDK helper bucket.
- Do not import parent-app stores, router modules, pages, app-shell UI, builder internals, or non-allowlisted runtime internals from component folders.
- Config panels import shadcn-vue primitives and config controls through `@flow-builder/components/component-ui` only.
- Do not import app-private legacy field helpers, migration helpers, or host config-state utilities. Package components author and test against the public params contract only.
- Styling must use Tailwind utility classes and shadcn-vue components from the facade; do not add ad hoc CSS files, Vue `<style>` blocks, or inline `style` attributes.
- Renderers and panels must support empty, loading, error, and disabled states where the component can encounter those states.
- Keep accessible labels, names, focus behavior, and semantic structure explicit in renderer and config-panel markup.
- Interactive renderers that need host-visible signals must declare `events` and `eventOutputs` in `component.ts` and emit through the renderer `emitEvent` prop; keep purely ephemeral UI state local to the renderer.

## Params API for configurable fields

Every component must declare `params` next to its `configSchema` so the host can resolve literal and bound values before rendering or transforming.
This is a required package contract across SDK types, host SDK adapters, registry/source loaders, dev-component validation, generated catalog output, runtime definition realization, and package validation.
Components with no configurable params must declare `params: {}`.
Use `param(...)` for each schema-backed field and derive the config schema with `paramsToConfigSchema(...)` so schema identity stays intact for harness validation:

```ts
import { defineConfigDefaults, param, paramsToConfigSchema } from "@flow-builder/components/sdk";

export const headingParams = {
  text: param(z.string().default("Headline"), {
    label: "Text",
    control: { kind: "input" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
  level: param(z.enum(["h1", "h2", "h3"]).default("h2"), {
    label: "Level",
    control: { kind: "select", options: [{ label: "H2", value: "h2" }] },
  }),
};

export const headingConfigSchema = paramsToConfigSchema(headingParams);
export const headingConfigDefaults = defineConfigDefaults(headingConfigSchema);
```

Add `params: headingParams` to `defineComponent(...)`; components without configurable fields add `params: {}` instead.
Mark only data-driven fields as `bindable: true` and always provide explicit non-empty `bindFrom`; structural fields such as layout, variant, sizing, and alignment stay literal-only.
Renderers and transforms still receive a flat resolved `config` object — they must not read `paramValues` directly.
The host persists literal/bind authoring state in `ComponentInstance.paramValues` and resolves it through `resolveParamValues(...)` before invoking runtime/render paths.
Config panels may emit only declared params: use `update:config` for literal resolved config patches and `update:paramValues` for literal-vs-bind state patches. Both event payloads are host-validated against `params`; undeclared keys are contract failures, not private extension points.

## Required authoring workflow

1. Pick the group/folder.
2. Scaffold the component.
3. Fill `component.manifest.json`.
4. Implement `component.ts` with root SDK definition/config helpers.
5. Implement `Renderer.vue`, checking [SDK helper inventory and contract](sdk-helpers.md) before adding browser, rendering, sanitization, interaction, data, or Three.js utilities.
6. Implement `ConfigPanel.vue` with `@flow-builder/components/component-ui` for UI/config primitives.
7. Implement transform/runtime behavior, or choose `transformKind: "passthrough"` and use `createPassthroughTransform` when the component only forwards `data` to `all`.
8. For interactive components, declare event payload schemas and event-output bindings, then add renderer cases that emit each declared event through `emitEvent`.
9. Add fixture data.
10. Add cases.
11. Add contract/render/transform tests.
12. Run package validation.
13. Run package preview app.
14. Update docs if adding a new pattern.

Use the supported commands below for the scaffold, validation, test, and preview steps.

## Supported package commands

Use only commands that exist in `packages/components/package.json`:

```bash
npm run scaffold -- --group content --folder promo-banner --id content.promo-banner --display-name "Promo Banner"
npm run scaffold -- --group content --folder promo-banner --id content.promo-banner --display-name "Promo Banner" --dry-run
npm run generate
npm run generate:check
npm run validate
npm run typecheck
npm run typecheck:package
npm run typecheck:preview
npm run test:components
npm run test:sdk
npm run test:groups
npm run test:preview-app
npm run policy:standalone
npm run audit:prod
npm run check:standalone
npm run build
npm run pack:dry-run
npm run preview:dev
npm run preview:build
```

Run these commands from this repository root.
If you intentionally run from the monorepo root, append `--workspace @flow-builder/components` to the package command.
Run `npm run generate` after manifest or component source changes so generator-owned outputs stay in sync.
Run `npm run check:standalone` before closing package component work.
Use `npm run preview:dev` to inspect the preview app while authoring and `npm run preview:build` to prove the preview app builds.
Root/app integration scripts are named `test:app-integration:*`; they are optional host-compatibility evidence and not part of standalone package-local authoring unless requested.

## Generated files

`src/generated/catalog.ts` and `src/generated/source-manifest.ts` are generator-owned checked-in artifacts.
Do not hand-edit them.
Update them only with:

```bash
npm run generate
```

## References

- [Component contract](component-contract.md)
- [Collection import guide](collection-import-guide.md)
- [SDK helper inventory and contract](sdk-helpers.md)
- [Manifest schema](manifest-schema.md)
- [Renderer guide](renderer-guide.md)
- [Config panel guide](config-panel-guide.md)
- [Testing guide](testing-guide.md)
- [Agent playbook](agent-playbook.md)

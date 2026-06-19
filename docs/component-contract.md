# Component Contract

## Purpose

This document summarizes the package-level contract exposed by component definitions.
The canonical source is `packages/components/src/sdk/public-sdk.ts`.

## Definition source

Every package component exports `componentDefinition` from `component.ts` and creates it with `defineComponent()` from `@flow-builder/components/sdk`:

```ts
import { z } from "zod";
import {
  defineComponent,
  defineConfigDefaults,
  param,
  paramsToConfigSchema,
} from "@flow-builder/components/sdk";

export const params = {
  title: param(z.string().default("Promo Banner"), {
    label: "Title",
    control: { kind: "input" },
    bindable: true,
    bindFrom: [{ input: "data", typeId: "all-data" }],
  }),
};
export const configSchema = paramsToConfigSchema(params);
export const configDefaults = defineConfigDefaults(configSchema);

export const componentDefinition = defineComponent({
  id: "content.promo-banner",
  version: 1,
  source: "static",
  displayName: "Promo Banner",
  icon: "box",
  category: "content",
  renderable: true,
  configSchema,
  configDefaults,
  params,
  builder: { defaultSize: { w: 6, h: 3 }, heightMode: "content" },
  flow: { tint: "content" },
  inputs: [{ id: "data", label: "Data", typeId: "all-data" }],
  outputs: [{ id: "all", label: "All data", typeId: "all-data" }],
  events: [
    {
      id: "submitted",
      label: "Submitted",
      payloadSchema: z.object({ ok: z.boolean() }),
    },
  ],
  eventOutputs: [{ eventId: "submitted", outputId: "all" }],
  renderer: async () => (await import("./Renderer.vue")).default,
  configPanel: async () => (await import("./ConfigPanel.vue")).default,
  transform: () => import("./transform"),
  loadFixtureData: async () => (await import("./fixtures/sample-data.json")).default,
});
```

The example above is illustrative; keep each field aligned with the component's actual behavior and tests.

## Public SDK-only imports

- Use the root `@flow-builder/components/sdk` for `defineComponent`, `StaticComponentRenderProps`, transform/runtime types, config helpers, data-type helpers, and other lightweight definition-safe helpers.
- Use approved SDK helper section subpaths for runtime-bound helpers: `@flow-builder/components/sdk/browser` for guarded browser adapters, `sdk/rendering` for lifecycle/frame-loop helpers, `sdk/capabilities` for feature probes, `sdk/three-d` for Three-backed helpers, `sdk/interactions` for keyboard/ARIA helpers, `sdk/data` for reusable data helpers, and `sdk/sanitization` for HTML/text sanitizers.
- Do not call browser globals such as `window`, `document`, `navigator`, timers, animation frames, `matchMedia`, clipboard APIs, or DOMPurify/window setup directly when a public SDK helper covers the need.
- Use `@flow-builder/components/component-ui` only from config panels or UI code that needs the package component-UI facade; it provides UI/config primitives and is not the place for generic SDK helper logic.
- Use package-local relative imports for the component's own `types.ts`, fixture data, renderer, config panel, and transform.
- Do not import parent-app stores, router modules, pages, app-shell UI, builder internals, or non-allowlisted runtime internals.

## Definition fields

Treat these `ComponentDefinition` fields as public package contract:

| Field                                             | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                                              | Stable component ID. Scaffolded components use `<group>.<name>` and the group namespace must match the folder group.                                                                                                                                                                                                                                                                                                                                                                                                     |
| `version`                                         | Numeric definition version used by package consumers and compatibility checks. Prefer additive changes before increasing behavior expectations.                                                                                                                                                                                                                                                                                                                                                                          |
| `displayName`, `description`, `icon`, `category`  | User-facing metadata shown in catalog, Builder, Flow, and docs. Keep terminology consistent with the manifest.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `renderable`                                      | `true` when the component has visible canvas/preview output. Non-renderable components still keep scaffolded renderer/config/test files until the harness contract changes.                                                                                                                                                                                                                                                                                                                                              |
| `slots`                                           | Optional static layout child slots. Omit when unused; `defineComponent()` defaults to `[]`. Components with `resolveSlots` still use these as the deterministic fallback.                                                                                                                                                                                                                                                                                                                                                |
| `configSchema`, `configDefaults`                  | Zod schema and defaults. The schema must resolve to an object. Create defaults with `defineConfigDefaults(configSchema)` so empty-input defaults stay consistent.                                                                                                                                                                                                                                                                                                                                                        |
| `params`                                          | Required parameter descriptors for component configuration. Components with no configurable params must declare `params: {}`. Derive `configSchema` from the definition params with `paramsToConfigSchema(...)`; `bindable: true` params must declare non-empty compatible `bindFrom` sources. Hosts persist literal/bind authoring state in `ComponentInstance.paramValues`, then resolve renderer/config/transform/runtime inputs from definition params plus `paramValues` rather than legacy instance config fields. |
| `builder`                                         | Builder sizing, resize, drag, height-mode, and wrapper behavior. Keep it consistent with render behavior.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `flow`                                            | Flow node metadata such as default node size, scaffolded state, and tint.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `inputs`, `outputs`                               | Static port definitions. Outputs must use known data type IDs for harness validation.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `events`                                          | Optional renderer event declarations for user-driven signals. Each event needs a stable `id`, label, and Zod `payloadSchema`; set `payloadTypeId` only when the schema is the canonical schema for that data type.                                                                                                                                                                                                                                                                                                       |
| `eventOutputs`                                    | Optional bindings from declared events to output ports. Use them when event payloads should update runtime outputs; omit events entirely when the renderer only has local UI state, and use `eventOutputs: []` for capture-only declared events. Current-state event outputs, such as selected values or viewport state, should declare `initial` so runtime outputs are seeded before the first emitted event.                                                                                                          |
| `resolvePorts`                                    | Optional dynamic port resolver derived from parsed config and existing port definitions. Prefer deterministic, additive behavior.                                                                                                                                                                                                                                                                                                                                                                                        |
| `resolveSlots`                                    | Optional dynamic slot resolver derived from parsed config and existing slot definitions. Consumers call `resolveComponentSlots(...)`; components without a resolver, or calls with invalid config, fall back to static `slots`.                                                                                                                                                                                                                                                                                          |
| `renderer`, `configPanel`, `transform`, `runtime` | Lazy module loaders. The current required scaffold includes renderer, config panel, and transform entries.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `loadFixtureData`                                 | Async loader for package-local sample data used by render and transform tests and preview states. Consumers should resolve it through `resolveFixtureData(definition)`.                                                                                                                                                                                                                                                                                                                                                  |

## Compatibility rules

- Keep component IDs stable after publication through the package catalog.
- Treat omitted `params` as a contract error everywhere a package definition is consumed: package SDK, host SDK, registry/source loaders, dev-component validation, generated catalog output, package validation, and runtime definition realization all expect an own `params` object.
- Use `params: {}` for definitions with no configurable params; do not rely on helper defaults to make missing params acceptable in shipped components.
- Set `flow.scaffolded === false` only for definitions that must stay out of Flow add/picker authoring surfaces; Flow inspectors must treat those nodes as non-authorable and avoid exposing editable Flow field controls for them.
- Keep source classification out of `ComponentDefinition`; generated catalog/source-manifest records carry `source: "static"` plus the external repository `sourceId` metadata.
- Prefer additive config fields, ports, fixtures, and UI states.
- Do not remove or rename config keys, port IDs, output data shapes, event IDs, slot IDs, or manifest IDs without a migration note and release-note callout.
- Keep `component.manifest.json`, `component.ts`, renderer/config panel behavior, transform outputs, and tests in agreement.
- Do not import or recreate app-private legacy config helpers, legacy field migration helpers, or host-only config-state utilities in package definitions, renderers, transforms, runtimes, config panels, tests, or generated/dev-component contracts.
- Call out breaking definition or behavior changes in release notes and migration docs.

## State support policy

`stateSupport` is a per-state contract, not boilerplate. Each of
`empty`, `loading`, `error`, `disabled`, `focus`, `keyboard`, and `responsive`
must be either `true` or `{ notApplicable: "<reason>" }`, and the chosen value
must be defensible against the shipped renderer:

- Declare `true` only when the renderer has a distinct, reviewable
  presentation or interaction for that state, and a fixture variant or render
  test exercises it. An empty state must render meaningful content (not blank
  space); an error state must name the failure class and a safe next action.
- Declare `{ notApplicable: reason }` when the state cannot occur for the
  component. The reason must describe the renderer that actually shipped
  (for example, loading is not applicable to renderers that perform no
  component-owned asynchronous work).

Family expectations:

- **Data-driven renderables** (charts, viz, tables, lists, maps, and anything
  that resolves bound input data): `empty` and `error` MUST be `true` and
  implemented. Missing data, unresolvable paths, and wrong-shaped values are
  normal authoring situations, not edge cases. Use the `viz.gauge` tones as
  the reference implementation.
- **Static/authored-content renderables** (headings, text, dividers, layout
  shells, marketing copy blocks): `empty`/`error` are usually
  `notApplicable` — schema defaults guarantee renderable copy and no parsing
  happens. Do not declare `true` to look complete.
- **Interactive renderables** (buttons, links, form controls, tabs,
  accordions): `focus` and `keyboard` MUST be `true` and visibly implemented.
- `loading: true` is reserved for components with component-owned async work
  (service derivation, image/tile loading). Everything else marks it
  `notApplicable`.

Conformance has both mechanical and review-enforced layers:

- The package validator (`npm run validate`) mechanically checks
  `empty`, `error`, and `loading`. A checked state declared `true` with no
  renderer handling markers and no matching fixture variant fails validation
  unless the component is listed in the frozen baseline
  (`tooling/state-support-baseline.json`). The baseline only shrinks; new
  components and new checked-state claims must conform from the start.
- `disabled`, `focus`, `keyboard`, and `responsive` are policy/review-enforced
  today. Authors still must make those declarations match the shipped renderer,
  but the validator does not yet prove them automatically. Do not cite package
  validation as proof for those states until the conformance tooling expands.

## Dynamic slot IDs

Use `resolveSlots` only when a component's child placement slots are derived from parsed component config.
The resolver receives `{ config, slots }` and must return plain `SlotDefinition[]` data through `{ slots: [...] }`.
When no resolver is present, or the supplied config does not satisfy `configSchema`, hosts use the static `slots` array unchanged.
Consumers should call `resolveComponentSlots(...)` rather than reading `definition.slots` directly when a component may define dynamic slots.

Slot IDs are persisted by projects, so every static and dynamic slot ID must be stable across label edits, localization changes, and item reordering.
Never derive persisted slot IDs from user-facing labels, translated text, array indexes, or the current order of a config array.
Prefer explicit durable IDs stored in config, or deterministic IDs from stable domain keys that remain valid when labels or ordering change.

For view-container components, the durable view `id` drives the derived slot ID, while the optional `hashSlug` is public URL identity only.
Do not use labels or hash slugs as structural slot IDs.
See [View container components](view-container-components.md) for the shared helper, active-state, hash-sync, and host-owned slot-realization contract used by `layout.view-stack` and `layout.tabs`.

## Chart event semantics

The built-in chart components expose only the interactions currently backed by the minimum Unovis hooks: point or slice clicks and legend item clicks.
Do not document or emit stretch interactions unless a future implementation slice adds hooks, schemas, and tests for them.

| Component                 | Event           | Payload type            | Payload shape                                             | Meaning                                                                |
| ------------------------- | --------------- | ----------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| `chart.bar`, `chart.line` | `pointClicked`  | `chart-cartesian-point` | `{ x: number \| string, y: number, seriesName?: string }` | A rendered cartesian datum was clicked.                                |
| `chart.donut`             | `pointClicked`  | `chart-donut-slice`     | `{ label: string, value: number }`                        | A rendered donut slice was clicked.                                    |
| All chart components      | `legendToggled` | `chart-legend-state`    | `{ seriesName: string, visible: boolean }`                | A legend item was clicked and the payload reports its next visibility. |

`seriesHovered`, `rangeSelected`, and `zoomed` are intentionally excluded from the current chart contract.
They were considered stretch events, but this tranche only ships the interactions needed for point or slice click and legend item click behavior.

## Related package files

- `src/sdk/public-sdk.ts` defines `ComponentDefinition`, renderer props, transform contracts, runtime contracts, data helpers, and `defineComponent()`.
- `docs/sdk-helpers.md` documents the approved root-versus-subpath SDK helper topology and direct-global bans.
- `src/sdk/component-ui.ts` is the allowed config-panel UI facade.
- `src/generated/catalog.ts` is generator-owned and checked in.
- `src/generated/source-manifest.ts` is generator-owned and checked in.

## References

- [Manifest schema](manifest-schema.md)
- [SDK helper inventory and contract](sdk-helpers.md)
- [View container components](view-container-components.md)
- [Renderer guide](renderer-guide.md)
- [Config panel guide](config-panel-guide.md)
- [Transform and runtime guide](transform-runtime-guide.md)
- [Testing guide](testing-guide.md)

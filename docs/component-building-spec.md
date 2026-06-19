# Component Building Specification

**Status:** Canonical for new and changed package components.  
**Scope:** Components under `packages/components/src/groups/**`, including built-in
components, imported collection components, and component forks before they are
accepted into the built-in package.

RFC 2119 terms (MUST, MUST NOT, SHOULD, SHOULD NOT, MAY) are normative. Each rule
has a stable `CBS-###` ID for review, tests, and future lint enforcement.

## 1. Purpose

This specification prevents component work from becoming feature-specific,
single-use UI or logic. A package component is a reusable unit of functionality
with a public contract. It communicates only through declared inputs, outputs,
events, params, and slots. Any feature that needs multiple responsibilities must
be composed from multiple smaller components instead of hidden inside one large
component.

## 2. Component acceptance gates

A component is acceptable only when all of these gates pass:

1. **Reusable unit:** the component has a generic responsibility and can be named
   without referencing one specific page, customer, demo, route, or workflow.
2. **Modular composition:** separate concerns are represented as separate
   components, slots, runtime services, or SDK helpers rather than one monolith.
3. **Contract-only communication:** all external data flow uses declared inputs,
   outputs, params, event payloads, event outputs, or slots.
4. **Package boundary:** component code imports only package-approved public
   surfaces and package-local files.
5. **Proof:** contract, render, transform/runtime, fixture, and event tests prove
   the public contract rather than only a hard-coded happy path.

If any gate fails, do not merge the component as-is. Split it, generalize it, or
move feature orchestration back to the host/app layer.

## 3. Normative rules

### 3.1 Reusable responsibility

| Rule      | Requirement                                                                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CBS-001` | A component MUST represent one reusable unit of functionality, such as rendering structured content, visualizing a data shape, transforming data, collecting an interaction, or defining layout slots.      |
| `CBS-002` | A component MUST NOT be named, described, or implemented around one app route, one demo dataset, one customer, one project, or one workflow step unless that domain is itself the reusable generic unit.    |
| `CBS-003` | Component IDs and folder names MUST describe the generic capability (`content.table`, `viz.map`, `layout.tabs`), not a feature assembly (`dashboard-summary-page`, `campaign-flow`, `checkout-experience`). |
| `CBS-004` | A component SHOULD expose reusable options through `params` and config defaults rather than cloning near-identical components for copy, colors, labels, or simple layout variants.                          |

### 3.2 Modular composition

| Rule      | Requirement                                                                                                                                                                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CBS-101` | A component MUST NOT combine independent responsibilities that can be composed through Flow, Builder placement, slots, or shared SDK helpers.                                                                                                                              |
| `CBS-102` | If a proposed component needs two or more independently useful rendering regions, data transforms, interaction models, or reusable layout behaviors, those concerns SHOULD be split into separate components or slots.                                                     |
| `CBS-103` | Layout containers MUST expose child placement through declared `slots` or `resolveSlots`; they MUST NOT hard-code unrelated feature content inside the renderer.                                                                                                           |
| `CBS-104` | Shared logic used by multiple components MUST live in package-local SDK/helper modules, not be copied between component folders or hidden inside one renderer.                                                                                                             |
| `CBS-105` | Feature orchestration belongs in project state, Flow connections, Builder composition, or host surfaces. A component MUST NOT become a private mini-app with its own implicit workflow state unless the workflow is the reusable component contract and is fully declared. |

### 3.3 Inputs, outputs, and events

| Rule      | Requirement                                                                                                                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CBS-201` | Every value consumed from outside the component MUST enter through declared `inputs`, resolved `params`/config, fixture data for tests/previews, or declared slots.                                                                                         |
| `CBS-202` | Every value or signal exposed outside the component MUST leave through declared `outputs`, declared renderer `events`, `eventOutputs`, or slot structure.                                                                                                   |
| `CBS-203` | Components MUST NOT read or mutate host stores, router state, global project state, Builder state, Flow state, or Preview state directly.                                                                                                                   |
| `CBS-204` | Interactive renderer behavior that has host-visible meaning MUST declare `events` with stable IDs and Zod payload schemas.                                                                                                                                  |
| `CBS-205` | When an event should update runtime data, the component MUST declare `eventOutputs` that map the event payload to output ports. Capture-only events MUST use `eventOutputs: []`; purely local UI state MUST remain internal and undocumented as host state. |
| `CBS-206` | Output ports MUST use known SDK data type IDs and stable output shapes. Do not infer undocumented output fields from fixture-only data.                                                                                                                     |
| `CBS-207` | Components MUST NOT communicate through module-level mutable singletons, DOM events outside the declared renderer event contract, local storage, URL/hash changes, timers that mutate host state, or other side channels.                                   |

### 3.4 Generic data and configuration

| Rule      | Requirement                                                                                                                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CBS-301` | Config schemas MUST describe reusable behavior controls, not one-off feature data. Feature data belongs in project data sources, inputs, or fixtures used only for preview/test proof.                                                  |
| `CBS-302` | Bindable fields MUST use `params` with explicit compatible `bindFrom` sources. Structural fields such as layout, visual variant, sizing, and alignment SHOULD stay literal-only unless there is a clear reusable data-binding contract. |
| `CBS-303` | Fixture data MUST be generic sample data for exercising states and contracts. It MUST NOT be the hidden runtime dependency for a production feature.                                                                                    |
| `CBS-304` | A component MUST handle empty, loading, error, disabled, and invalid-data states when those states are reachable through its declared inputs/config/runtime services.                                                                   |

### 3.5 Package boundaries

| Rule      | Requirement                                                                                                                                                                                                                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CBS-401` | Component folders MUST use only `@flow-builder/components/sdk` (including approved documented SDK subpaths such as `@flow-builder/components/sdk/markdown`), `@flow-builder/components/component-ui`, `@flow-builder/components/runtime-services`, package-local relative imports, Vue, Zod, and declared package dependencies. |
| `CBS-402` | Component folders MUST NOT import parent-app stores, router modules, pages, app-shell UI, Builder internals, Flow internals, Preview internals, static-export helpers, or other host-only code.                                                                                                                                 |
| `CBS-403` | Renderer and config UI styling MUST follow the package design-system rules: Tailwind utility classes, shadcn-vue primitives through the package facade, no inline `style`, no Vue SFC `<style>` blocks, and no ad hoc CSS files.                                                                                                |

## 4. Monolith split triggers

Before creating or accepting a component, check for these split triggers. One or
more triggers means the author MUST document why the component remains a single
generic unit, or split it before merge.

| Trigger                                                                                                | Required response                                                                                                   |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| The renderer has multiple independently reusable visual regions.                                       | Split into layout slots and child components, or separate renderer components backed by shared helpers.             |
| The component both fetches/transforms data and renders unrelated presentation.                         | Prefer a `data.*` or `transform.*` component feeding a separate render component through Flow.                      |
| Multiple output shapes represent unrelated concepts.                                                   | Split into focused transform/data components, or define a clear compound data type if the concepts are inseparable. |
| The config schema contains page copy, demo labels, customer-specific fields, or workflow-only toggles. | Move feature data into project data/configuration or generalize the params.                                         |
| The component needs direct host state access to work.                                                  | Redesign the contract to use inputs, outputs, events, params, slots, or runtime-service facades.                    |
| Tests require one hard-coded project scenario and cannot express reusable cases.                       | Split/generalize until contract tests can cover generic inputs, outputs, and states.                                |

## 5. Component creation checklist

Use this checklist before scaffolding and again before closeout.

```text
1. Name the reusable unit in one sentence without page/customer/demo wording.
2. List declared inputs and the data type each accepts.
3. List declared outputs and the data type/shape each produces.
4. List declared events, payload schemas, and eventOutputs, or state why no host-visible events exist.
5. List params/config fields and identify which fields are bindable vs literal-only.
6. Identify slots or child-composition seams for layout/container components.
7. Identify any shared helpers/runtime services needed by more than one component.
8. Check every monolith split trigger and record the split/generalization decision.
9. Confirm package-boundary imports only.
10. Confirm tests prove contract, render states, transform/runtime behavior, and events.
```

## 6. Review questions

Reviewers MUST ask these questions for every new component or major component
change:

- Could this component be reused in a different project with different data and
  labels without code changes?
- Is any feature-specific workflow hidden inside the renderer, transform, or
  config panel?
- Are independent responsibilities split into components, slots, or helpers?
- Does every external input and output appear in `component.ts` as a declared
  contract?
- Are all host-visible interactions declared as events with payload schemas and,
  when needed, event outputs?
- Would deleting the fixture data still leave a valid runtime contract?
- Do the tests prove reusable behavior rather than a single demo assembly?

## 7. Relationship to other docs

- Start with [Authoring guide](authoring-guide.md) for scaffold and workflow.
- Use [Component contract](component-contract.md) for `defineComponent()` fields.
- Use [Renderer guide](renderer-guide.md), [Config panel guide](config-panel-guide.md),
  and [Transform and runtime guide](transform-runtime-guide.md) for surface-specific
  contracts.
- Use [Testing guide](testing-guide.md) for required proof.
- Use [Design system for components](design-system-for-components.md) for visual
  and accessibility constraints.

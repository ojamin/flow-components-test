# Renderer Guide

## Purpose

This guide is the package-local starting point for `Renderer.vue` files.
Renderer behavior must stay portable across the package preview app and the host app.

## Renderer contract

Renderer components receive public renderer props described by `StaticComponentRenderProps` in `@flow-builder/components/sdk`:

```ts
import type { StaticComponentRenderProps } from "@flow-builder/components/sdk";

const props = defineProps<StaticComponentRenderProps>();
```

Renderer props include:

- `config` — optional component config supplied by the host or tests. Parse it with the component schema/defaults from `types.ts`.
- `fixtureData` — optional package-local sample data resolved from `componentDefinition.loadFixtureData` through `resolveFixtureData(definition)`.
- `runtimeOutputs` — current runtime output values supplied by the host for interactive/runtime-aware components.
- `updateRuntimeOutputs` — optional callback for intentionally exposing interactive state as runtime outputs.
- `device` — optional preview device hint supplied by host runtimes when responsive renderers need to adapt their layout.
- `themeContext` — optional host-resolved component theme context. Read it through SDK helpers such as `resolveThemeProperty` or `createThemeCssVariableMap`; do not walk host placement trees or import app stores from renderers.
- `emitEvent` — optional callback for emitting declared component events. Literal event ids used in `emitEvent("id")`, `emitEvent?.("id")`, `props.emitEvent("id")`, or `props.emitEvent?.("id")` must be declared in `componentDefinition.events`; the catalog generator rejects undeclared literal ids.

Keep ephemeral UI state local unless the state is externally visible and intentionally reported through `updateRuntimeOutputs` or declared `emitEvent` events.
Dynamic event ids cannot be validated statically. If a renderer intentionally emits a dynamic id, put `// @event-check: dynamic` on the line immediately above that dynamic call; the opt-out applies only to the following line. For multi-line calls, place the comment above the line that contains the `emitEvent(` token.

## Sizing contract

Renderer roots must cooperate with the host placement sizing mode declared in `componentDefinition.builder.heightMode`.
Components with content-driven height should keep the root intrinsic and in-flow: do not put permanent `h-full`, `size-full`, `flex-1`, or `grow` classes on a `content` height root, because Builder and Preview need to measure natural content for `auto` and `min` sizing.
Fixed and container-height components may use fill/floor signals such as `h-full`, `min-h-*`, `flex-1`, `grow`, `size-full`, or an aspect ratio when the host rectangle should remain authoritative.

The host app adds fixed/container fill classes around renderer roots when needed; package renderers should not force full height just to satisfy one host surface.
When changing a renderer root, confirm it still works in fixed, min, and auto placement contexts through the package sizing checks in the [Testing guide](testing-guide.md#sizing-proof).

## Interactive output channels

Interactive components can expose graph-visible output values through two channels:

- `updateRuntimeOutputs(nextOutputs)` replaces the renderer-managed output slice for the component instance. Use it for renderer-owned state such as selected rows, expanded paths, or toggled values.
- `emitEvent(eventId, payload)` is a one-shot event channel. The host validates declared events, projects configured `eventOutputs`, and patches the event-managed output slice.

The graph-visible `runtimeOutputs` map is the merge of both slices. Updating one channel preserves keys owned by the other channel; hosts must not replace the whole output snapshot with only event-projected keys. If both channels write the same output id, the most recent writer wins and the host emits a development/runtime diagnostic unless that shared output id is intentionally documented by the component.

## Imports and styling

- Import definition-loader-safe SDK types and pure helpers from `@flow-builder/components/sdk`; import runtime-heavy helpers from section subpaths such as `@flow-builder/components/sdk/browser`, `@flow-builder/components/sdk/rendering`, `@flow-builder/components/sdk/capabilities`, `@flow-builder/components/sdk/three-d`, `@flow-builder/components/sdk/interactions`, `@flow-builder/components/sdk/data`, or `@flow-builder/components/sdk/sanitization`. See [SDK helper inventory and contract](sdk-helpers.md) for the current helper-subpath topology.
- Import the component's own schema/defaults with relative imports such as `./types`.
- Do not import host app stores, router modules, pages, app-shell internals, builder internals, or host-only runtime internals.
- Do not call `window`, `document`, `navigator`, timers, animation frames, canvas creation, `matchMedia`, clipboard APIs, DOMPurify/window sanitizer setup, or WebGL capability probes directly when an SDK helper exists.
- Prefer helper imports such as `createCanvas` and `writeClipboardText` from `sdk/browser`, `createFrameLoop` from `sdk/rendering`, `detectBrowserWebGLSupport` from `sdk/capabilities`, `createVizThreeScene` from `sdk/three-d`, `isActivationKey` from `sdk/interactions`, `resolveDataPath` from `sdk/data`, and `sanitizeHtml` from `sdk/sanitization`.
- For async renderers that should block Agent Connect screenshots until ready, import `dispatchComponentReadinessEvent` from the root SDK and emit a bounded `pending` event before async work, followed by `ready`, `settled`, or `resize-settled` from the placement DOM subtree when the renderer is safe to capture.
- Prefer semantic HTML plus Tailwind utility classes.
- Use shadcn-vue primitives only through the package facade when renderer UI truly needs a shared primitive; config panels are the primary consumer of `@flow-builder/components/component-ui`.
- Treat `@flow-builder/components/component-ui` as the UI/config facade, not as a replacement for SDK helper subpaths.
- Do not add Vue `<style>` blocks, inline `style` attributes, or component-local CSS files.
- Renderers must consume theme values through the host-supplied `themeContext` seam and SDK helpers, not legacy `viz-theme` payloads. Old `viz.theme` / `viz-theme` project data is unsupported and should be rejected by import/runtime validation rather than normalized or read by new renderer code.

## State expectations

Renderers must cover states that are relevant to the component's data contract:

- Empty: show helpful empty copy when no meaningful data is available.
- Loading: show clear loading copy or skeleton-like structure when a loading state is part of fixture/runtime data.
- Error: show actionable error copy when fixture/runtime data carries an error state.
- Disabled: preserve accessible names and disabled semantics for disabled controls.
- Interactive: update only intentional public outputs through `updateRuntimeOutputs` or declared events emitted with `emitEvent`.

If a state is not possible for the component, do not invent behavior; document and test the actual reachable states.

## Fixtures and render cases

Use `fixtures/sample-data.json` for representative default data and add render cases in `tests/cases.ts`.
A render case can override config or fixture data through `mountOptions.props`:

```ts
export const renderCases = [
  {
    name: "renders configured label",
    mountOptions: { props: { config: { label: "Promo Banner" } } },
    check: ({ wrapper }) => {
      expect(wrapper.text()).toContain("Promo Banner");
    },
  },
] as const satisfies readonly StaticComponentRenderCase[];
```

The harness mounts the lazy renderer, parses config with the component schema, resolves default fixture data with `resolveFixtureData(definition)`, and asserts non-empty HTML.

## Preview app

Use the preview app to inspect renderer behavior across themes, devices, viewports, and states:

```bash
npm run preview:dev
```

Build the preview app before closeout when preview behavior changed:

```bash
npm run preview:build
```

## References

- [Accessibility states](accessibility-states.md)
- [Design system for components](design-system-for-components.md)
- [SDK helper inventory and contract](sdk-helpers.md)
- [Config panel guide](config-panel-guide.md)
- [Testing guide](testing-guide.md)

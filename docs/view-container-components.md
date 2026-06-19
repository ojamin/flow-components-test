# View Container Components

## Scope

View containers are layout components that own an ordered list of views and expose one child slot per view. The current built-ins are `layout.view-stack` and `layout.tabs`.

This contract is for one-page section switching. It is not multi-page routing, and package components must not import the host router, app stores, Builder internals, or app-shell UI.

## Component-author pattern

1. Store the authored view list in config using the shared view-container item shape: stable `id`, user-facing `label`, optional public `hashSlug`, and optional `disabled`.
2. Define `resolveSlots` on the component definition and derive slots from the parsed config with `createViewContainerSlots(...)`.
3. Keep static `slots` as the deterministic fallback. `resolveComponentSlots(...)` parses config and falls back to static slots when config is invalid or no resolver exists.
4. Expose an optional `defaultViewId` config field with the shared `view-select` SchemaForm control when authors need to choose the initial Builder/Preview/export view. Runtime requests still take precedence over this default.
5. Expose the active-state runtime contract:
   - input: `activeViewId`
   - output: `activeViewId`
   - event: `viewChanged`
6. Resolve invalid, missing, or disabled active requests with `resolveActiveViewId(...)`.
7. Keep URL/hash behavior delegated to the host service. Renderers may expose intent through inputs/outputs/events and SDK-safe services, but must not mutate `window.location` or call Vue Router.

```ts
import { defineComponent } from "@flow-builder/components/sdk";
import { createViewContainerSlots } from "@flow-builder/components/shared/view-container";

export const componentDefinition = defineComponent({
  // ...metadata, config schema/defaults, params, ports, events...
  slots: [],
  resolveSlots: ({ config }) => ({
    slots: createViewContainerSlots(config.views ?? []),
  }),
});
```

## Shared helpers

The framework-light helper module lives at `packages/components/src/shared/view-container/` and is exported as `@flow-builder/components/shared/view-container`.

Use it for:

- `ViewContainerItem` and normalized item types.
- `viewContainerItemSchema` / `viewContainerItemsSchema` for config.
- `createViewContainerItem(...)`, rename/reorder/delete helpers, and disabled-state updates.
- `normalizeViewContainerItems(...)` so duplicate/invalid items do not create unstable slots.
- `createViewContainerSlots(...)`, which currently emits slot IDs as `view:<viewId>`.
- `resolveActiveViewId(...)` for fallback active-view selection.
- `normalizeHashSlug(...)` and event payload schemas such as `viewRequested` / `viewChanged`.
- `viewContainerActiveViewIdSchema` for optional config fields such as `defaultViewId`.

Do not move app-owned slot realization, hash navigation, direct action execution, placement anchors, or import/export diagnostics into this package helper.

## View IDs, hash slugs, and view-list authoring

- `id` is the persisted structural identity. Reordering or renaming a view must not change it, because child placements target the derived slot ID.
- `label` is display copy only.
- `hashSlug` is optional public URL identity. Normalize it with the shared helper and keep it stable enough for bookmarks.
- Disabled views still resolve slots so existing child placements keep their structural home.
- Config panels should use the shared `view-list` SchemaForm control rather than bespoke list editing. `layout.view-stack` and `layout.tabs` both use this model.
- Starting-view controls should use the shared `view-select` SchemaForm control against the sibling `views` list rather than hard-coded select options.

## Host-owned responsibilities

The parent app owns the behaviors that require project state, routing, or editor/runtime services:

- Slot realization for Builder, Preview, hierarchy, target pickers, validation, import/export, and diagnostics. These surfaces must consume realized slots instead of reading raw `definition.slots` only.
- Stale slot diagnostics when a placement targets a dynamic slot that no longer resolves. The app must not silently delete child placements.
- Blocking user deletion of a non-empty view; unavoidable reconciliation must be system-level and not create undo-history spam.
- Direct action bindings, including `runtime-output.patch` and `url.hash.set`, after event payload validation.
- Placement anchors in `placement.navigation.anchorId`. Anchor IDs are globally unique per page, rendered on Preview placement wrappers, and can be selected by hash navigation for scroll/focus.
- Host URL/hash navigation service for app Preview and packaged static export. Hash navigation can select a view by `hashSlug` and scroll/focus a placement anchor by `anchorId`; runtime hash changes must not mutate the project document.

Static export reuses the Preview runtime, so do not add package-owned router behavior or a separate section runtime.

## Built-in layout components

- `layout.view-stack` exposes one dynamic slot per configured view and renders only the active view.
- `layout.tabs` uses the same view-list, slot, active-state, hash-sync, and host-service contract, while adding accessible tab controls.

Both support `defaultViewId` as an author-pinned initial view/tab for Builder, Preview, and packaged static export. External runtime input, direct actions, user tab clicks, and host hash navigation still override the configured default before the shared resolver falls back to the first enabled view.

Both expose optional `hashSync` config plus per-view `hashSlug`. Hash sync is honored by the host Preview navigation service, not by package-owned router code.

## Troubleshooting

- Children moved after rename/reorder: check that persisted view `id` values stayed stable and only labels/order changed.
- Slot missing in Builder/Preview: call `resolveComponentSlots(...)` or the app slot-realization helper with parsed literal config; do not read only `definition.slots` for dynamic containers.
- Hash opens URL but not view: confirm `hashSync` is enabled and the target view has a normalized `hashSlug`.
- Hash scrolls but does not switch views: the hash may match a placement `navigation.anchorId` instead of a view slug.
- Package boundary failure: remove any import of app stores, router modules, Project UI, direct action execution, or placement/import/export helpers from package code.

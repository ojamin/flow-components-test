# Collection Import Guide

## Purpose

Use this guide when converting a cohesive external component collection into built-in package components. It is a collection-level planning companion to the per-component [Authoring guide](authoring-guide.md): read this once before the batch starts, then use the normal authoring docs for each component.

This guide is intentionally flexible. It recommends defaults and decision prompts, but it does not require every collection to fit the current taxonomy forever. Reuse existing groups when they fit; add or extend taxonomy when the collection genuinely needs a new home.

## When to use this guide

Use it for a collection with a shared source, visual system, naming scheme, or interaction model. For a one-off component, the [Authoring guide](authoring-guide.md) is enough.

## Collection-level planning

Before scaffolding, make a small inventory for the whole collection:

| Field                   | Why it matters                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Source name             | Keeps provenance and review context clear.                                                                                |
| Target component id     | Component IDs are stable after publication. Prefer `<group>.<name>` unless a documented package pattern says otherwise.   |
| Target group and folder | Components live under `packages/components/src/groups/<group>/<folder>/`.                                                 |
| Section and tags        | Use these to keep a cohesive sub-family discoverable without forcing a new top-level group.                               |
| Renderable?             | Non-renderable static components still need `Renderer.vue` and non-empty render cases until the harness contract changes. |
| Transform kind          | Choose `module` for component-owned transform logic or `passthrough` when the component only forwards `data` to `all`.    |
| Risk tier               | Split high-risk components into smaller slices.                                                                           |

Also decide these once for the collection:

- **Naming convention.** Keep ids, folders, display names, tags, and section values consistent across the batch.
- **Package location.** Keep the collection inside the package component area, but do not put the whole collection in one component folder. Each component gets its own folder under `packages/components/src/groups/<group>/<folder>/`.
- **Visual baseline.** Map external design tokens to existing Tailwind utilities and theme variables before implementation starts.
- **Shared helpers.** If multiple components need the same helper, plan whether it belongs in a package-local helper module or needs an SDK/component-UI facade discussion.
- **Slice boundaries.** Group similar low-risk components together; isolate anything that adds data types, runtime behavior, or taxonomy.

The goal is a lightweight plan, not a second PRD.

## Group vs section

The current package groups are `chart`, `content`, `data`, `layout`, `marketing`, `transform`, and `viz`. They are enforced by the manifest schema and package taxonomy today, but they are not meant to block a collection that clearly needs another top-level category.

Prefer this order:

1. **Reuse an existing group** when the component fits the current product model.
2. **Use `section` for collection sub-families** inside a group, such as `hero`, `pricing`, `testimonial`, or a source-system name. `section` is the lightest way to keep a cohesive collection together in catalog/search metadata.
3. **Add a new group** only when the collection does not naturally fit the current groups and the new group will represent a durable category, not a one-component exception.

If adding a group is justified, update the taxonomy deliberately:

- Add the folder under `packages/components/src/groups/<new-group>/`.
- Extend `componentManifestGroupSchema` in `packages/components/src/manifest.ts`.
- Add the group/category mapping in `packages/components/src/sdk/taxonomy.ts`.
- Update `packages/components/README.md` so the package source-layout navigation stays accurate.
- Run `npm run generate` and `npm run validate` from the package root.

If the new group would affect Builder picker placement, Flow tinting, default sizing, or catalog UX in a way that is not obvious, stop and make that product/design decision explicit before scaffolding the group.

## Design-system consistency

Cohesive imported collections should feel like one family without creating a parallel visual system.

- Use Tailwind utility classes only in renderers and config panels.
- Do not add Vue SFC `<style>` blocks, inline `style` attributes, ad hoc CSS files, host-app styling imports, or app-shell UI imports.
- Compose controls and primitives through `@flow-builder/components/component-ui` and existing shadcn-vue facade surfaces.
- Map external colors, spacing, radius, typography, and shadows onto the repo's existing token/theme surface instead of porting raw source tokens.
- Keep shared class patterns boring and repeatable. If a pattern appears in many components, consider a package-local helper only when it reduces real duplication without hiding component intent.
- Preview early. Visual drift is cheaper to fix after the first one or two components than after the full collection lands.

If the source collection cannot be represented with the existing token surface, treat that as an escalation. Do not solve it component-by-component with one-off classes or private styling systems.

## Per-component contract checklist

For each component in the collection:

1. Scaffold the folder instead of copying an existing component.
2. Fill `component.manifest.json`: `id`, `displayName`, `group`, `section`, `tags`, `version`, `renderable`, `transformKind`, and entries.
3. Implement `component.ts` with stable metadata, builder defaults, flow metadata, ports, params, events, and outputs as needed.
4. Define config schemas/defaults and params in `types.ts`; mark only data-driven fields as bindable and provide explicit `bindFrom`.
5. Implement `Renderer.vue` with relevant empty, loading, error, disabled, focus, and interactive states.
6. Implement `ConfigPanel.vue` as a `SchemaConfigPanel` wrapper unless the existing controls cannot express the field.
7. Implement `transform.ts` for `module`, or omit it for `passthrough` and wire `createPassthroughTransform` in `component.ts`.
8. Add small deterministic fixture data.
9. Add `tests/cases.ts` plus contract, render, and transform tests.
10. Keep imports inside package boundaries: SDK, component-UI facade, package-local relative imports, Vue, Zod, and declared package dependencies.

## Risk tiers

Use tiers to choose slice size and review depth:

- **Tier 1: Presentational.** Static or mostly static renderer, existing data types, no host-visible events, no new runtime behavior. Several Tier-1 components can usually land in one slice.
- **Tier 2: Interactive.** Declares events, event outputs, renderer-managed outputs, or meaningful keyboard/focus behavior. Keep slices smaller and prove event payloads with render cases.
- **Tier 3: New data type or port shape.** Needs a `typeId` that is not already in `packages/components/src/sdk/data-types.ts`. Land the data-type change separately before converting dependent components.
- **Tier 4: New runtime behavior.** Needs dynamic ports, fetch/cache semantics, cycles, persisted runtime state, or behavior beyond normal `module`/`passthrough` transforms. Treat each component or shared runtime seam as its own slice.

When a component looks simple but needs a new config control kind, shared SDK facade, or taxonomy change, bump its tier until that shared decision is resolved.

## Batch workflow

There is no bulk scaffold command today. The safe workflow is:

1. Build the collection inventory and slice plan.
2. For each component in a slice, run scaffold with `--dry-run` first when names are uncertain.
3. Fill the component contract files for the whole slice.
4. Run generator and checks at slice boundaries:

```bash
npm run generate
npm run generate:check
npm run validate
npm run typecheck
npm run test:components
npm run policy:standalone
npm run check:standalone
```

5. Inspect the slice in the package preview app:

```bash
npm run preview:dev
```

6. If a maintainer requests host proof, run the relevant optional `test:app-integration:*` lane from the monorepo.
   Root app checks are not required for standalone package-local collection work.

Generated files such as `packages/components/src/generated/catalog.ts` and `packages/components/src/generated/source-manifest.ts` are checked in but generator-owned. Run `generate`; do not hand-edit them.

## Escalation triggers

Pause the slice and make a decision explicit when:

- The collection wants a new top-level group.
- A component needs a new canonical data type.
- A config field cannot be represented by existing params/control kinds.
- Runtime behavior goes beyond normal transform contracts.
- The visual system cannot map cleanly to existing Tailwind/theme tokens.
- A component would need to import host app internals or bypass the package SDK/component-UI facades.

## References

- [Authoring guide](authoring-guide.md)
- [Component contract](component-contract.md)
- [Manifest schema](manifest-schema.md)
- [Renderer guide](renderer-guide.md)
- [Config panel guide](config-panel-guide.md)
- [Design system for components](design-system-for-components.md)
- [Transform and runtime guide](transform-runtime-guide.md)
- [Testing guide](testing-guide.md)

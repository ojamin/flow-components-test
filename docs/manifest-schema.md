# Manifest Schema

## Purpose

This page describes `component.manifest.json` files and generated package source manifests.
The canonical schema is `packages/components/src/manifest.ts`.

## Component manifest

Every package component folder includes `component.manifest.json`.
The scaffold defaults to a module-transform component and writes this shape:

```json
{
  "schemaVersion": 1,
  "id": "content.promo-banner",
  "displayName": "Promo Banner",
  "group": "content",
  "section": "custom",
  "tags": ["content", "promo-banner"],
  "version": "1.0.0",
  "renderable": true,
  "transformKind": "module",
  "entry": {
    "definition": "component.ts",
    "renderer": "Renderer.vue",
    "configPanel": "ConfigPanel.vue",
    "transform": "transform.ts"
  }
}
```

Passthrough components set `transformKind` to `passthrough` and omit `entry.transform`:

```json
{
  "schemaVersion": 1,
  "id": "content.promo-banner",
  "displayName": "Promo Banner",
  "group": "content",
  "section": "custom",
  "tags": ["content", "promo-banner"],
  "version": "1.0.0",
  "renderable": true,
  "transformKind": "passthrough",
  "entry": {
    "definition": "component.ts",
    "renderer": "Renderer.vue",
    "configPanel": "ConfigPanel.vue"
  }
}
```

## Field reference

| Field               | Required    | Rules                                                                                                                             |
| ------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `schemaVersion`     | Yes         | Must be `1`.                                                                                                                      |
| `id`                | Yes         | Lowercase component ID matching `/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)?$/`. Scaffolded components must use `<group>.<name>`.       |
| `displayName`       | Yes         | Non-empty user-facing name. Keep it consistent with `component.ts`.                                                               |
| `group`             | Yes         | One of `chart`, `content`, `data`, `layout`, `marketing`, `transform`, or `viz`. Must match the folder group.                     |
| `section`           | No          | Optional non-empty catalog section. Scaffold output uses `custom`.                                                                |
| `tags`              | Yes         | Array of non-empty strings used for catalog/search metadata.                                                                      |
| `version`           | Yes         | Non-empty manifest version string. Scaffold output uses `1.0.0`.                                                                  |
| `renderable`        | Yes         | Boolean visibility contract. Keep it consistent with `component.ts`; required files/tests follow the component's `transformKind`. |
| `transformKind`     | No          | `module` or `passthrough`; defaults to `module` when omitted.                                                                     |
| `entry.definition`  | Yes         | Must be `component.ts` for validation.                                                                                            |
| `entry.renderer`    | Yes         | Must be `Renderer.vue` for validation.                                                                                            |
| `entry.configPanel` | Yes         | Must be `ConfigPanel.vue` for validation.                                                                                         |
| `entry.transform`   | Conditional | Required as `transform.ts` for `module` manifests; forbidden for `passthrough` manifests.                                         |

Entry paths must be package-local relative paths without `/`, `\\`, or `..` traversal.
Validation also checks that entry files exist and that every component folder has the required scaffold files for its `transformKind`.
Module manifests require a physical `transform.ts` file.
Passthrough manifests must not include `transform.ts`; `component.ts` should expose `transform: createPassthroughTransform` from `@flow-builder/components/sdk`.

## Generated output rules

`packages/components/src/generated/catalog.ts` and `packages/components/src/generated/source-manifest.ts` are generator-owned checked-in outputs.
Do not hand-edit them.
Regenerate them after manifest or component source changes:

```bash
npm run generate
```

Validate that generated outputs are current:

```bash
npm run validate
```

The generated source manifest records component summaries, group membership, package-relative source paths, and deterministic `sha256:<64 lowercase hex>` fingerprints for manifests and component files.
Validation fails when generated files are missing or stale.

## References

- [Authoring guide](authoring-guide.md)
- [Component contract](component-contract.md)
- [Testing guide](testing-guide.md)
- [Release process](release-process.md)

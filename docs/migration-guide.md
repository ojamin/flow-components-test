# Migration guide

## Purpose

This page records compatibility notes for changes to the proprietary Flow Components Test package.

## Component ID namespace

Demo components should use the `demo.*` namespace so they do not collide with Flow Builder built-in component IDs.

Current demo IDs:

- `demo.demo-button`
- `demo.demo-text`

## Source ID

Generated catalog and source-manifest records use external source ID `flow-components-test`.
Host integrations should treat this as the stable source identifier for this repository.

## Generated artifacts

After changing manifests or component source files, run:

```bash
npm run generate
npm run generate:check
npm run validate
```

Generated artifacts include:

- `component-source.manifest.json`
- `src/generated/catalog.ts`
- `src/generated/source-manifest.ts`
- `src/generated/source-files.ts`

## References

- [Manifest schema](manifest-schema.md)
- [Release process](release-process.md)

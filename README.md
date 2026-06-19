# Flow Components Test

Proprietary demo component-source repository for Flow Builder.

This repository contains the Flow Builder component SDK/tooling plus two demo components that Flow Builder can consume as an external component source. It is public for evaluation, but it is not open source. See [LICENSE](LICENSE) for the All Rights Reserved terms.

## Quick start

Run all commands from this repository root.

Required toolchain:

- Node.js `>=22.0.0`
- npm `10.9.4`
- Vue `^3.5.32` supplied by package consumers

Install from the standalone lockfile:

```bash
npm ci
```

Common verification commands:

```bash
npm run generate:check
npm run validate
npm run typecheck
npm run test:components
npm run preview:build
npm run build
```

`npm run check:standalone` runs the broader package closeout lane.

## Demo components

- `src/groups/content/button/` — `demo.demo-button`, an interactive button demo with event/output patterns.
- `src/groups/content/text/` — `demo.demo-text`, a simple passthrough text demo.

Folder names stay under the `content` group because the current manifest schema uses package groups separately from component IDs.

## Generated component-source manifests

Generated artifacts are checked in and must not be edited by hand:

- `src/generated/catalog.ts`
- `src/generated/source-manifest.ts`
- `src/generated/source-files.ts`
- `component-source.manifest.json`

Regenerate them after component manifest or source changes:

```bash
npm run generate
```

The source manifest uses external source ID `flow-components-test`, deterministic `generatedAt`, repo-relative `sourcePath` values, and deterministic `sha256:<hex>` fingerprints.

## Package exports

- `@flow-builder/components` — package entry point that re-exports the catalog, source manifest, definition IDs, and public types.
- `@flow-builder/components/catalog` — component definitions and ordered component IDs.
- `@flow-builder/components/source-manifest` — generated component-source metadata.
- `@flow-builder/components/source-files` — repo-relative component source snapshots for source-aware consumers.
- `@flow-builder/components/sdk` — public component authoring SDK and runtime/transform contracts.
- `@flow-builder/components/component-ui` — component config-panel UI facade.

`@flow-builder/components/groups/**` subpaths are not package public API.

## Preview app

Run the package preview app locally:

```bash
npm run preview:dev
```

Build it with:

```bash
npm run preview:build
```

## Documentation

- [Contributing guide](CONTRIBUTING.md)
- [Authoring guide](docs/authoring-guide.md)
- [Component contract](docs/component-contract.md)
- [Manifest schema](docs/manifest-schema.md)
- [Renderer guide](docs/renderer-guide.md)
- [Config panel guide](docs/config-panel-guide.md)
- [Testing guide](docs/testing-guide.md)
- [Design system for components](docs/design-system-for-components.md)
- [Accessibility states](docs/accessibility-states.md)
- [SDK helper documentation](docs/sdk-helpers.md)
- [Package changelog](CHANGELOG.md)

## License

This repository is proprietary and All Rights Reserved. Public visibility permits evaluation viewing only; it does not grant permission to use, copy, modify, distribute, sublicense, or reverse engineer the code.

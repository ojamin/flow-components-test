# Contributing

## Purpose

This guide describes the package-only workflow for this proprietary Flow Builder demo component-source repository.
Parent app source is not required for normal component authoring.

## Access and prerequisites

- Public GitHub visibility permits evaluation viewing only; it does not grant use, copying, modification, distribution, sublicensing, or reverse-engineering rights.
- Written permission is required before contributing or reusing any repository content.
- Use Node.js `>=22.0.0` and npm `10.9.4`.
- Use package-local scripts from `package.json`.
- Do not commit credentials, customer data, hidden local files, local absolute paths, browser handles, or tokens.

## Install

```bash
git clone https://github.com/ojamin/flow-components-test.git
cd flow-components-test
npm ci
```

## Add or update a component

Start with the package docs:

- [Authoring guide](docs/authoring-guide.md)
- [Component contract](docs/component-contract.md)
- [Manifest schema](docs/manifest-schema.md)
- [Renderer guide](docs/renderer-guide.md)
- [Config panel guide](docs/config-panel-guide.md)
- [Testing guide](docs/testing-guide.md)

Scaffold new components instead of copying an existing folder:

```bash
npm run scaffold -- --group content --folder promo-banner --id demo.promo-banner --display-name "Promo Banner"
```

Preview the generated file list first when needed:

```bash
npm run scaffold -- --group content --folder promo-banner --id demo.promo-banner --display-name "Promo Banner" --dry-run
```

Component folders live under `src/groups/<group>/<folder>/`.
Each component owns its manifest, renderer, config panel, transform/runtime modules, fixture data, and tests.

## Preview while authoring

Use the package preview app to inspect component behavior across fixtures, themes, devices, and states:

```bash
npm run preview:dev
```

## Validate and test

Regenerate generated files after manifest or component source changes:

```bash
npm run generate
```

Run focused package checks before requesting review:

```bash
npm run generate:check
npm run validate
npm run typecheck
npm run test:components
npm run preview:build
```

Run the broader package closeout gate when appropriate:

```bash
npm run check:standalone
```

## Security and source rules

- Component code and package scripts are executable code.
- Dependency and lockfile changes require dependency/security review.
- Static export must use materialized or compiled runtime components; raw embedded source snapshots are not executable static-export code.
- Source snapshot APIs are editor, forking, and fallback artifacts only.
- This repository does not claim complete sandboxing for untrusted component execution.

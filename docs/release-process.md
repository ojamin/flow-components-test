# Release process

## Purpose

This page records the package-local release and verification expectations for the proprietary Flow Components Test repository.

## Version policy

- The package is pre-1.0.
- Minor versions may include component IDs, manifest, SDK, or generated-output changes.
- Patch versions should be limited to compatible fixes and documentation corrections.
- Breaking changes must be called out in `CHANGELOG.md` with migration notes.

## Verification before release tagging

Run from the repository root:

```bash
npm ci
npm run generate:check
npm run validate
npm run typecheck
npm run test:components
npm run preview:build
npm run build
npm run pack:dry-run
```

Run `npm run check:standalone` when a full package closeout gate is needed.

## Security and licensing checks

- Keep `LICENSE` proprietary and `package.json` license metadata `UNLICENSED`.
- Do not add npm lifecycle scripts such as `prepare`, `postinstall`, or `prepack` without explicit review.
- Do not include credentials, tokens, customer data, hidden local files, or local absolute paths in package artifacts.
- Keep generated source manifests reproducible and source paths repository-relative.

## Static export and source snapshots

Source snapshots are editor/fallback artifacts, not static-export executable code.
Any host that consumes this repository must materialize or precompile approved
external components before static export; raw embedded Vue, TypeScript, or JSON
source snapshots are not runtime-executable export payloads.

Static-export integrations must fail closed for unavailable or untrusted external
component materialization. Preserve blocking diagnostics for at least:

- `static-export-cache-only-source-unavailable`
- `static-export-component-hash-mismatch`

## References

- [Changelog](../CHANGELOG.md)
- [Testing guide](testing-guide.md)
- [Manifest schema](manifest-schema.md)

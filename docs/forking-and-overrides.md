# Forking and Overrides

## Purpose

This page gives a safe starting point for consumers or maintainers evaluating local forks or overrides.
It does not define marketplace/discovery, browser Git, runtime compilation inside exported sites, complete sandboxing, or provider behavior that is not already implemented and validated.

## Layer model

Use these terms when documenting forks and overrides:

- **Built-in layer**: the trusted first-party workspace package at `packages/components/`. It provides the generated catalog/source manifest and is the compatibility home for current `source: "static"` projects.
- **Embedded snapshot/cache layer**: sanitized used-component files and manifest metadata stored in project JSON for portability, fallback, and editing recovery. It is not automatically executable in static export.
- **External layer**: browser-selected folder, public HTTPS/GitHub manifest, or dev-server provider source. External components are executable code and must be validated and locally trusted/approved before executable editor/preview use.
- **Dev Mode layer**: the existing authored-bundle registry path. Dev Mode patch/merged/scaffold exports remain separate from source-aware package imports until an import path is explicitly designed.

The built-in library source lives under `packages/components/src/groups/**`. Public entry points are declared in `packages/components/package.json` and include catalog, source-manifest, manifest, SDK, component-UI, runtime-services, shared view-container, and test-only helpers. Group component folders are internal implementation details, not public package subpaths.

## Resolution and override priority

Normal resolution is source-preferred. Cache-only is explicit and overrides normal resolution.

Source-preferred order:

1. Exact component override.
2. Group or section override.
3. Source priority order, including the default source.
4. Embedded cache or project snapshot fallback.
5. Built-in default fallback.
6. Unresolved placeholder with diagnostics.

Cache-only mode resolves only from embedded snapshots/cache. It must not auto-fetch, auto-check, auto-refresh, or silently fall back to built-in components when cache entries are missing. Missing, stale, or hash-mismatched cache entries should surface diagnostics and repair actions.

## Version and hash locks

Forks may reuse simple user-facing component IDs, but internal identity must include source, version, and content hash. Duplicate component IDs across sources are expected.

- `sourceId` identifies the winning source, such as `flow-components-test`, `brand-fork`, or a project-specific source.
- `version` is the declared component/source version, tag, commit, or ref label. It is metadata, not the integrity proof.
- `contentHash` is the integrity fingerprint of the resolved component payload.
- `resolution` should distinguish `source` for live source resolution, `cache` for source-preferred fallback to an embedded snapshot, and `embedded` for explicit cache-only resolution.

Pinned commits, tags, and content hashes are preferred for stable shared projects. Mutable refs such as `main` are review-required by default. A content-hash mismatch must block silent use and require reconnecting, pulling a trusted update, or switching to a known-good snapshot/source.

## Safe override workflow

Use this workflow for local first-party forks or explicit project overrides:

1. Pick the narrowest override: component override before group/section override; group/section override before changing global source priority.
2. Keep component IDs, schemas, ports, and manifests compatible when the override is intended to replace an existing built-in component.
3. When forking a built-in package component into an editable source bundle, carry required shared SDK dependency files referenced by the component source, and normalize both `component.ts` metadata and `component.manifest.json` metadata to the forked component ID and display name.
4. Regenerate package artifacts after changing package manifests or catalog inputs:

   ```bash
   npm run generate
   ```

5. Validate before handing the override to another agent or consumer:

   ```bash
   npm run check:standalone
   ```

   Run from this repository root.
   Root/app integration checks are optional host evidence and are not required unless the override changes app consumption behavior.

6. Document the override in release or migration notes with source ID, affected component/group IDs, version/hash impact, and repair path for mismatches.

## Safe guidance

- Prefer adding package components through the scaffold command and package docs rather than modifying generated outputs.
- Keep component IDs, schemas, ports, and manifests compatible when an override is intended to replace an existing built-in component.
- Keep generated catalog/source-manifest files produced by the generator, not hand edits.
- Use package public facades instead of host app stores, router, pages, or app-shell internals.
- Treat every non-first-party source as executable code. Do not claim complete sandboxing.
- Never persist credentials, tokens, browser handles, absolute local paths, or restricted refs in project JSON or shared exports.
- Document any local divergence in migration or release notes before handing work to another agent.

## Snapshot and cache behavior

Embedded snapshots are for portability, fallback, and editing recovery:

- Embed only used components when the user has enabled that project portability behavior.
- Strip `.git`, hidden files, `node_modules`, env files, credentials, unrelated files, absolute local paths, browser handles, and unsafe display-label path fragments.
- Validate snapshots before registry hydration.
- Snapshot validation is not trust; imported snapshots still need review/approval before executable use.
- Static export cannot compile or execute raw embedded Vue, TypeScript, or project JSON source automatically. Export must use materialized/precompiled runtime components or block with diagnostics.

## Generated catalog updates

The generated catalog and source manifest are the release surface for this package. After adding, removing, renaming, moving, deprecating, or changing component manifests, run:

```bash
npm run generate
npm run validate
```

Then review generated diffs for expected group placement, source paths, versions, content hashes, runtime requirements, and component flags. Do not hand-edit `src/generated/catalog.ts` or `src/generated/source-manifest.ts`.

## Standalone repository boundary

This repository is already standalone. Preserve public package entry points, generated artifact reproducibility, source/version/hash lock semantics, and the static-export materialization guardrail. Do not imply browser Git, marketplace/discovery, portable precompiled artifacts, or complete sandboxing without a separate implementation and security slice.

## References

- [Component contract](component-contract.md)
- [Release process](release-process.md)
- [Migration guide](migration-guide.md)
- [Transform and runtime guide](transform-runtime-guide.md)

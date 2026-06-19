# Transform and Runtime Guide

## Purpose

This guide is the package-local entry point for `transform.ts` modules and optional runtime modules.
It documents boundaries without promising provider behavior that is not present in the package contract.

## Transform contract

Transforms implement the public transform types in `src/sdk/public-sdk.ts`.
They receive config, inputs, and fixture data through the static component transform context and return output values that tests can validate against declared data types.
Declarative row transforms should use the canonical SDK contracts in `src/sdk/transform-contracts.ts` and row engine in `src/sdk/row-transform-engine.ts` / `src/sdk/row-transform-engine-types.ts` instead of inventing component-local row pipelines.
Keep each transform's `rows` output and `all` output aligned so chained Flow use sees the same transformed dataset.

The built-in declarative library under `src/groups/transform/**` covers sort, filter, select, lookup, pivot, flatten, dedupe, date bucketing, normalization, and formatting.
When extending it, add package tests that prove chained transforms without relying on browser fetch or `eval` behavior.

## Runtime contract

Runtime-capable components use the runtime types and facades exported through `@flow-builder/components/sdk` and `@flow-builder/components/runtime-services`.
Runtime effects must use the public runtime effect shapes; do not persist host-only state or import host runtime internals directly.

External components are executable code.
Treat every non-first-party component source as a security and supply-chain boundary.

## Trust and update rules

Use the source manager vocabulary exactly when documenting or implementing source decisions:

- `trusted`: first-party built-in package or user-explicitly trusted source.
- `review-required`: default for remote mutable, unknown, or imported sources.
- `pinned`: resolve only the pinned version/commit/hash.
- `auto-check`: check for updates and show status; do not apply automatically.
- `auto-apply`: apply after validation; allowed only for trusted sources.
- `manual`: check/pull only when the user requests it.

Mutable refs such as `main` and branch names are review-required by default.
Pinned commits, tags, and content hashes are preferred for stable shared projects.
`contentHash` mismatches must block silent use and produce diagnostics.
Hash mismatch repair should require reconnecting, pulling a trusted update, or switching to a known-good snapshot/source.
Remote-declared hashes are useful metadata, not integrity proof; integrity checks must compare locally computed hashes against existing lock metadata or a user-approved new lock.

## Project-file safety

Project JSON must not persist credentials, tokens, browser handles, or absolute local paths.
Public Git URLs or HTTPS manifest URLs may be retained only after canonicalization.
Reject username/password URL fields, strip fragments, deny token-like query parameters and signed URLs, and prefer structured GitHub `{ owner, repo, ref }` metadata where possible.
Private/local source metadata must be stripped from shared exports or marked editor-local only.

Embedded snapshots are for portability, editing recovery, and source fallback.
Snapshots must strip `.git`, hidden files, `node_modules`, env files, credentials, local absolute paths, and unrelated files.
Snapshot embedding should prefer a positive allowlist of required component contract files plus explicit denylisted filename/content patterns, rather than broad directory inclusion.
Display labels must be safe labels, not auto-derived full paths or user/client-identifying path fragments.

## Review warnings and diagnostics

Importing a component source must warn that components may execute code.
Review-required updates must show changed components, version/hash changes, manifest changes, runtime requirements, source URL/ref, and trust impact before accepting.
Diagnostics must cover source unavailable, invalid manifest, invalid component contract, hash mismatch, security blocked, browser permission missing, and unsupported runtime requirement.

Stronger sandboxing of untrusted component execution is deferred to a separate security project.
Do not claim that Dev Mode authored component compilation or this package contract is a complete security sandbox for arbitrary unknown third-party code.

## Static export constraints

See the [component library extraction decision register](../../../docs/prds/component-library-extraction-decisions.md) before expanding static export or runtime-source behavior.
It records the current non-goals and open questions for portable precompiled artifacts, embedded snapshots, Dev Mode artifacts, and sandboxing.

Static export cannot rely on compiling arbitrary component source inside the exported site.
Raw embedded Vue, TypeScript, or project JSON source is not runtime-executable in static exports.
Embedded source snapshots must not automatically be treated as runtime-executable in exported static sites.

Static export must include only components already materialized or compiled into the preview/export runtime.
If external components are used, export must either have those components precompiled/materialized into the export runtime at build/export time or fail with a clear diagnostic explaining which components/sources are missing.
Missing materialized external components must block export with diagnostics such as `static-export-blocked-external-component`, `static-export-missing-materialized-component`, `static-export-unsupported-runtime-requirement`, `static-export-cache-only-source-unavailable`, or `static-export-component-hash-mismatch`.
Export materialization must not leak private component source; static export should strip source maps, `sourcesContent`, local paths, and private refs by default, and require explicit confirmation before exporting private/local/review-required components.

## Boundaries

- Keep browser and host effects behind package runtime-service facades.
- Do not invent new provider behavior or sandbox guarantees in component docs.
- Keep export-policy and runtime behavior aligned with existing package/source artifacts before documenting it as supported.
- Do not document marketplace behavior, private browser Git behavior, runtime compilation inside exported sites, or complete untrusted-code sandbox guarantees unless those behaviors are implemented and verified.

## References

- [Component contract](component-contract.md)
- [Testing guide](testing-guide.md)

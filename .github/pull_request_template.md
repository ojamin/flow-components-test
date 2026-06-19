## Summary

- <!-- What changed and why? -->

## Scope

- [ ] Component source change
- [ ] SDK/runtime contract change
- [ ] Theme or runtime CSS change
- [ ] Preview app, fixture, or generated manifest change
- [ ] Script, package metadata, dependency, lockfile, or lifecycle-script change
- [ ] CI workflow change
- [ ] Documentation-only change

## Design review triggers

- [ ] Visual output changed
- [ ] Component states changed: empty, loading, error, disabled, focus, keyboard, responsive, or themed states
- [ ] Package design-system docs were checked
- [ ] Not applicable

Notes:

## Accessibility review triggers

- [ ] Interactive behavior, focus order, labels, semantics, keyboard paths, or status messaging changed
- [ ] Empty/loading/error/disabled/review-required states remain understandable without color alone
- [ ] Accessibility states documentation was checked
- [ ] Not applicable

Notes:

## Dependency and security review triggers

- [ ] `package.json` or lockfile changed
- [ ] Dependency trust, source fetching, source snapshots, or restricted fixtures changed
- [ ] Lifecycle scripts such as `prepare`, `postinstall`, or `prepack` changed
- [ ] No secrets, credentials, restricted fixture data, browser handles, hidden files, or absolute local paths are added
- [ ] Fork/PR CI does not require publish, app-consumption, or restricted source credentials
- [ ] Not applicable

Notes:

## Runtime and static-export review triggers

- [ ] Renderer, transform, runtime-service facade, generated manifest, source manifest, or runtime CSS changed
- [ ] Static-export behavior was considered and does not execute raw embedded source snapshots
- [ ] Compiled/materialized runtime component path remains the execution path
- [ ] Not applicable

Notes:

## App compatibility review triggers

- [ ] Public component id, manifest, ports, params, events, outputs, theme inputs, sizing metadata, or generated catalog changed
- [ ] App dependency bump or branch/ref consumption proof is required
- [ ] Existing component projects remain compatible or migration/breaking notes are included
- [ ] Not applicable

Notes:

## Verification

Commands run and results:

```text
npm ci
npm run generate:check
npm run validate
npm run prove:definition-loader
npm run typecheck
npm run test:components
npm run preview:build
npm run build
npm run pack:dry-run
npm run audit:prod
npm run policy:standalone
npm run check:standalone
```

Use optional `test:app-integration:*` lanes only when host app compatibility proof is requested.
Future visual/state regression proof must use only the AIC-provided Playwright/Chrome installation; do not run `playwright install` or download browsers.

Preview coverage:

- [ ] Desktop
- [ ] Tablet
- [ ] Mobile
- [ ] Theme variants when relevant
- [ ] Fixture/state matrix when relevant
- [ ] Not applicable

## Reviewer notes

- CODEOWNER areas touched:
- Follow-up work:

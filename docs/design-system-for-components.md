# Design System for Components

## Purpose

This page is the package-local entry point for component design-system expectations.
It defines the package-owned rules for rendered component surfaces, component config panels, component themes, and package preview examples.
The app-wide design-system rules in `../../../docs/design-system.md` remain canonical for editor chrome and host application surfaces, not for package component/page UI unless this page explicitly links to them.

## Ownership boundaries

Package component/page UI may intentionally diverge from app/editor chrome when the component contract, fixture state, or package preview workflow needs a different presentation.
That divergence is allowed only when runtime contracts, component-theme behavior, accessibility, and package quality gates remain intact.

| Surface                                                                         | Owner   | Package rule                                                                                                                                          |
| ------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editor chrome, app shell, app routes, rails, and dialogs outside rendered pages | App     | Keep app-only styling and UX rules in the app docs; do not copy host chrome into package components.                                                  |
| Component renderer markup and styling                                           | Package | Tailwind utility classes only; this page defines the component quality bar.                                                                           |
| Component config-panel UI inside the package                                    | Package | Compose controls through `@flow-builder/components/component-ui` / `packages/components/src/sdk/component-ui.ts`; do not import host app UI directly. |
| Component theme JSON payloads and `--ct-*` / component-facing theme bridge      | Package | Package owns schema, defaults, docs, validation, and preview coverage.                                                                                |
| App editor theme tokens and route chrome                                        | App     | The host may map package output into editor/preview shells, but it does not own package component-theme internals.                                    |
| Breakpoint/device previews for component authoring                              | Package | Package preview coverage must prove component behavior across supported devices and fixture states.                                                   |
| Flow/Builder/Preview route chrome and static-export packaging                   | App     | Package components must preserve runtime/export contracts without depending on host-only implementation details.                                      |
| DS-008/DS-016/card/AI-slop style rules for component surfaces                   | Package | Component surfaces must follow the package rules below even when app chrome uses separate rules or exceptions.                                        |

## Component styling boundaries

- Build package renderers and config panels with Tailwind utility classes only.
- Do not add Vue SFC `<style>` blocks, inline `style` attributes, ad hoc CSS files, host-app styling dependencies, or app-shell UI imports to package source.
- Compose UI from shadcn-vue components through the package component-UI facade instead of importing host shadcn implementations directly.
- Use `packages/components/src/sdk/component-ui.ts` as the package-owned UI/config facade; do not add parallel component-UI bridges or host app UI imports.
- Prefer existing package SDK/facade utilities over duplicating host implementation details.
- Keep components independent from app stores, router, pages, builder internals, app-shell UI, and non-allowlisted runtime internals.
- Components use the public SDK only for authoring contracts and runtime integration.

## Component surface quality checklist

Use this checklist for every renderer, config panel, preview example, and component-specific page before review:

- DS-008/DS-016/card/AI-slop: avoid faux cards, nested bordered shells, decorative container stacks, generic AI-generated filler panels, and ornamental chrome that is not part of the component contract.
- Tailwind-only styling: use utility classes in component Vue/TS files; do not add inline styles, Vue SFC `<style>` blocks, ad hoc CSS files, or host-app CSS dependencies.
- Package facade usage: use package SDK/facade helpers and `@flow-builder/components/component-ui` for config UI instead of app stores, app router, app-shell UI, or host shadcn imports.
- Component theme: preserve the component-theme contract, `themeContext`, scoped `data-ct-scope`, and `--ct-*` bridge behavior; do not persist derived theme variables or invent app-owned theme mappings in component code.
- Focus: provide visible focus treatment for every interactive renderer/config-panel control and keep focus order logical in desktop, tablet, and mobile previews.
- Responsive behavior: verify layout, readable text, target sizes, overflow, and interaction paths across supported package preview device sizes.
- Empty/loading/error/disabled states: document and render each state that the component contract can expose, with user-facing copy and without secret/path leakage.
- Keyboard: provide keyboard activation and navigation wherever a pointer interaction exists, or document why the renderer is intentionally non-interactive.
- Fixture states: include deterministic fixture coverage for normal, empty, loading or simulated pending, error, disabled, long-content, and responsive variants where relevant.
- Runtime/export safety: keep renderer output compatible with Preview and static-export runtime contracts; package UI may differ from editor chrome but must not depend on editor-only services.

## Required component states

Every component must define and verify the states it can expose.
Support empty, loading, error, and disabled states where those states are relevant to the component contract.

- Empty states must explain what data or configuration is missing without implying an app-internal repair path.
- Loading states must be visible, non-blocking where possible, and understandable without relying only on motion.
- Error states must describe the user-facing failure and avoid leaking credentials, private paths, tokens, or raw implementation details.
- Disabled states must communicate why the control or renderer interaction is unavailable and must not look interactive.
- Interactive states must have visible hover, focus, active, selected, and invalid affordances that remain consistent with the design system.

## Config panels

Config panels must use the package component-UI facade for controls, labels, helper text, validation messaging, and grouped settings.
Do not create bespoke low-level primitives when an approved shadcn-vue facade control already covers the need.
Keep display labels safe: labels may use user-provided component names, public source names, or sanitized filenames, but must not auto-display full local paths, user/client-identifying path fragments, credentials, tokens, browser handles, or absolute paths.

## Preview verification

Use the package preview app for visual inspection across theme, device, viewport, and component state variants:

```bash
npm run preview:dev
```

## References

- [Renderer guide](renderer-guide.md)
- [Component theme contract](component-theme-contract.md)
- [Config panel guide](config-panel-guide.md)
- [Collection import guide](collection-import-guide.md)
- [Accessibility states](accessibility-states.md)

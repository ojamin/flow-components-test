# Modal primitive decision for Issue #51

Task Master subtask `5.8` required choosing one package modal primitive before
implementation so the component library does not ship an ambiguous or partial
modal surface.

## Decision

Implement `dialog`, not `sheet`, for Issue #51.

## Evidence

- The reusable-component task asks for shadcn-parity primitives that can build
  themed pages without one-off stand-ins (`.taskmaster/tasks/tasks.json:477-480`).
- The package component contract requires generic reusable units, contract-only
  communication, package-boundary imports, and proof of the public contract
  (`packages/components/docs/component-building-spec.md:20-36`).
- Package renderers must use package-owned facades and must not import app UI,
  editor chrome, or host overlay managers (`packages/components/AGENTS.md:9-20`).
- The app already has shadcn dialog semantics available as a root reference
  (`src/components/ui/dialog/index.ts:1-10`), and the package now has overlay
  facade precedents that support `disablePortal` for preview/static-safe tests
  (`packages/components/src/sdk/component-ui/popover/PopoverContent.vue:12-45`,
  `packages/components/src/sdk/component-ui/tooltip/TooltipContent.vue:12-57`).
- Impeccable design advice for this task selected dialog because it is the more
  generic reusable modal primitive; sheet implies an app-navigation or edge-panel
  layout and would broaden the component contract.

## Requirements for subtask 5.9

- Add only `content.dialog` and a package-owned dialog facade.
- Support trigger text, title, description, content/body, optional footer/action
  copy, default-open state, and renderer-local open/close behavior.
- Use accessible name/description, close affordance, Escape close, focus
  trap/restore from the underlying Reka dialog primitive, and static-export-safe
  local overlay behavior.
- Consume component-theme popover/surface, foreground, foreground-muted, border,
  focus ring, radius, and shadow roles through Tailwind utility classes.
- Do not implement sheet in this tranche.

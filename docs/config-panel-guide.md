# Config Panel Guide

## Purpose

This guide orients authors working on package `ConfigPanel.vue` files.
Config panels edit component configuration without importing host editor internals.

## Component-UI facade

Use `@flow-builder/components/component-ui` as the package-owned UI/config facade. For
params-driven package panels, prefer the shared `SchemaConfigPanel` wrapper; it
owns the `SchemaForm` section/header/default-config/resolved-input wiring so
individual component panels stay declarative and under the Task 44 line cap:

```ts
import { SchemaConfigPanel } from "@flow-builder/components/component-ui";
import type { ParamValuesState } from "@flow-builder/components/sdk";
```

The facade exports `SchemaForm`, `SchemaConfigPanel`, package-owned
shadcn-vue primitives, `Icon`, and config controls such as `ConfigSelector`,
`ConfigToggle`, `ConfigInspectorSection`, and `ConfigValidationFeedback`.
Do not import those controls directly from parent-app paths.

## Boundary rules

- Do not add parallel UI bridges without an assigned migration slice.
- Do not import host stores, router modules, pages, app-shell UI, builder internals, or host-only implementation details.
- Keep config UI compatible with the component `configSchema` and `configDefaults` from `types.ts` and `component.ts`.
- Use Tailwind utility classes and facade-provided shadcn-vue components; do not add component-local CSS, Vue `<style>` blocks, or inline styles.

## Authoring notes

- Expose clear labels, descriptions, defaults, disabled states, and validation feedback where the package contract supports them.
- Keep field names and options consistent with the config schema.
- Parse or normalize displayed config with the same schema/defaults used by the component definition.
- Prefer accessible form markup: visible labels, stable control names, keyboard-reachable controls, and clear invalid/disabled semantics.
- Keep examples and state coverage grounded in existing component tests and preview-app behavior.
- New or migrated params-driven `ConfigPanel.vue` files should import
  `SchemaConfigPanel`, pass the component's `params`, `configDefaults`, and
  `componentDefinition.inputs`, and re-emit `update:config` / `update:paramValues`.
  The host forwards `config`, `paramValues`, `resolvedInputs`, optional fixture
  data, and optional placement-resolved `themeContext` through component
  fallthrough attrs.
- Package panels must stay on the public package facade. Do not import host
  inspector helpers, app-private legacy field helpers, migration helpers, or
  parent-app config-state utilities to normalize, read, or write component
  configuration.

## Params-aware editing

- Every component definition declares `params`; components with no configurable params use `params: {}` and have no param controls to render.
- Config panels receive and emit resolved config values; renderers, transforms, and runtimes should never read `paramValues` directly.
- `update:config` may only include keys declared in the component's `params`; hosts validate and reject undeclared config keys instead of treating them as hidden or legacy config state.
- Use `update:config` for literal config edits. For components with configurable params, the Project Inspector bridge writes changed param keys through `ComponentInstance.paramValues` while preserving existing bind-mode params.
- Use `update:paramValues` only when a panel or schema form edits literal-vs-bind state directly. Emit the complete next params state, limited to declared params, so the host can commit it atomically through history.
- Keep panel responsibilities clear: literal controls edit schema values, while bind controls choose `mode: "bind"` entries constrained to the param descriptor's `bindFrom` sources.

## Conditional authoring controls

Params-driven panels may declare field-level interactivity metadata in `ParamMeta`
or through the shared helpers in `config-field-helpers.ts`:

```ts
selectParam(z.enum(["manual", "connected"]).default("manual"), {
  label: "Rows source",
  options: ["manual", "connected"],
});

dataPathParam(dataPathSchema, {
  label: "Connected rows",
  placeholder: "$.items",
  showWhen: (config) => config.rowsSource === "connected",
});

numberParam(limitSchema, {
  label: "Preview limit",
  min: 1,
  max: 500,
  disabledWhen: (config) => config.rowsSource === "connected",
  disabledHelpText: "Connected rows control the preview size.",
});
```

Condition predicates are synchronous, deterministic, side-effect-free functions
over the defaults-merged authoring `config` snapshot that `SchemaConfigPanel`
passes to `SchemaForm`. They read sibling authoring config values only. They do
not read `paramValues`, live bound runtime values, resolved input payloads,
fixture data, DOM state, host stores, async resources, or static-export runtime
state. A param currently in bind mode is still evaluated from the same authoring
config snapshot, not from the live bound value.

`meta.visible === false` remains the permanent static hide and takes precedence
Config UI and suppresses empty group headers, but it does not delete, reset, or
normalize the field's `config` value or `paramValues` bind state. Re-showing the
field restores the same persisted literal or bind state.

`disabledWhen(config) === true` keeps the field visible and readable while all
literal, bind-mode, adapter, and compound editing affordances are non-interactive.
Disabled fields expose field-level `aria-disabled`, keep invalid/persisted values
visible, and show inline reason text using `disabledHelpText`, then `helpText`,
then the fallback “Controlled by another setting.” Hidden fields win over
disabled fields, so a hidden field does not evaluate or render disabled state.

If a predicate throws, `SchemaForm` fails open for that field (`showWhen` leaves
it visible; `disabledWhen` leaves it enabled) and renders a package-owned
diagnostic with the param key, condition kind, and error message. Predicate code
inherits the existing trusted executable component-source model; this V1 feature
does not add a serialized expression DSL or sandbox guarantees for untrusted
external component sources.

## Control kinds

`ParamControl.kind` selects the literal editor that `SchemaForm` renders for a
param. Each kind below documents its descriptor shape and the value shape it
reads from / emits to `update:config`.

### `code`

Edits a free-form code string (JSON, JavaScript, Markdown). Used by transform
and content components that need to author small code/text payloads inline
(for example `transform.javascript`, `transform.json-select`, raw JSON bodies).

Descriptor shape:

```ts
{
  kind: "code";
  language: "json" | "javascript" | "markdown";
  testId?: string;
}
```

Value shape: `string` (read/written directly through `update:config`).

Default rendering and host adapter policy:

- The package default control is a font-mono `<Textarea>` from
  `@flow-builder/components/component-ui`. The textarea is intentionally the
  package's only `kind: "code"` editor so package code never imports Monaco,
  CodeMirror, or any host editor module. The font-mono class is preserved so
  authoring stays readable for code/JSON payloads.
- Hosts that ship a real code editor can register a Vue component adapter via
  `registerCodeEditor(adapter)` from `@flow-builder/components/component-ui`.
  When an adapter is registered, SchemaForm renders the registered component
  for every `kind: "code"` field instead of the textarea fallback. Pass
  `null` to clear the registration and restore the textarea.
- The adapter contract is intentionally narrow so the package never binds to
  a specific editor. The host adapter component must accept the
  [`CodeEditorAdapterProps`](#code-editor-adapter-props) prop set and emit
  `update:modelValue` with the next string value. Descriptor `testId` and the
  package-supplied `font-mono text-xs` class are passed through as
  fallthrough attributes so existing test/style assertions keep working.
- The adapter is host-side concrete code. Hosts that want Monaco wire it
  inside their own boot path (the SDK itself stays editor-free) and call
  `registerCodeEditor(MonacoCodeEditor)` once before any config panel
  mounts. Adapter registration is reactive, so `registerCodeEditor(null)`
  during teardown swaps live panels back to the textarea fallback.
- The control is not bindable by default; descriptors that need bind support
  can opt in through `meta.bindable` and the shared `Literal | From data`
  toggle continues to work, with the literal mode rendering through the
  registered adapter (or the textarea fallback).

#### `CodeEditorAdapter` props

```ts
import { registerCodeEditor } from "@flow-builder/components/component-ui";
import type {
  CodeEditorAdapter,
  CodeEditorAdapterProps,
  CodeEditorLanguage,
} from "@flow-builder/components/component-ui";

// CodeEditorAdapterProps:
//   modelValue: string;             // current value
//   language: CodeEditorLanguage;   // "json" | "javascript" | "markdown"
//   rows?: number;                  // requested visible rows; 6 by default

// Adapter must emit `update:modelValue` with the next string value.
registerCodeEditor(MyHostCodeEditor satisfies CodeEditorAdapter);
```

### `headers`

Edits an ordered list of HTTP-style header rows. Used by HTTP-request style
components (for example `data.http-request`) so each panel does not ship its
own bespoke key/value editor.

Descriptor shape:

```ts
{
  kind: "headers";
  keyPlaceholder?: string;   // Defaults to "Header name"
  valuePlaceholder?: string; // Defaults to "Header value"
  addLabel?: string;         // Defaults to "Add header"
  testId?: string;           // Test id for the fieldset root
}
```

Value shape (each row):

```ts
{
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}
```

The row shape matches the `KeyValueField` schema used by the canonical
`httpRequestConfigSchema`, so a `data.http-request` config can adopt the
control without a converter step.

Behavior:

- Add button appends a new row with a fresh `id`, empty `key`/`value`, and
  `enabled: true`. Remove button drops the row.
- The per-row enabled `Switch` toggles `row.enabled`. When `false`, the row's
  `key` and `value` inputs are visually dimmed and disabled, and the row is
  excluded from validation.
- Every key/value/enabled edit and add/remove operation emits `update:config`
  with the patched array. Validation feedback is rendered inline; emits are
  not gated, so the parent always sees the in-flight authoring state.
- Validation surfaces two inline alerts: an "empty name" alert when any
  enabled row has a blank `key`, and a "duplicate name" alert when two or
  more enabled rows share a key (case-insensitive, per RFC 7230). The
  offending row inputs receive `aria-invalid="true"`.
- Empty state shows a flat dashed-bordered hint inviting the user to add a
  row. The hint is descriptive copy only, not a faux-card.
- The control is not bindable: header arrays are authored as literals.
  Components that need to bind a request payload (URL, body) should expose
  separate bindable params and keep `headers` literal.

### `chart-adapter`

Edits chart data mapping centrally for chart components (`chart.bar`,
`chart.line`, `chart.donut`). One descriptor owns multiple config keys: a rows
path key plus a list of role-tagged dependent field keys. Reads the connected
adapter context from the optional `data` prop on `SchemaForm` and derives
options through the package-owned `chart-data-helpers` (`deriveChartRowsPathOptions`,
`deriveChartFieldOptions`, `filterChartFieldOptions`, `validateChartFieldSelection`,
`suggestChartFieldPath`).

Descriptor shape:

```ts
{
  kind: "chart-adapter";
  rowsKey: string;                                  // e.g. "rowsPath"
  fields: ReadonlyArray<{
    key: string;                                    // e.g. "xField" / "yField" / "labelField" / "valueField"
    role: "x" | "y" | "label" | "value";
    label?: string;                                 // defaults to a role label ("X field", "Y field", …)
    hint?: string;
    placeholder?: string;
  }>;
  rowsLabel?: string;                               // visible label for the rows selector
  rowsHint?: string;                                // override hint shown under the rows selector when ready
  rowsPlaceholder?: string;                         // placeholder when no rows path is selected
  testId?: string;                                  // root fieldset test id; defaults to "${fieldKey}-chart-adapter"
}
```

Mapping convention for current chart components:

- `chart.bar` / `chart.line` — `rowsKey: "rowsPath"`, fields
  `[{ key: "xField", role: "x" }, { key: "yField", role: "y" }]`.
- `chart.donut` — `rowsKey: "rowsPath"`, fields
  `[{ key: "labelField", role: "label" }, { key: "valueField", role: "value" }]`.

Dependent field keys (`xField`, `yField`, `labelField`, `valueField`) keep
their own `param(...)` entries in `types.ts` so the `configSchema`/defaults
stay authoritative; mark those auxiliary descriptors `visible: false` so the
chart-adapter is the only chart-mapping editor in the inspector.

Behavior:

- Renders a rows path selector plus one selector per declared field role.
  Selectors are filtered to role-appropriate field options
  (`filterChartFieldOptions`).
- Changing the rows path emits a single `update:config` patch that updates
  `rowsKey` and resuggests every dependent field key through
  `suggestChartFieldPath`. A current dependent value that still validates
  against the new rows is preserved as-is; an invalid current value falls
  back to the first role-compatible suggestion (or `""` when no candidate
  exists).
- Changing a single dependent field selector emits a one-key `update:config`
  patch for that field only.
- Stale current values (rows path or field paths that do not exist in the
  current data) remain selectable and are shown with an
  "… · unavailable in current data" / "… · unavailable for the current rows"
  suffix so the user can see what was previously authored.
- A dependent field whose current value fails `validateChartFieldSelection`
  surfaces an inline `role="alert"` hint under the selector.
- When no `data` is provided or no arrays of objects are detected, the rows
  selector is disabled, dependent selectors are disabled, and a flat dashed
  hint invites the user to connect data. The fieldset carries
  `data-no-data="true"` so e2e proofs can assert the empty state cleanly.
- The control is non-bindable (chart mapping is authored as literals); the
  shared `Literal | From data` toggle is intentionally not rendered for
  `chart-adapter` descriptors. Components that need bindable rows/fields
  should expose those as separate `kind: "input"` params.

### `record-field`

Edits one field/path string inside a record row. Use `recordFieldParam(...)`
for config keys such as `labelField`, `valueField`, `idField`, `sourceField`,
or output/count field names when the value should stay a plain string but the
user benefits from the same picker affordance everywhere.

Descriptor shape:

```ts
{
  kind: "record-field";
  placeholder?: string;
  pickerRootPathKey?: string;       // Optional sibling config key that scopes the picker root
  pickerRootPathSuffixKey?: string; // Optional sibling key appended below each root row
  testId?: string;
}
```

Value shape: `string` (read/written directly through `update:config`).

Behavior:

- Renders a normal text input so authored paths keep working without host data
  or adapters.
- When the host registers the data-path picker adapter, the control also shows
  the picker button and emits the selected relative path back as the same
  string value.
- If `pickerRootPathKey` is set, `SchemaForm` reads that sibling config value
  and passes it to the host picker as `rootPath`, so row-field params can
  browse a single item inside a configured rows/items path.
- If `pickerRootPathSuffixKey` is also set, the suffix sibling value is joined
  under each root row with a wildcard hop. For example, a base `seriesPath` of
  `series` plus a suffix `pointsField` of `points` scopes the picker to
  `series[*].points`, which is useful for nested row fields such as multi-line
  chart point `x`/`y` fields.
- `recordFieldParam(...)` preserves the caller's schema/defaults/binding
  metadata and is the canonical helper for data/key/value/label field names.

### `field-list`

Edits an ordered `string[]` of field/path values. Use `fieldListParam(...)` for
configs where one or more record fields need to be selected, such as Group By's
`groupByFields`.

Descriptor shape:

```ts
{
  kind: "field-list";
  addLabel?: string;         // Defaults to "Add field"
  itemPlaceholder?: string;  // Defaults to "field path"
  pickerRootPathKey?: string; // Optional sibling config key that scopes the picker root
  testId?: string;           // Test id for the fieldset root
}
```

Value shape: `string[]`.

Behavior:

- Add button creates a local empty draft row; remove button drops that row.
- Each row renders a text input and, when available, the same host picker used
  by `record-field`.
- If `pickerRootPathKey` is set, `SchemaForm` reads that sibling config value
  and passes it to the host picker as `rootPath`. This lets row-relative lists
  such as Group By fields browse only the data resolved by `rowsPath` while
  still emitting the canonical relative string values.
- New blank draft rows stay local so host schemas that reject blank entries can
  still render the row and scoped picker. Once the user enters or picks a
  non-empty value, the list emits the committed string array.
- Persisted blank rows and touched empty drafts are surfaced with inline
  validation (`role="alert"`) and `aria-invalid`.

### `aggregate-list`

Edits an ordered aggregate definition array. Use `aggregateListParam(...)` when
a component computes one or more aggregate values from record fields, such as
`transform.group-by`.

Descriptor shape:

```ts
{
  kind: "aggregate-list";
  operations: ParamSelectOption[]; // e.g. sum/min/max/average
  addLabel?: string;               // Defaults to "Add aggregate"
  sourcePlaceholder?: string;      // Defaults to "field path"
  outputPlaceholder?: string;      // Defaults to "result name"
  sourcePickerRootPathKey?: string; // Optional sibling config key that scopes source pickers
  testId?: string;                 // Test id for the fieldset root
}
```

Value shape (each row):

```ts
{
  sourceField: string;
  operation: string;
  outputField: string;
}
```

Behavior:

- Add button appends a row with empty `sourceField`, the first configured
  operation, and empty `outputField`.
- Source field cells reuse the `record-field` picker/input pattern. Operation
  uses the shared `Select` primitive. Output field is a text input because it
  names an emitted property, not an existing source field.
- If `sourcePickerRootPathKey` is set, source-field pickers receive that
  sibling config value as `rootPath`; for example, Group By aggregate source
  fields use `rowsPath` so authors pick fields from the row object rather than
  from the parent input object.
- Blank source fields are surfaced with inline validation and `aria-invalid`;
  edits still emit the canonical array shape immediately.

### `theme-role`

Edits a component-theme property role such as `color.accent` or `font.body`.
Use `themeRoleParam(...)` instead of raw `kind: "color"` controls for package
component paint/typography choices outside the Theme component itself.

Host forwarding contract:

- `SchemaConfigPanel` accepts optional `themeContext` and forwards it to
  `SchemaForm`.
- The Project Inspector forwards a placement-resolved `themeContext` and a
  scoped component-theme bridge to custom package ConfigPanels when the
  selected placement/instance can be anchored to the Main Page tree. This lets
  `theme-role` dropdown swatches paint with real `--ct-*` variables.
- If no placement-aware context is resolvable (for example an orphan Flow-only
  instance), the host omits `themeContext`; the control remains usable and
  degrades to label-only options.

Do not introduce raw color pickers for themed component visuals unless a future
task explicitly changes the component-theme authoring contract.

Adapter context (`SchemaForm` `data` prop):

`SchemaForm` accepts an optional `data?: JsonValue` prop. The prop is the
current resolved adapter context for chart components — typically the value
returned by `props.fixtureData` (during package preview) or the resolved
runtime input the host is feeding into the chart. The prop is consumed by
`chart-adapter` only; existing single-key controls do not read it, so it is
safe to omit on non-chart panels and existing panels keep working without
changes.

### Layout slot configuration (no dedicated control)

Layout components (`layout.card`, `layout.repeater`, `layout.section`,
`layout.split`) do not need a dedicated `kind: "slot-config"` control today.
The convention — also encoded by the layout slot-config audit test in
`packages/components/src/sdk/__tests__/layout-slot-config-audit.test.ts` — is:

- **Structural slot definitions stay literal.** Each layout component declares
  its slots through `SlotDefinition` entries on the `ComponentDefinition`
  (`slots: [{ id, label, acceptsChildren, childScopeMode, layoutKind }]` in
  `component.ts`). Slot id/label/scope mode/layout kind are not user-editable
  runtime config and therefore do not appear in `params` or in any control
  descriptor.
- **Slot-shape config uses existing primitives.** Authorable layout intent
  that does live in `params` — gap tokens (`layout.repeater.gapToken`), ratio
  presets (`layout.split.ratio`), padding/tone/radius/shadow tokens
  (`layout.section`, `layout.card`), title visibility, item key path, empty
  state copy — is fully expressible through `kind: "input"`, `kind: "textarea"`,
  `kind: "number"`, `kind: "select"`, `kind: "boolean"`, and `kind: "color"`.
- **No bespoke slot panel.** Layout ConfigPanels remain thin SchemaForm
  wrappers over scalar param descriptors; there is no parallel slot editor
  surface to migrate.

Add a new `kind: "slot-config"` control only when a future layout component
needs editable slot intent that none of the existing primitives can express
(for example, an authorable variable-length list of slot definitions). When
that lands, document the descriptor shape, render expectations, default
behaviors, and any host-side adapter requirements alongside the other control
kinds above and update the audit allowlist.

## Scaffold baseline

The scaffolded `ConfigPanel.vue` imports `ConfigInspectorSection` from `@flow-builder/components/component-ui`, parses config with the component schema/defaults, and renders non-empty panel content.
Keep that minimum contract even for components with little or no editable config so `describeStaticComponentContract()` can mount the config panel.

## Test coverage

Config-panel mount coverage is part of the contract harness: `describeStaticComponentContract()` loads `configPanel`, mounts it with parsed config and fixture data, and expects non-empty HTML.
When adding meaningful config editing behavior, add contract or render cases that prove the displayed defaults, option labels, validation messages, and disabled states match the schema and component behavior.

## References

- [Component contract](component-contract.md)
- [Renderer guide](renderer-guide.md)
- [Design system for components](design-system-for-components.md)
- [Accessibility states](accessibility-states.md)
- [Testing guide](testing-guide.md)

/**
 * Component UI/config facade for package-hosted static component panels.
 *
 * Static components should import UI primitives, config controls, and the
 * shared `SchemaForm` from this package surface rather than reaching into
 * host application paths directly. Concrete shadcn-vue and config-control
 * implementations are package-owned under `./component-ui/` and re-exported
 * through `./component-ui-primitives`, which is the lower-level internal module
 * that Vue SFCs re-exported by this barrel must use to avoid a facade self-cycle.
 */

export * from "./component-ui-primitives";

// `kind: "code"` SchemaForm fields default to a monospace `<Textarea>`; hosts
// that ship a real code editor can register a Vue component adapter via
// `registerCodeEditor(adapter)` from this barrel. The adapter API lives in a
// dedicated module so callers of the broader UI primitives barrel don't have
// to pull Vue's deep template types.
export { registerCodeEditor, getRegisteredCodeEditor } from "./code-editor-adapter";
export type {
  CodeEditorAdapter,
  CodeEditorAdapterProps,
  CodeEditorLanguage,
} from "./code-editor-adapter";
export { registerDataPathPicker, getRegisteredDataPathPicker } from "./data-path-picker-adapter";
export type {
  DataPathPickerAdapter,
  DataPathPickerAdapterProps,
  DataPathPickerMode,
  DataPathPickerOutputFormat,
} from "./data-path-picker-adapter";

export { default as SchemaForm } from "./SchemaForm.vue";
export { schemaFormPerformanceDiagnosticsKey } from "./schema-form-performance-diagnostics";
export type { SchemaFormPerformancePhaseRecorder } from "./schema-form-performance-diagnostics";

// Shared `SchemaForm` wrapper used by every `groups/**/ConfigPanel.vue`. Owns
// the section header, defaults merge, host/static inputs fallback, and
// fixture-data passthrough so each panel stays a declarative shell.
export { default as SchemaConfigPanel } from "./SchemaConfigPanel.vue";

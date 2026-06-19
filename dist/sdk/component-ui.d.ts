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
export * from "./component-ui-primitives.js";
export { registerCodeEditor, getRegisteredCodeEditor } from "./code-editor-adapter.js";
export type { CodeEditorAdapter, CodeEditorAdapterProps, CodeEditorLanguage, } from "./code-editor-adapter.js";
export { registerDataPathPicker, getRegisteredDataPathPicker } from "./data-path-picker-adapter.js";
export type { DataPathPickerAdapter, DataPathPickerAdapterProps, DataPathPickerMode, DataPathPickerOutputFormat, } from "./data-path-picker-adapter.js";
export { default as SchemaForm } from "./SchemaForm.js";
export { schemaFormPerformanceDiagnosticsKey } from "./schema-form-performance-diagnostics.js";
export type { SchemaFormPerformancePhaseRecorder } from "./schema-form-performance-diagnostics.js";
export { default as SchemaConfigPanel } from "./SchemaConfigPanel.js";

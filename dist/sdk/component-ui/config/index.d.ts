/**
 * Package-owned barrel for the four config primitives consumed by package
 * config panels. Host-coupled config primitives (ConfigFieldValueEditor,
 * ConfigKeyValueEditor, binding helpers) remain in the host app.
 */
export { default as ConfigInspectorSection } from "./ConfigInspectorSection.js";
export { default as ConfigSelector } from "./ConfigSelector.js";
export { default as ConfigToggle } from "./ConfigToggle.js";
export { default as ConfigValidationFeedback } from "./ConfigValidationFeedback.js";
export type { ConfigInspectorSectionProps, ConfigSelectorOption, ConfigValidationMessage, ConfigValidationSeverity, } from "./types.js";

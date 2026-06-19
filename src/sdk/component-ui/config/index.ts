/**
 * Package-owned barrel for the four config primitives consumed by package
 * config panels. Host-coupled config primitives (ConfigFieldValueEditor,
 * ConfigKeyValueEditor, binding helpers) remain in the host app.
 */

export { default as ConfigInspectorSection } from "./ConfigInspectorSection.vue";
export { default as ConfigSelector } from "./ConfigSelector.vue";
export { default as ConfigToggle } from "./ConfigToggle.vue";
export { default as ConfigValidationFeedback } from "./ConfigValidationFeedback.vue";

export type {
  ConfigInspectorSectionProps,
  ConfigSelectorOption,
  ConfigValidationMessage,
  ConfigValidationSeverity,
} from "./types";

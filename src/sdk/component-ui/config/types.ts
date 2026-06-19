// Package-owned types for the four config primitives used by package config
// panels. Host-coupled types (ConfigFieldValue, ConfigKeyValueEntry, binding
// sources, etc.) intentionally stay in the host app — they describe app-level
// editor state, not the package's neutral SchemaForm primitives.

export interface ConfigSelectorOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export type ConfigValidationSeverity = "error" | "warning" | "info";

export interface ConfigValidationMessage {
  id: string;
  severity: ConfigValidationSeverity;
  message: string;
}

export interface ConfigInspectorSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  disabled?: boolean;
}

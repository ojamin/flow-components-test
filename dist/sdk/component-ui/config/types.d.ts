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

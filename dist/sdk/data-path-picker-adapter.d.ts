import { type Component } from "vue";
import type { InputPortDefinition } from "./component-definition.js";
export type DataPathPickerMode = "literal" | "binding";
export type DataPathPickerOutputFormat = "relative" | "jsonpath";
export interface DataPathPickerAdapterProps {
    modelValue: string;
    fieldLabel: string;
    mode: DataPathPickerMode;
    outputFormat: DataPathPickerOutputFormat;
    instanceId?: string;
    sourceInputId?: string;
    inputs?: readonly InputPortDefinition[];
    /**
     * Optional dot/JSONPath into the source value that becomes the picker
     * tree root. When set and resolvable to an array, the host scopes browsing
     * to the first item in that array so emitted relative paths match the
     * per-row authoring contract used by Group By's row-relative fields.
     * Nested array roots (e.g. `series[*].points` for multi-line points) keep
     * collapsing one array level at a time so the tree shows the inner per-
     * row item directly.
     */
    rootPath?: string;
}
export type DataPathPickerAdapter = Component;
export declare function registerDataPathPicker(adapter: DataPathPickerAdapter | null): void;
export declare function getRegisteredDataPathPicker(): DataPathPickerAdapter | null;

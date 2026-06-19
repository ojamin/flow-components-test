import { type Component } from "vue";
export type CodeEditorLanguage = "json" | "javascript" | "markdown";
export interface CodeEditorAdapterProps {
    modelValue: string;
    language: CodeEditorLanguage;
    rows?: number;
}
export type CodeEditorAdapter = Component;
export declare function registerCodeEditor(adapter: CodeEditorAdapter | null): void;
export declare function getRegisteredCodeEditor(): CodeEditorAdapter | null;

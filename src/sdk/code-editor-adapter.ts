// Code editor adapter registry (Phase 2.3 / Task 44.9).
//
// `kind: "code"` SchemaForm fields default to a monospace `<Textarea>` so the
// package never needs Monaco/CodeMirror or any host editor module. Hosts that
// ship a real code editor can register a Vue component adapter via
// `registerCodeEditor(...)` at boot; SchemaForm consumes the registry through
// a `shallowRef` so the registered adapter takes over for `kind: "code"`
// fields and `registerCodeEditor(null)` restores the textarea fallback.
//
// The adapter contract is intentionally narrow so the package never binds to
// a specific editor: the adapter receives `modelValue`, `language`, and an
// optional `rows` plus the descriptor's `testId`/`class` (passed as
// fallthrough attributes), and emits `update:modelValue` with the next string
// value.
//
// Kept in its own module (instead of `component-ui-primitives.ts`) so this
// file's `vue` type imports do not propagate template type-checking churn
// through every caller of the broader UI primitives barrel.

import { shallowRef, type Component } from "vue";

export type CodeEditorLanguage = "json" | "javascript" | "markdown";

export interface CodeEditorAdapterProps {
  modelValue: string;
  language: CodeEditorLanguage;
  rows?: number;
}

export type CodeEditorAdapter = Component;

const registeredCodeEditor = shallowRef<CodeEditorAdapter | null>(null);

export function registerCodeEditor(adapter: CodeEditorAdapter | null): void {
  registeredCodeEditor.value = adapter;
}

export function getRegisteredCodeEditor(): CodeEditorAdapter | null {
  return registeredCodeEditor.value;
}

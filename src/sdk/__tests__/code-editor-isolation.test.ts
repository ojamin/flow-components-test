// Defense-in-depth audit for Task 44.9. The static-import-boundaries lint
// already blocks unapproved package imports, but this test asserts the
// specific `kind: "code"` invariant: package code MUST NOT pull Monaco,
// CodeMirror, or any host code-editor module. The default editor for
// `kind: "code"` SchemaForm fields is the font-mono `<Textarea>`; real
// editors stay in the host and reach the package only through the
// `registerCodeEditor(adapter)` facade.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { PACKAGE_SRC } from "./package-paths";

const BANNED_PATTERNS: ReadonlyArray<{ regex: RegExp; reason: string }> = [
  { regex: /['"]monaco-editor(?:\/|['"])/, reason: "monaco-editor" },
  { regex: /['"]@monaco-editor\//, reason: "@monaco-editor/*" },
  { regex: /['"]codemirror(?:\/|['"])/, reason: "codemirror" },
  { regex: /['"]@codemirror\//, reason: "@codemirror/*" },
  { regex: /from\s+['"]@\/components\/code-editor/, reason: "@/components/code-editor" },
  {
    regex: /from\s+['"]@\/components\/project\/(?:dev|data)\/[^'"]*[Cc]ode[^'"]*['"]/,
    reason: "host code-editor pane",
  },
];

function listSourceFiles(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root)) {
    // Skip the test files themselves and any generated artifacts; the
    // banned-import audit is about runtime code, not test fixtures.
    if (entry === "__tests__") continue;
    const full = join(root, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listSourceFiles(full));
      continue;
    }
    if (/\.(ts|vue)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("@flow-builder/components — code-editor isolation", () => {
  it("never imports Monaco, CodeMirror, or host code-editor internals", () => {
    const files = listSourceFiles(PACKAGE_SRC);
    expect(files.length).toBeGreaterThan(0);

    const violations: Array<{ file: string; reason: string }> = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const banned of BANNED_PATTERNS) {
        if (banned.regex.test(source)) {
          violations.push({ file, reason: banned.reason });
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";

import {
  formatDataPathTokens,
  normalizeToJsonPath,
  normalizeToRelativePath,
  resolveDataPath,
  validateDataPath,
} from "../data-path-helpers";

describe("data-path helpers", () => {
  it("normalizes between relative paths and JSONPath strings", () => {
    expect(normalizeToJsonPath("")).toBe("$");
    expect(normalizeToJsonPath("items[0].title")).toBe("$.items[0].title");
    expect(normalizeToJsonPath("[0].title")).toBe("$[0].title");
    expect(normalizeToRelativePath("$")).toBe("");
    expect(normalizeToRelativePath("$.items[0].title")).toBe("items[0].title");
  });

  it("validates supported grammar and rejects expression syntax", () => {
    expect(validateDataPath("$.items[*].title").ok).toBe(true);
    expect(validateDataPath("items[0].title", "relative").ok).toBe(true);
    expect(validateDataPath("$..title").issueKind).toBe("invalid-syntax");
    expect(validateDataPath("$.items[foo]").issueKind).toBe("invalid-syntax");
  });

  it("resolves objects, indexes, and wildcard array selections", () => {
    const source = { items: [{ title: "One" }, { title: "Two" }] };
    expect(resolveDataPath(source, "items[0].title")).toMatchObject({ ok: true, value: "One" });
    expect(resolveDataPath(source, "$.items[*].title")).toMatchObject({
      ok: true,
      value: ["One", "Two"],
    });
    expect(resolveDataPath(source, "$.missing")).toMatchObject({
      ok: false,
      issueKind: "missing-data",
    });
  });

  it("formats token arrays for picker output", () => {
    const tokens = [
      { kind: "property" as const, key: "items" },
      { kind: "wildcard" as const },
      { kind: "property" as const, key: "title" },
    ];
    expect(formatDataPathTokens(tokens, "relative")).toBe("items[*].title");
    expect(formatDataPathTokens(tokens, "jsonpath")).toBe("$.items[*].title");
  });
});

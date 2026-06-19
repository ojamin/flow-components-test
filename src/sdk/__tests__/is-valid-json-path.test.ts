import { describe, expect, it } from "vitest";

import { isValidJsonPath } from "../public-sdk";

describe("isValidJsonPath", () => {
  it.each([
    "$",
    "$.title",
    "$._meta.$value",
    "$.items[0].name",
    "$[0][12].value",
    "$.items[*].name",
  ])("accepts supported path %s", (path) => {
    expect(isValidJsonPath(path)).toBe(true);
  });

  it.each(["title", " $.title", "$..title", "$.items[", "$.items[-1]", "$.items[1.2]", "$[name]"])(
    "rejects unsupported path %s",
    (path) => {
      expect(isValidJsonPath(path)).toBe(false);
    },
  );
});

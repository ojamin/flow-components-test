import { describe, expect, it } from "vitest";

import { resolveSafeImageSrc } from "../content-primitives";

describe("resolveSafeImageSrc", () => {
  it("accepts embedded image data URLs for local media previews", () => {
    expect(resolveSafeImageSrc("data:image/png;base64,AQID")).toEqual({
      state: "valid",
      src: "data:image/png;base64,AQID",
    });
  });

  it("rejects non-image data URLs", () => {
    expect(resolveSafeImageSrc("data:text/html;base64,PGgxPk5vPC9oMT4=")).toEqual({
      state: "unsafe",
    });
  });
});

// Unit-level coverage for renderSanitizedMarkdown's SDK-sanitization wiring.
// The SDK sanitization helper owns browser/no-browser branching and fail-closed
// behavior; these tests prove the markdown wrapper preserves error/empty/sanitization
// reporting through the @flow-builder/components/sdk/markdown facade.

import { describe, expect, it, vi } from "vitest";

describe("renderSanitizedMarkdown", () => {
  it("returns empty html with no error for blank source", async () => {
    const { renderSanitizedMarkdown } = await import("@flow-builder/components/sdk/markdown");

    expect(renderSanitizedMarkdown("   \n   ")).toEqual({
      html: "",
      wasSanitized: false,
      error: null,
    });
  });

  it("renders sanitized markdown and reports wasSanitized when SDK sanitizer removes markup", async () => {
    const { renderSanitizedMarkdown } = await import("@flow-builder/components/sdk/markdown");

    const result = renderSanitizedMarkdown("## Hello\n\n<script>alert('x')</script><p>Body</p>");

    expect(result.error).toBeNull();
    expect(result.html).toContain("Hello");
    expect(result.html).not.toContain("<script");
    expect(result.wasSanitized).toBe(true);
  });

  it("strips javascript: hrefs through the SDK sanitizer", async () => {
    const { renderSanitizedMarkdown } = await import("@flow-builder/components/sdk/markdown");

    const result = renderSanitizedMarkdown("Click [run](javascript:alert(1)) please.");

    expect(result.error).toBeNull();
    expect(result.html.toLowerCase()).not.toContain("javascript:");
  });

  it("propagates SDK sanitizer failures as a markdown error and never returns unsanitized html", async () => {
    vi.resetModules();
    vi.doMock("@flow-builder/components/sdk/sanitization", () => ({
      sanitizeHtmlToResult: () => ({
        html: "&lt;script&gt;boom()&lt;/script&gt;",
        wasSanitized: true,
        usedFallback: true,
        error: "HTML sanitizer failed.",
      }),
    }));

    try {
      const { renderSanitizedMarkdown } = await import("@flow-builder/components/sdk/markdown");

      const result = renderSanitizedMarkdown("<script>boom()</script>");

      expect(result).toEqual({
        html: "",
        wasSanitized: false,
        error: "HTML sanitizer failed.",
      });
    } finally {
      vi.doUnmock("@flow-builder/components/sdk/sanitization");
      vi.resetModules();
    }
  });

  it("reports parser exceptions as markdown errors with empty html", async () => {
    vi.resetModules();
    vi.doMock("marked", () => ({
      marked: {
        parse: () => {
          throw new Error("simulated parse failure");
        },
      },
    }));

    try {
      const { renderSanitizedMarkdown } = await import("@flow-builder/components/sdk/markdown");

      const result = renderSanitizedMarkdown("# Anything");

      expect(result).toEqual({
        html: "",
        wasSanitized: false,
        error: "simulated parse failure",
      });
    } finally {
      vi.doUnmock("marked");
      vi.resetModules();
    }
  });
});

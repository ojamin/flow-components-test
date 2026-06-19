import { describe, expect, test } from "vitest";

import { staticComponentDefinitions } from "../../generated/catalog";
import { mountStaticComponentRenderer } from "../../testing";

const OUT_OF_FLOW_ROOT_TOKENS = new Set(["absolute", "fixed"]);
const FILL_OR_FLOOR_PATTERN = /^(h-full|min-h-|size-full|aspect-|flex-1$|grow$)/;
const CONTENT_HEIGHT_FILL_TOKENS = new Set(["h-full", "size-full", "flex-1", "grow"]);
const ROOT_SIZING_SIGNAL_PATTERN =
  /^(w-full|min-w-|max-w-|h-full|min-h-|size-|aspect-|flex$|grid$|block$|inline-|overflow-|grow$|flex-1$|shrink-0$|p[trblxy]?-|gap-)/;
const STATE_AFFORDANCE_PATTERN =
  /^(min-h-|h-|size-|py-|p-|flex$|grid$|items-|justify-|gap-|rounded-|border$|border-)/;
const STATE_NAME_PATTERN = /(empty|error|loading|skeleton|placeholder)/i;

function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function subtreeTokens(root: Element): string[] {
  return [root, ...Array.from(root.querySelectorAll("*"))].flatMap((element) =>
    classTokens(element),
  );
}

function hasTokenMatching(tokens: readonly string[], pattern: RegExp) {
  return tokens.some((token) => pattern.test(token));
}

function describeRoot(root: Element) {
  const testId = root.getAttribute("data-testid");
  const className = root.getAttribute("class");
  return `<${root.tagName.toLowerCase()}${testId ? ` data-testid="${testId}"` : ""}${
    className ? ` class="${className}"` : ""
  }>`;
}

function findStateAffordanceIssues(root: Element) {
  const stateNodes = [root, ...Array.from(root.querySelectorAll("*"))].filter((element) => {
    const marker = [
      element.getAttribute("data-testid"),
      element.getAttribute("data-state"),
      element.getAttribute("aria-label"),
    ]
      .filter(Boolean)
      .join(" ");
    return STATE_NAME_PATTERN.test(marker);
  });

  return stateNodes
    .map((element) => ({ element, tokens: classTokens(element) }))
    .filter(({ tokens }) => !hasTokenMatching(tokens, STATE_AFFORDANCE_PATTERN))
    .map(({ element }) => describeRoot(element));
}

function renderedRootElement(element: Element): Element {
  let current = element;

  while (
    classTokens(current).length === 0 &&
    !current.getAttribute("data-testid") &&
    !current.getAttribute("role") &&
    current.children.length === 1
  ) {
    current = current.children[0]!;
  }

  return current;
}

describe("package component renderer sizing conformance", () => {
  test.each(staticComponentDefinitions)(
    "$id exposes jsdom-visible sizing contract signals",
    async (definition) => {
      const wrapper = await mountStaticComponentRenderer(definition);

      try {
        const root = renderedRootElement(wrapper.element);
        const rootTokens = classTokens(root);
        const allTokens = subtreeTokens(root);
        const outOfFlowRootTokens = rootTokens.filter((token) =>
          OUT_OF_FLOW_ROOT_TOKENS.has(token),
        );
        const stateAffordanceIssues = findStateAffordanceIssues(root);

        expect(root.outerHTML, `${definition.id} renderer should mount non-empty DOM`).not.toBe("");
        expect(
          outOfFlowRootTokens,
          `${definition.id} root ${describeRoot(root)} must stay in normal flow; absolute/fixed roots collapse auto/min measurement in the Builder host.`,
        ).toEqual([]);
        expect(
          hasTokenMatching(rootTokens, ROOT_SIZING_SIGNAL_PATTERN),
          `${definition.id} root ${describeRoot(root)} should expose a Tailwind sizing/display signal (width, min/fill height, flex/grid/block, overflow, padding, or gap) for host fixed/min/auto sizing.`,
        ).toBe(true);

        if (definition.renderable && !definition.builder.scaffolded) {
          if (["fixed", "container"].includes(definition.builder.heightMode ?? "")) {
            expect(
              hasTokenMatching(allTokens, FILL_OR_FLOOR_PATTERN),
              `${definition.id} ${definition.builder.heightMode} renderer should expose a fill or floor signal such as h-full, min-h-*, flex-1, grow, size-full, or aspect-* so the host rect remains authoritative.`,
            ).toBe(true);
          }

          if (definition.builder.heightMode === "content") {
            const contentFillTokens = rootTokens.filter((token) =>
              CONTENT_HEIGHT_FILL_TOKENS.has(token),
            );
            expect(
              contentFillTokens,
              `${definition.id} content-height root ${describeRoot(root)} should not force full-height/flex growth; auto/min measurement needs intrinsic in-flow content.`,
            ).toEqual([]);
          }
        }

        expect(
          stateAffordanceIssues,
          `${definition.id} default empty/error/loading/placeholder nodes should carry non-collapse affordance classes (min/h/size, padding, flex/grid alignment, gap, rounded, or border).`,
        ).toEqual([]);
      } finally {
        wrapper.unmount();
      }
    },
    30_000,
  );
});

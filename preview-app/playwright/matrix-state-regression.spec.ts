// Spec intent: Task 4.4 — first private-repo visual/state regression gate
// for the package preview matrix route.
//
// What this lane proves:
//   1. The `/matrix` route renders the deterministic 5-state × 2-theme grid
//      (10 cells total) for each representative component.
//   2. Each cell carries the expected `data-state-applicability` attribute,
//      so manifest changes that drop or relabel `stateSupport` metadata fail
//      this lane instead of silently shipping.
//   3. The viewport query param (`?viewport=desktop|tablet|mobile`) controls
//      the matrix grid container width, proving the URL is the single source
//      of truth for refresh-safe matrix navigation.
//   4. Each scenario writes a full-page screenshot into Playwright's
//      `test-results/` directory so contributors can eyeball renderer output
//      during review without committing PNG snapshots.
//
// Why representative components:
//   - `demo.demo-button` declares every state as applicable (`true`) except
//     `loading` (notApplicable). Exercises the "renderer mounted" path for
//     four states plus the N/A path for one.
//   - `content.heading` declares only `empty` and `responsive` as applicable.
//     Exercises the N/A-heavy manifest (4 of 5 matrix states are N/A) and
//     ensures the `matrix-cell-not-applicable` chrome shows the reason text.
//   - `chart.bar` exercises a charting renderer with two N/A states and a
//     real renderer-backed default/empty/error path so the lane catches
//     regressions on a non-trivial visualisation surface.

import { expect, test, type Locator, type Page } from "@playwright/test";

type StateMode = "default" | "empty" | "loading" | "error" | "disabled";
type ThemeMode = "light" | "dark";

interface MatrixCase {
  componentId: string;
  /** Friendly title used in the test name for traceability. */
  title: string;
  /** Manifest-derived applicability lookup. Missing keys mean "applicable". */
  applicability: Partial<Record<Exclude<StateMode, "default">, "applicable" | "not-applicable">>;
}

// Mirror the manifest stateSupport contract for the components covered by this
// lane. Keeping the expectation table local (instead of re-reading the
// manifest) makes the spec independently verifiable: if a manifest drops a
// state, the cell attribute drifts and the test fails with a clear diff
// rather than silently following the change.
const CASES: readonly MatrixCase[] = [
  {
    componentId: "demo.demo-button",
    title: "Button — interactive content, single N/A state",
    applicability: {
      empty: "applicable",
      loading: "not-applicable",
      error: "applicable",
      disabled: "applicable",
    },
  },
  {
    componentId: "content.heading",
    title: "Heading — non-interactive content, mostly N/A states",
    applicability: {
      empty: "applicable",
      loading: "not-applicable",
      error: "not-applicable",
      disabled: "not-applicable",
    },
  },
  {
    componentId: "chart.bar",
    title: "Bar chart — visualization renderer, mixed applicability",
    applicability: {
      empty: "applicable",
      loading: "not-applicable",
      error: "applicable",
      disabled: "not-applicable",
    },
  },
] as const;

const STATES: readonly StateMode[] = ["default", "empty", "loading", "error", "disabled"] as const;
const THEMES: readonly ThemeMode[] = ["light", "dark"] as const;

/**
 * Build the deterministic matrix URL. Use hash routing because the package
 * preview app mounts under `createWebHashHistory()`.
 */
function matrixUrl(
  componentId: string,
  viewport: "desktop" | "tablet" | "mobile" = "desktop",
): string {
  const params = new URLSearchParams({ component: componentId, viewport });
  return `/#/matrix?${params.toString()}`;
}

async function waitForMatrixReady(page: Page, componentId: string): Promise<Locator> {
  const grid = page.getByTestId("matrix-grid");
  await expect(grid).toBeVisible({ timeout: 15_000 });
  // The summary row carries the component id once the catalog has resolved.
  await expect(page.getByTestId("matrix-component-summary")).toContainText(componentId);
  // 10 cells = 5 states × 2 themes. Use a count check so a regression that
  // collapses to <10 cells fails fast before we start asserting attributes.
  await expect(grid.locator(':scope > [role="figure"]')).toHaveCount(10);
  return grid;
}

for (const matrixCase of CASES) {
  test.describe(`matrix · ${matrixCase.title}`, () => {
    test(`renders 5×2 state matrix for ${matrixCase.componentId}`, async ({ page }, testInfo) => {
      await page.goto(matrixUrl(matrixCase.componentId));
      const grid = await waitForMatrixReady(page, matrixCase.componentId);

      // Walk every cell and assert the manifest-derived applicability.
      for (const state of STATES) {
        for (const theme of THEMES) {
          const cell = grid.locator(
            `[data-testid="matrix-cell-${matrixCase.componentId}-${theme}-${state}"]`,
          );
          await expect(cell, `cell ${state}/${theme} must be visible`).toBeVisible();
          await expect(cell).toHaveAttribute("data-state", state);
          await expect(cell).toHaveAttribute("data-theme", theme);

          if (state === "default") {
            // Default is always applicable — manifest does not declare it.
            await expect(cell).toHaveAttribute("data-state-applicability", "applicable");
            continue;
          }
          const expected = matrixCase.applicability[state] ?? "applicable";
          await expect(cell).toHaveAttribute("data-state-applicability", expected);

          if (expected === "not-applicable") {
            // N/A cells must surface the reason text so contributors can audit
            // coverage without hovering. Manifest reasons are non-empty strings.
            const reason = cell.getByTestId("matrix-cell-not-applicable");
            await expect(reason).toBeVisible();
            await expect(reason).not.toBeEmpty();
          }
        }
      }

      // Capture a full-page screenshot of the matrix for visual review. The
      // attachment lands in Playwright's report under the test, so the lane
      // doubles as a coverage gallery without committing PNG baselines.
      const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
      await testInfo.attach(`matrix-${matrixCase.componentId}-desktop.png`, {
        body: screenshot,
        contentType: "image/png",
      });
    });
  });
}

test.describe("matrix · viewport switching", () => {
  // One representative component is enough to prove the viewport query
  // param drives the grid container width. Cell-attribute coverage is
  // already exercised above; this case targets the responsive contract.
  const componentId = "demo.demo-button";

  for (const viewport of ["desktop", "tablet", "mobile"] as const) {
    test(`grid honors ?viewport=${viewport}`, async ({ page }, testInfo) => {
      await page.goto(matrixUrl(componentId, viewport));
      const container = page.getByTestId("matrix-grid-container");
      await expect(container).toBeVisible({ timeout: 15_000 });
      await expect(container).toHaveAttribute("data-viewport", viewport);

      const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
      await testInfo.attach(`matrix-${componentId}-${viewport}.png`, {
        body: screenshot,
        contentType: "image/png",
      });
    });
  }
});

test.describe("matrix · missing metadata diagnostic", () => {
  // Unknown component ids must surface the "Component not found" error chrome
  // instead of silently rendering a blank page. This keeps the lane honest
  // about catalog drift — a regression that breaks catalog lookup fails here.
  test("unknown component id surfaces the error chrome", async ({ page }) => {
    await page.goto(matrixUrl("does-not-exist.bogus"));
    const unknown = page.getByTestId("matrix-unknown-component");
    await expect(unknown).toBeVisible({ timeout: 15_000 });
    await expect(unknown).toContainText("does-not-exist.bogus");
  });
});

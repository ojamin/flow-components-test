// Mechanically enforces the state support policy subset documented in
// docs/component-contract.md: a renderable manifest may declare
// empty/error/loading as `true` only when the renderer sources show handling for
// that state or a fixture variant exercises it. Focus/keyboard/disabled/
// responsive remain policy/review-enforced until this checker expands. Existing
// debt is frozen in tooling/state-support-baseline.json, which may only shrink.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const CHECKED_STATES = ["empty", "error", "loading"] as const;

type CheckedState = (typeof CHECKED_STATES)[number];

const STATE_PROBES: Record<CheckedState, RegExp> = {
  empty: /empty|no data|nodata/i,
  error: /error|invalid|failed|unsafe/i,
  loading: /loading|busy|pending|skeleton/i,
};

// Renderer-adjacent sources that count as state handling implementation.
const RENDERER_SOURCE_PATTERNS = [
  /^Renderer\.vue$/,
  /^use.*\.ts$/,
  /renderer.*\.ts$/i,
  /^status\.ts$/,
];

type BaselineMap = Record<string, readonly string[]>;

export function collectStateSupportConformanceIssues(options: { packageRoot: string }): string[] {
  const issues: string[] = [];
  const groupsRoot = path.join(options.packageRoot, "src", "groups");
  const baselinePath = path.join(options.packageRoot, "tooling", "state-support-baseline.json");
  if (!existsSync(baselinePath)) {
    // Synthetic validation roots (unit-test fixtures) carry no baseline file;
    // conformance is only enforced for roots that opt in by shipping one.
    return issues;
  }
  const baseline: BaselineMap = JSON.parse(readFileSync(baselinePath, "utf8")) as BaselineMap;
  const seenBaselineHits = new Set<string>();

  for (const group of readdirSync(groupsRoot)) {
    const groupPath = path.join(groupsRoot, group);
    if (!statSync(groupPath).isDirectory()) continue;

    for (const component of readdirSync(groupPath)) {
      const componentPath = path.join(groupPath, component);
      if (!statSync(componentPath).isDirectory()) continue;
      const manifestPath = path.join(componentPath, "component.manifest.json");
      if (!existsSync(manifestPath)) continue;

      const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
        id: string;
        renderable?: boolean;
        fixtureVariants?: { id: string }[];
        stateSupport?: Record<string, unknown>;
      };
      if (!manifest.renderable || !manifest.stateSupport) continue;

      let rendererSource = "";
      for (const file of readdirSync(componentPath)) {
        if (RENDERER_SOURCE_PATTERNS.some((pattern) => pattern.test(file))) {
          try {
            rendererSource += readFileSync(path.join(componentPath, file), "utf8");
          } catch {
            // unreadable renderer source is reported by the base validator
          }
        }
      }
      const fixtureIds = (manifest.fixtureVariants ?? []).map((variant) =>
        String(variant.id).toLowerCase(),
      );

      for (const state of CHECKED_STATES) {
        if (manifest.stateSupport[state] !== true) continue;

        const implemented =
          STATE_PROBES[state].test(rendererSource) || fixtureIds.some((id) => id.includes(state));
        const baselined = baseline[manifest.id]?.includes(state) ?? false;

        if (implemented) {
          if (baselined) {
            issues.push(
              `${manifest.id} now implements stateSupport.${state}; remove it from tooling/state-support-baseline.json so the baseline keeps shrinking.`,
            );
          }
          continue;
        }

        if (baselined) {
          seenBaselineHits.add(`${manifest.id}:${state}`);
          continue;
        }

        issues.push(
          `${manifest.id} declares stateSupport.${state}: true but the renderer sources show no ${state} handling and no fixture variant exercises it. Implement the state, add a fixture variant, or declare { notApplicable } per docs/component-contract.md.`,
        );
      }
    }
  }

  for (const [componentId, states] of Object.entries(baseline)) {
    for (const state of states) {
      if (!seenBaselineHits.has(`${componentId}:${state}`)) {
        // Entry no longer matches a live violation (component removed,
        // state downgraded, or now implemented and reported above).
        if (
          !issues.some((issue) =>
            issue.startsWith(`${componentId} now implements stateSupport.${state}`),
          )
        ) {
          issues.push(
            `state-support baseline entry ${componentId}:${state} is stale; remove it from tooling/state-support-baseline.json.`,
          );
        }
      }
    }
  }

  return issues;
}

// Tests for ValidationStatusPane: covers status badge rendering for all three
// contract areas (contract / render / transform), the full author command list,
// clipboard copy behavior (success, absent API, rejected write), and "Copied"
// transient feedback label.

import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import ValidationStatusPane, {
  deriveTestStatus,
  type TestStatusKind,
} from "../ValidationStatusPane.vue";
import type { ComponentDefinition, ComponentManifestSummary } from "@flow-builder/components/sdk";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeDefinition(overrides: Partial<ComponentDefinition> = {}): ComponentDefinition {
  return {
    id: "test.component",
    version: 1,
    displayName: "Test Component",
    icon: "circle",
    category: "content",
    renderable: true,
    slots: [],
    configSchema: z.object({}),
    configDefaults: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [],
    ...overrides,
  } as ComponentDefinition;
}

function makeManifestEntry(
  overrides: Partial<ComponentManifestSummary> = {},
): ComponentManifestSummary {
  return {
    id: "test.component",
    displayName: "Test Component",
    group: "content",
    source: "static",
    sourceId: "flow-components-test",
    version: "1.0.0",
    renderable: true,
    tags: [],
    sourcePath: "src/groups/content/test/component.ts",
    contentHash: "sha256:" + "a".repeat(64),
    ...overrides,
  };
}

// Stub navigator.clipboard to prevent jsdom clipboard access failures.
const clipboardWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: clipboardWriteText },
    writable: true,
    configurable: true,
  });
  clipboardWriteText.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── deriveTestStatus (pure function) ─────────────────────────────────────────

describe("deriveTestStatus", () => {
  test("contract pass when manifestEntry is present", () => {
    const status = deriveTestStatus(makeDefinition(), makeManifestEntry());
    expect(status.contract).toBe<TestStatusKind>("pass");
  });

  test("contract fail when manifestEntry is absent", () => {
    const status = deriveTestStatus(makeDefinition(), undefined);
    expect(status.contract).toBe<TestStatusKind>("fail");
  });

  test("render pass when renderable and renderer is set", () => {
    const def = makeDefinition({
      renderable: true,
      renderer: () => Promise.resolve({}),
    });
    expect(deriveTestStatus(def, undefined).render).toBe<TestStatusKind>("pass");
  });

  test("render fail when renderable but renderer is absent", () => {
    const def = makeDefinition({ renderable: true, renderer: undefined });
    expect(deriveTestStatus(def, undefined).render).toBe<TestStatusKind>("fail");
  });

  test("render pass when renderable:false but renderer is present (diagnostic renderer)", () => {
    // Mirrors packages/components/src/groups/data/http-request/component.ts:
    // renderable:false + renderer defined → should be Pass, not Unknown.
    const def = makeDefinition({ renderable: false, renderer: () => Promise.resolve({}) });
    expect(deriveTestStatus(def, undefined).render).toBe<TestStatusKind>("pass");
  });

  test("render unknown when component is not renderable and renderer is absent", () => {
    const def = makeDefinition({ renderable: false, renderer: undefined });
    expect(deriveTestStatus(def, undefined).render).toBe<TestStatusKind>("unknown");
  });

  test("transform pass when transform module is set", () => {
    const def = makeDefinition({ transform: () => Promise.resolve({}) });
    expect(deriveTestStatus(def, undefined).transform).toBe<TestStatusKind>("pass");
  });

  test("transform unknown when transform is absent", () => {
    const def = makeDefinition({ transform: undefined });
    expect(deriveTestStatus(def, undefined).transform).toBe<TestStatusKind>("unknown");
  });
});

// ── Component rendering ───────────────────────────────────────────────────────

describe("ValidationStatusPane", () => {
  // ── Section presence ──────────────────────────────────────────────────────

  test("renders validation-status-pane section", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    expect(wrapper.find('[data-testid="validation-status-pane"]').exists()).toBe(true);
  });

  test("renders author-commands-pane section", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: undefined },
    });
    expect(wrapper.find('[data-testid="author-commands-pane"]').exists()).toBe(true);
  });

  // ── Honest heading and help text ─────────────────────────────────────────

  test("heading says 'Validation readiness', not 'Test status'", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    const pane = wrapper.find('[data-testid="validation-status-pane"]');
    expect(pane.text()).toContain("Validation readiness");
    expect(pane.text()).not.toContain("Test status");
  });

  test("renders help text clarifying statuses are derived, not executed", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    expect(wrapper.find('[data-testid="status-help-text"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="status-help-text"]').text()).toContain("manifest");
  });

  // ── Row labels are explicit about what is being checked ──────────────────

  test("contract row label says 'Contract manifest'", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    expect(wrapper.find('[data-testid="status-row-contract"]').text()).toContain(
      "Contract manifest",
    );
  });

  test("render row label says 'Renderer module'", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    expect(wrapper.find('[data-testid="status-row-render"]').text()).toContain("Renderer module");
  });

  test("transform row label says 'Transform module'", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    expect(wrapper.find('[data-testid="status-row-transform"]').text()).toContain(
      "Transform module",
    );
  });

  // ── Status rows ───────────────────────────────────────────────────────────

  test("shows Pass badge for contract when manifest entry is present", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    expect(wrapper.find('[data-testid="status-badge-contract"]').text()).toBe("Pass");
  });

  test("shows Fail badge for contract when manifest entry is absent", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: undefined },
    });
    expect(wrapper.find('[data-testid="status-badge-contract"]').text()).toBe("Fail");
  });

  test("shows Pass badge for render when renderable and renderer present", () => {
    const def = makeDefinition({ renderable: true, renderer: () => Promise.resolve({}) });
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: def, manifestEntry: undefined },
    });
    expect(wrapper.find('[data-testid="status-badge-render"]').text()).toBe("Pass");
  });

  test("shows Fail badge for render when renderable but renderer absent", () => {
    const def = makeDefinition({ renderable: true, renderer: undefined });
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: def, manifestEntry: undefined },
    });
    expect(wrapper.find('[data-testid="status-badge-render"]').text()).toBe("Fail");
  });

  test("shows Unknown badge for render when not renderable and renderer absent", () => {
    const def = makeDefinition({ renderable: false });
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: def, manifestEntry: undefined },
    });
    expect(wrapper.find('[data-testid="status-badge-render"]').text()).toBe("Unknown");
  });

  test("shows Pass badge for render when renderable:false but renderer present", () => {
    const def = makeDefinition({ renderable: false, renderer: () => Promise.resolve({}) });
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: def, manifestEntry: undefined },
    });
    expect(wrapper.find('[data-testid="status-badge-render"]').text()).toBe("Pass");
  });

  test("shows Pass badge for transform when transform module is set", () => {
    const def = makeDefinition({ transform: () => Promise.resolve({}) });
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: def, manifestEntry: undefined },
    });
    expect(wrapper.find('[data-testid="status-badge-transform"]').text()).toBe("Pass");
  });

  test("shows Unknown badge for transform when transform is absent", () => {
    const def = makeDefinition({ transform: undefined });
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: def, manifestEntry: undefined },
    });
    expect(wrapper.find('[data-testid="status-badge-transform"]').text()).toBe("Unknown");
  });

  // ── Status rows exist ─────────────────────────────────────────────────────

  test("renders all three status rows", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    expect(wrapper.find('[data-testid="status-row-contract"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="status-row-render"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="status-row-transform"]').exists()).toBe(true);
  });

  // ── Author command list ───────────────────────────────────────────────────

  const EXPECTED_COMMANDS = [
    {
      label: "scaffold",
      text: 'npm run scaffold --workspace @flow-builder/components -- --group content --folder promo-banner --id content.promo-banner --display-name "Promo Banner"',
    },
    { label: "generate", text: "npm run generate --workspace @flow-builder/components" },
    { label: "validate", text: "npm run validate --workspace @flow-builder/components" },
    {
      label: "test:components",
      text: "npm run test:components --workspace @flow-builder/components",
    },
    { label: "check", text: "npm run check --workspace @flow-builder/components" },
    { label: "preview:dev", text: "npm run preview:dev --workspace @flow-builder/components" },
    { label: "preview:build", text: "npm run preview:build --workspace @flow-builder/components" },
  ];

  test("renders exactly 7 command items", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: undefined },
    });
    const items = wrapper.findAll('[data-testid^="command-item-"]');
    expect(items).toHaveLength(7);
  });

  test.each(EXPECTED_COMMANDS)(
    "command item '$label' shows exact command text",
    ({ label, text }) => {
      const wrapper = mount(ValidationStatusPane, {
        props: { definition: makeDefinition(), manifestEntry: undefined },
      });
      const el = wrapper.find(`[data-testid="command-text-${label}"]`);
      expect(el.exists()).toBe(true);
      expect(el.text()).toBe(text);
    },
  );

  test.each(EXPECTED_COMMANDS)("command item '$label' has a copy button", ({ label }) => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: undefined },
    });
    expect(wrapper.find(`[data-testid="command-copy-${label}"]`).exists()).toBe(true);
  });

  // ── Clipboard copy ────────────────────────────────────────────────────────

  test("clicking copy scaffold calls clipboard.writeText with exact command", async () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: undefined },
    });
    await wrapper.find('[data-testid="command-copy-scaffold"]').trigger("click");
    expect(clipboardWriteText).toHaveBeenCalledWith(
      'npm run scaffold --workspace @flow-builder/components -- --group content --folder promo-banner --id content.promo-banner --display-name "Promo Banner"',
    );
  });

  test("copy button shows 'Copied' after click then reverts after timeout", async () => {
    vi.useFakeTimers();
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: undefined },
    });
    const copyBtn = wrapper.find('[data-testid="command-copy-scaffold"]');
    expect(copyBtn.text()).toBe("Copy");

    await copyBtn.trigger("click");
    // Flush the resolved clipboard promise.
    await Promise.resolve();
    await wrapper.vm.$nextTick();
    expect(copyBtn.text()).toBe("Copied");

    vi.advanceTimersByTime(1500);
    await wrapper.vm.$nextTick();
    expect(copyBtn.text()).toBe("Copy");

    vi.useRealTimers();
  });

  test("copy does not throw when navigator.clipboard is absent", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: undefined },
    });
    const copyBtn = wrapper.find('[data-testid="command-copy-generate"]');
    expect(copyBtn.exists()).toBe(true);
    await expect(copyBtn.trigger("click")).resolves.not.toThrow();
    expect(clipboardWriteText).not.toHaveBeenCalled();
  });

  test("copy does not throw when clipboard.writeText rejects", async () => {
    clipboardWriteText.mockRejectedValueOnce(new Error("NotAllowedError"));
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: undefined },
    });
    const copyBtn = wrapper.find('[data-testid="command-copy-validate"]');
    await expect(copyBtn.trigger("click")).resolves.not.toThrow();
    // Allow the rejected promise to be consumed by .catch(() => {}).
    await Promise.resolve();
    expect(clipboardWriteText).toHaveBeenCalledOnce();
  });

  // ── Manifest drift section ────────────────────────────────────────────────
  // Drives the real findManifestDrift validator through prop combinations to
  // prove the preview-app surface mirrors `npm run validate` drift output.

  describe("manifest drift section", () => {
    test("renders the manifest-drift pane and its help text", () => {
      const wrapper = mount(ValidationStatusPane, {
        props: {
          definition: makeDefinition(),
          manifestEntry: makeManifestEntry(),
          folderGroup: "content",
        },
      });
      expect(wrapper.find('[data-testid="manifest-drift-pane"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="manifest-drift-help-text"]').text()).toContain("validate");
    });

    test("shows skipped state when manifestEntry is absent", () => {
      const wrapper = mount(ValidationStatusPane, {
        props: { definition: makeDefinition(), manifestEntry: undefined, folderGroup: "content" },
      });
      expect(wrapper.find('[data-testid="manifest-drift-skipped"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="manifest-drift-healthy"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="manifest-drift-issues"]').exists()).toBe(false);
    });

    test("shows skipped state when folderGroup is absent", () => {
      const wrapper = mount(ValidationStatusPane, {
        props: {
          definition: makeDefinition(),
          manifestEntry: makeManifestEntry(),
          folderGroup: undefined,
        },
      });
      expect(wrapper.find('[data-testid="manifest-drift-skipped"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="manifest-drift-healthy"]').exists()).toBe(false);
    });

    test("shows healthy state when definition, manifest summary, and folder group all agree", () => {
      const wrapper = mount(ValidationStatusPane, {
        props: {
          definition: makeDefinition(),
          manifestEntry: makeManifestEntry(),
          folderGroup: "content",
        },
      });
      expect(wrapper.find('[data-testid="manifest-drift-healthy"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="manifest-drift-issues"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="manifest-drift-skipped"]').exists()).toBe(false);
    });

    test("surfaces a displayName drift issue with field name and message", () => {
      const wrapper = mount(ValidationStatusPane, {
        props: {
          definition: makeDefinition({ displayName: "Other Component" }),
          manifestEntry: makeManifestEntry({ displayName: "Test Component" }),
          folderGroup: "content",
        },
      });
      const issue = wrapper.find('[data-testid="manifest-drift-issue-displayName"]');
      expect(issue.exists()).toBe(true);
      expect(issue.text()).toContain("displayName");
      expect(issue.text()).toContain("Test Component");
      expect(issue.text()).toContain("Other Component");
    });

    test("surfaces a major version drift issue when definition.version disagrees", () => {
      const wrapper = mount(ValidationStatusPane, {
        props: {
          definition: makeDefinition({ version: 2 }),
          manifestEntry: makeManifestEntry({ version: "1.0.0" }),
          folderGroup: "content",
        },
      });
      const issue = wrapper.find('[data-testid="manifest-drift-issue-version"]');
      expect(issue.exists()).toBe(true);
      expect(issue.text()).toContain("Major version disagrees");
    });

    test("surfaces a manifest-group vs folder-group drift issue", () => {
      const wrapper = mount(ValidationStatusPane, {
        props: {
          definition: makeDefinition(),
          manifestEntry: makeManifestEntry({ group: "layout" }),
          folderGroup: "content",
        },
      });
      const issue = wrapper.find('[data-testid="manifest-drift-issue-group"]');
      expect(issue.exists()).toBe(true);
      expect(issue.text()).toContain("must match folder group");
    });

    test("surfaces a category drift issue when definition.category disagrees with folder-group mapping", () => {
      const wrapper = mount(ValidationStatusPane, {
        props: {
          definition: makeDefinition({ category: "media" }),
          manifestEntry: makeManifestEntry(),
          folderGroup: "content",
        },
      });
      const issue = wrapper.find('[data-testid="manifest-drift-issue-category"]');
      expect(issue.exists()).toBe(true);
      expect(issue.text()).toContain("category");
    });

    test("renders multiple drift issues when several fields disagree", () => {
      const wrapper = mount(ValidationStatusPane, {
        props: {
          definition: makeDefinition({ id: "content.other", displayName: "Other" }),
          manifestEntry: makeManifestEntry({ id: "content.other-mismatch" }),
          folderGroup: "content",
        },
      });
      const issues = wrapper.findAll('[data-testid^="manifest-drift-issue-"]');
      expect(issues.length).toBeGreaterThanOrEqual(2);
    });

    test("each rendered drift issue uses destructive emphasis (text-destructive)", () => {
      const wrapper = mount(ValidationStatusPane, {
        props: {
          definition: makeDefinition({ displayName: "Other" }),
          manifestEntry: makeManifestEntry(),
          folderGroup: "content",
        },
      });
      const issue = wrapper.find('[data-testid="manifest-drift-issue-displayName"]');
      expect(issue.classes()).toContain("text-destructive");
    });
  });
});

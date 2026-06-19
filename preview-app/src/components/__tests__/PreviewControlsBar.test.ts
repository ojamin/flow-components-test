/**
 * Unit tests for PreviewControlsBar.
 *
 * Covers: all four groups render, aria-pressed reflects current prop value,
 * clicking buttons emits the correct typed values.
 */
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import PreviewControlsBar from "../PreviewControlsBar.vue";
import type {
  PreviewTheme,
  DeviceMode,
  ViewportPreset,
  StateMode,
} from "../PreviewControlsBar.vue";
import type { FixtureVariantMeta, StateSupportMeta } from "@flow-builder/components/sdk";

// ── Helpers ───────────────────────────────────────────────────────────────────

function mountBar(
  overrides: Partial<{
    theme: PreviewTheme;
    device: DeviceMode;
    viewport: ViewportPreset;
    stateMode: StateMode;
    canReset: boolean;
    canReplay: boolean;
    fixtureVariants: readonly FixtureVariantMeta[];
    fixtureVariantId: string;
    stateSupport: StateSupportMeta;
  }> = {},
) {
  return mount(PreviewControlsBar, {
    props: {
      theme: "system" as PreviewTheme,
      device: "responsive" as DeviceMode,
      viewport: "desktop" as ViewportPreset,
      stateMode: "default" as StateMode,
      canReset: false,
      canReplay: false,
      ...overrides,
    },
  });
}

/** State group button lookup by visible label. */
function stateButton(wrapper: ReturnType<typeof mountBar>, label: string) {
  return wrapper
    .find('[aria-label="State"]')
    .findAll("button")
    .find((b) => b.text().startsWith(label));
}

/** Find all buttons in a named group. */
function groupButtons(wrapper: ReturnType<typeof mountBar>, groupLabel: string) {
  return wrapper.find(`[aria-label="${groupLabel}"]`).findAll("button");
}

/** Find a button by visible text within a named group. */
function groupButton(wrapper: ReturnType<typeof mountBar>, groupLabel: string, text: string) {
  return groupButtons(wrapper, groupLabel).find((b) => b.text() === text);
}

// ── Render groups ─────────────────────────────────────────────────────────────

describe("PreviewControlsBar — renders groups", () => {
  test("toolbar element has role=toolbar and correct aria-label", () => {
    const w = mountBar();
    const toolbar = w.find('[role="toolbar"]');
    expect(toolbar.exists()).toBe(true);
    expect(toolbar.attributes("aria-label")).toBe("Preview controls");
  });

  test("Theme group renders three buttons: System, Light, Dark", () => {
    const w = mountBar();
    const texts = groupButtons(w, "Theme").map((b) => b.text());
    expect(texts).toEqual(["System", "Light", "Dark"]);
  });

  test("Device group renders three buttons: Responsive, Phone, Tablet", () => {
    const w = mountBar();
    const texts = groupButtons(w, "Device").map((b) => b.text());
    expect(texts).toEqual(["Responsive", "Phone", "Tablet"]);
  });

  test("Viewport group renders three buttons: Desktop, Tablet, Mobile", () => {
    const w = mountBar();
    const texts = groupButtons(w, "Viewport").map((b) => b.text());
    expect(texts).toEqual(["Desktop", "Tablet", "Mobile"]);
  });

  test("State group renders five buttons: Default, Empty, Loading, Error, Disabled", () => {
    const w = mountBar();
    const texts = groupButtons(w, "State").map((b) => b.text());
    expect(texts).toEqual(["Default", "Empty", "Loading", "Error", "Disabled"]);
  });

  test("all buttons have type=button", () => {
    const w = mountBar();
    const allButtons = w.findAll("button");
    // Theme(3) + Device(3) + Viewport(3) + State(5) + Actions(2) = 16
    expect(allButtons.length).toBe(16);
    for (const btn of allButtons) {
      expect(btn.attributes("type")).toBe("button");
    }
  });

  test("Actions group renders Reset bind state and Replay last event buttons", () => {
    const w = mountBar();
    const texts = groupButtons(w, "Actions").map((b) => b.text());
    expect(texts).toEqual(["Reset bind state", "Replay last event"]);
  });
});

// ── aria-pressed reflects current prop value ──────────────────────────────────

describe("PreviewControlsBar — aria-pressed reflects current value", () => {
  test("System theme button is aria-pressed=true when theme=system", () => {
    const w = mountBar({ theme: "system" });
    expect(groupButton(w, "Theme", "System")?.attributes("aria-pressed")).toBe("true");
    expect(groupButton(w, "Theme", "Light")?.attributes("aria-pressed")).toBe("false");
    expect(groupButton(w, "Theme", "Dark")?.attributes("aria-pressed")).toBe("false");
  });

  test("Dark theme button is aria-pressed=true when theme=dark", () => {
    const w = mountBar({ theme: "dark" });
    expect(groupButton(w, "Theme", "Dark")?.attributes("aria-pressed")).toBe("true");
    expect(groupButton(w, "Theme", "System")?.attributes("aria-pressed")).toBe("false");
  });

  test("Light theme button is aria-pressed=true when theme=light", () => {
    const w = mountBar({ theme: "light" });
    expect(groupButton(w, "Theme", "Light")?.attributes("aria-pressed")).toBe("true");
  });

  test("Responsive device button is aria-pressed=true when device=responsive", () => {
    const w = mountBar({ device: "responsive" });
    expect(groupButton(w, "Device", "Responsive")?.attributes("aria-pressed")).toBe("true");
    expect(groupButton(w, "Device", "Phone")?.attributes("aria-pressed")).toBe("false");
    expect(groupButton(w, "Device", "Tablet")?.attributes("aria-pressed")).toBe("false");
  });

  test("Phone device button is aria-pressed=true when device=phone", () => {
    const w = mountBar({ device: "phone" });
    expect(groupButton(w, "Device", "Phone")?.attributes("aria-pressed")).toBe("true");
    expect(groupButton(w, "Device", "Responsive")?.attributes("aria-pressed")).toBe("false");
  });

  test("Tablet device button is aria-pressed=true when device=tablet", () => {
    const w = mountBar({ device: "tablet" });
    expect(groupButton(w, "Device", "Tablet")?.attributes("aria-pressed")).toBe("true");
  });

  test("Tablet viewport button is aria-pressed=true when viewport=tablet", () => {
    const w = mountBar({ viewport: "tablet" });
    expect(groupButton(w, "Viewport", "Tablet")?.attributes("aria-pressed")).toBe("true");
    expect(groupButton(w, "Viewport", "Desktop")?.attributes("aria-pressed")).toBe("false");
    expect(groupButton(w, "Viewport", "Mobile")?.attributes("aria-pressed")).toBe("false");
  });

  test("Mobile viewport button is aria-pressed=true when viewport=mobile", () => {
    const w = mountBar({ viewport: "mobile" });
    expect(groupButton(w, "Viewport", "Mobile")?.attributes("aria-pressed")).toBe("true");
  });

  test("Empty state button is aria-pressed=true when stateMode=empty", () => {
    const w = mountBar({ stateMode: "empty" });
    expect(groupButton(w, "State", "Empty")?.attributes("aria-pressed")).toBe("true");
    expect(groupButton(w, "State", "Default")?.attributes("aria-pressed")).toBe("false");
  });

  test("Disabled state button is aria-pressed=true when stateMode=disabled", () => {
    const w = mountBar({ stateMode: "disabled" });
    expect(groupButton(w, "State", "Disabled")?.attributes("aria-pressed")).toBe("true");
  });
});

// ── Emits on button click ─────────────────────────────────────────────────────

describe("PreviewControlsBar — emits correct values on click", () => {
  test("clicking Dark emits update:theme with 'dark'", async () => {
    const w = mountBar({ theme: "system" });
    await groupButton(w, "Theme", "Dark")!.trigger("click");
    expect(w.emitted("update:theme")).toEqual([["dark"]]);
  });

  test("clicking Light emits update:theme with 'light'", async () => {
    const w = mountBar({ theme: "dark" });
    await groupButton(w, "Theme", "Light")!.trigger("click");
    expect(w.emitted("update:theme")).toEqual([["light"]]);
  });

  test("clicking System emits update:theme with 'system'", async () => {
    const w = mountBar({ theme: "dark" });
    await groupButton(w, "Theme", "System")!.trigger("click");
    expect(w.emitted("update:theme")).toEqual([["system"]]);
  });

  test("clicking Phone emits update:device with 'phone'", async () => {
    const w = mountBar({ device: "responsive" });
    await groupButton(w, "Device", "Phone")!.trigger("click");
    expect(w.emitted("update:device")).toEqual([["phone"]]);
  });

  test("clicking Tablet (device) emits update:device with 'tablet'", async () => {
    const w = mountBar({ device: "responsive" });
    await groupButton(w, "Device", "Tablet")!.trigger("click");
    expect(w.emitted("update:device")).toEqual([["tablet"]]);
  });

  test("clicking Responsive emits update:device with 'responsive'", async () => {
    const w = mountBar({ device: "phone" });
    await groupButton(w, "Device", "Responsive")!.trigger("click");
    expect(w.emitted("update:device")).toEqual([["responsive"]]);
  });

  test("clicking Mobile emits update:viewport with 'mobile'", async () => {
    const w = mountBar({ viewport: "desktop" });
    await groupButton(w, "Viewport", "Mobile")!.trigger("click");
    expect(w.emitted("update:viewport")).toEqual([["mobile"]]);
  });

  test("clicking Tablet (viewport) emits update:viewport with 'tablet'", async () => {
    const w = mountBar({ viewport: "desktop" });
    await groupButton(w, "Viewport", "Tablet")!.trigger("click");
    expect(w.emitted("update:viewport")).toEqual([["tablet"]]);
  });

  test("clicking Desktop emits update:viewport with 'desktop'", async () => {
    const w = mountBar({ viewport: "mobile" });
    await groupButton(w, "Viewport", "Desktop")!.trigger("click");
    expect(w.emitted("update:viewport")).toEqual([["desktop"]]);
  });

  test("clicking Empty emits update:stateMode with 'empty'", async () => {
    const w = mountBar({ stateMode: "default" });
    await groupButton(w, "State", "Empty")!.trigger("click");
    expect(w.emitted("update:stateMode")).toEqual([["empty"]]);
  });

  test("clicking Error emits update:stateMode with 'error'", async () => {
    const w = mountBar({ stateMode: "default" });
    await groupButton(w, "State", "Error")!.trigger("click");
    expect(w.emitted("update:stateMode")).toEqual([["error"]]);
  });

  test("clicking Loading emits update:stateMode with 'loading'", async () => {
    const w = mountBar({ stateMode: "default" });
    await groupButton(w, "State", "Loading")!.trigger("click");
    expect(w.emitted("update:stateMode")).toEqual([["loading"]]);
  });

  test("clicking Disabled emits update:stateMode with 'disabled'", async () => {
    const w = mountBar({ stateMode: "default" });
    await groupButton(w, "State", "Disabled")!.trigger("click");
    expect(w.emitted("update:stateMode")).toEqual([["disabled"]]);
  });

  test("clicking Default emits update:stateMode with 'default'", async () => {
    const w = mountBar({ stateMode: "error" });
    await groupButton(w, "State", "Default")!.trigger("click");
    expect(w.emitted("update:stateMode")).toEqual([["default"]]);
  });
});

// ── Action buttons render with strong affordance (visual review remediation) ─
// Reset and Replay now use the shadcn-vue Button with variant="outline" so they
// keep visible chrome — including the disabled state — instead of fading into
// the adjacent toggle-button text. These tests pin that contract so the
// affordance can't quietly regress to the previous text-link styling.

describe("PreviewControlsBar — Action button affordance", () => {
  test("Reset button renders as a shadcn-vue button with outline variant", () => {
    const w = mountBar({ canReset: true });
    const btn = w.find('[data-testid="preview-controls-reset"]');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("data-slot")).toBe("button");
    expect(btn.attributes("data-variant")).toBe("outline");
  });

  test("Replay button renders as a shadcn-vue button with outline variant", () => {
    const w = mountBar({ canReplay: true });
    const btn = w.find('[data-testid="preview-controls-replay"]');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("data-slot")).toBe("button");
    expect(btn.attributes("data-variant")).toBe("outline");
  });

  test("Reset and Replay share variant + size so visual weight stays consistent", () => {
    const w = mountBar({ canReset: true, canReplay: true });
    const reset = w.find('[data-testid="preview-controls-reset"]');
    const replay = w.find('[data-testid="preview-controls-replay"]');
    expect(reset.attributes("data-variant")).toBe(replay.attributes("data-variant"));
    expect(reset.attributes("data-size")).toBe(replay.attributes("data-size"));
  });

  test("Replay button stays mounted with disabled chrome before any event", () => {
    // Visual review found Replay was nearly invisible before an event was captured.
    // The disabled outline button must still render so the action is discoverable.
    const w = mountBar({ canReplay: false });
    const btn = w.find('[data-testid="preview-controls-replay"]');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("data-variant")).toBe("outline");
    expect(btn.attributes("disabled")).toBeDefined();
    expect(btn.attributes("aria-disabled")).toBe("true");
  });

  test("each action button contains a leading icon", () => {
    const w = mountBar({ canReset: true, canReplay: true });
    expect(w.find('[data-testid="preview-controls-reset"] svg').exists()).toBe(true);
    expect(w.find('[data-testid="preview-controls-replay"] svg').exists()).toBe(true);
  });
});

// ── Reset bind state action (Task 50.6) ───────────────────────────────────────

describe("PreviewControlsBar — Reset bind state action", () => {
  test("Reset button is disabled when canReset=false", () => {
    const w = mountBar({ canReset: false });
    const btn = w.find('[data-testid="preview-controls-reset"]');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("disabled")).toBeDefined();
    expect(btn.attributes("aria-disabled")).toBe("true");
  });

  test("Reset button is enabled when canReset=true", () => {
    const w = mountBar({ canReset: true });
    const btn = w.find('[data-testid="preview-controls-reset"]');
    expect(btn.attributes("disabled")).toBeUndefined();
    expect(btn.attributes("aria-disabled")).toBe("false");
  });

  test("clicking enabled Reset emits reset-param-values once", async () => {
    const w = mountBar({ canReset: true });
    await w.find('[data-testid="preview-controls-reset"]').trigger("click");
    expect(w.emitted("reset-param-values")).toEqual([[]]);
  });

  test("clicking disabled Reset does not emit reset-param-values", async () => {
    const w = mountBar({ canReset: false });
    await w.find('[data-testid="preview-controls-reset"]').trigger("click");
    expect(w.emitted("reset-param-values")).toBeUndefined();
  });
});

// ── Replay last event action (Task 50.6) ──────────────────────────────────────

describe("PreviewControlsBar — Replay last event action", () => {
  test("Replay button is disabled when canReplay=false", () => {
    const w = mountBar({ canReplay: false });
    const btn = w.find('[data-testid="preview-controls-replay"]');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("disabled")).toBeDefined();
    expect(btn.attributes("aria-disabled")).toBe("true");
  });

  test("Replay button is enabled when canReplay=true", () => {
    const w = mountBar({ canReplay: true });
    const btn = w.find('[data-testid="preview-controls-replay"]');
    expect(btn.attributes("disabled")).toBeUndefined();
    expect(btn.attributes("aria-disabled")).toBe("false");
  });

  test("clicking enabled Replay emits replay-last-event once", async () => {
    const w = mountBar({ canReplay: true });
    await w.find('[data-testid="preview-controls-replay"]').trigger("click");
    expect(w.emitted("replay-last-event")).toEqual([[]]);
  });

  test("clicking disabled Replay does not emit replay-last-event", async () => {
    const w = mountBar({ canReplay: false });
    await w.find('[data-testid="preview-controls-replay"]').trigger("click");
    expect(w.emitted("replay-last-event")).toBeUndefined();
  });
});

// ── Fixture variant selector (Task 4.3) ───────────────────────────────────────
// The selector surfaces definition.fixtureVariants metadata as an explicit
// picker. It stays hidden when the definition declares 0 or 1 variants so the
// toolbar isn't padded with a redundant single-option dropdown.

describe("PreviewControlsBar — fixture variant selector", () => {
  test("selector is hidden when fixtureVariants is undefined", () => {
    const w = mountBar();
    expect(w.find('[aria-label="Fixture variant"]').exists()).toBe(false);
    expect(w.find('[data-testid="preview-controls-fixture-variant"]').exists()).toBe(false);
  });

  test("selector is hidden when fixtureVariants has a single entry", () => {
    const w = mountBar({
      fixtureVariants: [{ id: "default", label: "Default sample" }],
    });
    expect(w.find('[aria-label="Fixture variant"]').exists()).toBe(false);
  });

  test("selector renders when fixtureVariants has 2+ entries", () => {
    const w = mountBar({
      fixtureVariants: [
        { id: "default", label: "Default sample" },
        { id: "empty", label: "Empty state" },
      ],
    });
    expect(w.find('[aria-label="Fixture variant"]').exists()).toBe(true);
    expect(w.find('[data-testid="preview-controls-fixture-variant"]').exists()).toBe(true);
  });

  test("selector trigger surface is keyboard-reachable with an accessible label", () => {
    const w = mountBar({
      fixtureVariants: [
        { id: "default", label: "Default sample" },
        { id: "empty", label: "Empty state" },
      ],
    });
    const trigger = w.find('[data-testid="preview-controls-fixture-variant"]');
    expect(trigger.exists()).toBe(true);
    // The Select trigger renders as a button; the visible <label> targets the
    // trigger's id so screen readers announce "Fixture variant".
    expect(trigger.attributes("id")).toBe("preview-controls-fixture-variant");
    const label = w.find('label[for="preview-controls-fixture-variant"]');
    expect(label.exists()).toBe(true);
  });
});

// ── State support N/A metadata (Task 4.3) ─────────────────────────────────────
// When a definition declares `stateSupport[mode] = { notApplicable: reason }`,
// the matching button stays clickable but renders dimmed with an "N/A" badge
// and exposes the reason through `title` + `aria-description`.

describe("PreviewControlsBar — state support N/A metadata", () => {
  const baseSupport: StateSupportMeta = {
    empty: true,
    loading: { notApplicable: "No async path in this renderer." },
    error: true,
    disabled: { notApplicable: "No interactive surface to disable." },
    focus: true,
    keyboard: true,
    responsive: true,
  };

  test("buttons fall back to applicable when stateSupport is undefined", () => {
    const w = mountBar();
    const loading = stateButton(w, "Loading");
    expect(loading?.attributes("data-state-applicability")).toBe("applicable");
    expect(loading?.attributes("title")).toBeUndefined();
    expect(loading?.attributes("aria-describedby")).toBeUndefined();
    // Hidden N/A reason text is not emitted for applicable modes.
    expect(w.find("#preview-controls-state-loading-na-reason").exists()).toBe(false);
    // N/A badge is absent when applicable.
    expect(loading?.text()).toBe("Loading");
  });

  test("N/A modes render an N/A badge and applicable modes do not", () => {
    const w = mountBar({ stateSupport: baseSupport });
    expect(stateButton(w, "Loading")?.text()).toContain("N/A");
    expect(stateButton(w, "Disabled")?.text()).toContain("N/A");
    expect(stateButton(w, "Empty")?.text()).not.toContain("N/A");
    expect(stateButton(w, "Error")?.text()).not.toContain("N/A");
  });

  test("N/A buttons expose the reason via title + aria-describedby + sr-only text", () => {
    const w = mountBar({ stateSupport: baseSupport });
    const loading = stateButton(w, "Loading");
    expect(loading?.attributes("data-state-applicability")).toBe("not-applicable");
    expect(loading?.attributes("title")).toBe("No async path in this renderer.");

    // aria-describedby points to a hidden sr-only element that carries the
    // reason text — broader screen-reader support than aria-description.
    const describedById = loading?.attributes("aria-describedby");
    expect(describedById).toBe("preview-controls-state-loading-na-reason");

    const reason = w.find(`#${describedById}`);
    expect(reason.exists()).toBe(true);
    expect(reason.classes()).toContain("sr-only");
    expect(reason.text()).toBe("No async path in this renderer.");
  });

  test("each N/A button is paired with its own hidden reason element", () => {
    // Loading and Disabled are N/A in baseSupport with distinct reasons; the
    // hidden description ids must stay unique so AT can resolve each one.
    const w = mountBar({ stateSupport: baseSupport });
    const loadingReason = w.find("#preview-controls-state-loading-na-reason");
    const disabledReason = w.find("#preview-controls-state-disabled-na-reason");
    expect(loadingReason.exists()).toBe(true);
    expect(disabledReason.exists()).toBe(true);
    expect(loadingReason.text()).toBe("No async path in this renderer.");
    expect(disabledReason.text()).toBe("No interactive surface to disable.");

    // Applicable modes do not emit a hidden reason element.
    expect(w.find("#preview-controls-state-empty-na-reason").exists()).toBe(false);
    expect(w.find("#preview-controls-state-error-na-reason").exists()).toBe(false);
  });

  test("N/A buttons keep their dimmed visual treatment", () => {
    const w = mountBar({ stateSupport: baseSupport });
    expect(stateButton(w, "Loading")?.classes()).toContain("opacity-60");
    expect(stateButton(w, "Empty")?.classes()).not.toContain("opacity-60");
  });

  test("clicking an N/A button still emits update:stateMode so manual inspection works", async () => {
    const w = mountBar({ stateSupport: baseSupport });
    await stateButton(w, "Loading")!.trigger("click");
    expect(w.emitted("update:stateMode")).toEqual([["loading"]]);
  });
});

// Coverage for the shared SchemaForm theme-role/property selector (Task 6.7).
//
// The control is the canonical replacement for raw color/font escape hatches
// outside the Theme component. These tests prove:
//   * empty stored value = inherited/default state with the inherit option
//   * disabled descriptor flag forwards to the trigger
//   * unknown saved values surface as `aria-invalid` + inline alert
//   * required mode (`allowUnset: false`) shows alert on the empty value
//   * group / allowedKeys narrow the legal value set (off-set values are
//     reported as unknown so users see the drift instead of a silent reset)
//   * supplying themeContext renders swatch utility classes; omitting it
//     drops swatch markup so the panel never paints transparent boxes
//   * the helper preserves descriptor metadata without leaking raw colors
//   * keyboard contract: trigger is natively focusable (button[role=combobox]),
//     Enter/Space/ArrowDown open the dropdown (aria-expanded→true, data-state→open),
//     and keyboard focus moves to the first list option so arrow navigation works
//
// Selecting an option goes through the Select root component (`vm.$emit`)
// since reka-ui portals `SelectContent` only after the dropdown opens, which
// JSDOM cannot fully exercise without focus simulation. Asserting the
// trigger-side state plus the underlying value/emit contract gives stable
// coverage without reaching into reka-ui's internal portal lifecycle.
//
// The keyboard-open proofs in the "keyboard access" describe below are
// confirmed via real DOM key dispatch (not vm.$emit shortcuts): they fire
// KeyboardEvent on the trigger button and assert that reka-ui's OPEN_KEYS
// handler fires, expanding aria-expanded and moving focus into the listbox.

import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { z } from "zod";

import SchemaForm from "../SchemaForm.vue";
import SchemaFormThemeRoleControl from "../SchemaFormThemeRoleControl.vue";
import { Select } from "../component-ui-primitives";
import {
  describeThemePropertyKey,
  param,
  themeRoleParam,
  type ComponentParams,
  type ComponentThemeContext,
  type ComponentThemePropertyGroup,
  type ThemePropertyKey,
} from "../public-sdk";

const sampleThemeContext: ComponentThemeContext = {
  themeId: "default",
  properties: {
    color: {
      pageBackground: "#ffffff",
      surface: "#ffffff",
      surfaceMuted: "#f4f4f5",
      foreground: "#0a0a0a",
      foregroundMuted: "#71717a",
      border: "#e4e4e7",
      accent: "#3b82f6",
      accentForeground: "#ffffff",
      focusRing: "#3b82f6",
      destructive: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
      success: "#16a34a",
      chart1: "#1e40af",
      chart2: "#0ea5e9",
      chart3: "#22c55e",
      chart4: "#f97316",
      chart5: "#a855f7",
    },
    font: {
      body: "Inter, sans-serif",
      heading: "Inter, sans-serif",
      mono: "ui-monospace, SFMono-Regular, monospace",
    },
    radius: { none: "0px", sm: "4px", md: "8px", lg: "12px" },
    spacing: { none: "0px", sm: "4px", md: "8px", lg: "16px", xl: "24px" },
    motion: { durationFastMs: 120, durationNormalMs: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" },
  },
};

function mountWithThemeRole(
  params: ComponentParams,
  config: Record<string, unknown>,
  options: { themeContext?: ComponentThemeContext } = {},
) {
  return mount(SchemaForm, {
    props: {
      params,
      config,
      ...(options.themeContext ? { themeContext: options.themeContext } : {}),
    },
  });
}

describe("SchemaForm — theme-role control", () => {
  it("renders inherited/default state when the stored value is empty", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "" });

    const trigger = wrapper.find('[data-testid="tone-role"]');
    expect(trigger.exists()).toBe(true);
    expect(trigger.attributes("data-theme-role-state")).toBe("inherit");
    expect(trigger.attributes("aria-invalid")).toBeUndefined();
    expect(trigger.attributes("aria-label")).toBe("Accent role");
    expect(trigger.text()).toContain("Inherit from theme");
  });

  it("uses a custom unsetLabel when supplied", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        unsetLabel: "Use parent theme",
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "" });
    expect(wrapper.find('[data-testid="tone-role"]').text()).toContain("Use parent theme");
  });

  it("renders a humanised role label on the trigger when a known role is stored", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        testId: "tone-role",
      }),
    } satisfies ComponentParams;

    for (const stored of ["color.accent", "color.pageBackground", "color.chart3"] as const) {
      const wrapper = mountWithThemeRole(params, { tone: stored });
      const trigger = wrapper.find('[data-testid="tone-role"]');
      expect(trigger.attributes("data-theme-role-state")).toBe("role");
      expect(trigger.attributes("aria-invalid")).toBeUndefined();
      expect(trigger.text()).toContain(describeThemePropertyKey(stored).roleLabel);
    }
  });

  it("emits the stored property key when a role is selected", async () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "" });
    const select = wrapper.findComponent(Select);
    expect(select.exists()).toBe(true);
    select.vm.$emit("update:modelValue", "color.accent");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ tone: "color.accent" });
  });

  it("emits an empty string when the inherit sentinel is selected", async () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "color.accent" });
    const select = wrapper.findComponent(Select);
    select.vm.$emit("update:modelValue", "__inherit__");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ tone: "" });
  });

  it("renders disabled trigger and stops update emits when descriptor.disabled is true", async () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        testId: "tone-role",
        disabled: true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "" });

    const trigger = wrapper.find('[data-testid="tone-role"]');
    expect(trigger.attributes("data-disabled")).toBeDefined();
    const select = wrapper.findComponent(Select);
    select.vm.$emit("update:modelValue", "color.accent");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:config")).toBeUndefined();
  });

  it("flags unknown saved values as invalid and surfaces an inline alert", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        helpText: "Pick a role to color the accent.",
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "color.legacy-magenta" });

    const trigger = wrapper.find('[data-testid="tone-role"]');
    expect(trigger.attributes("data-theme-role-state")).toBe("unknown");
    expect(trigger.attributes("aria-invalid")).toBe("true");
    const hint = wrapper.find('[data-testid="tone-theme-role-validation-hint"]');
    expect(hint.exists()).toBe(true);
    expect(hint.attributes("role")).toBe("alert");
    expect(hint.text()).toContain("color.legacy-magenta");
    // Help text from the descriptor is suppressed when invalid.
    expect(wrapper.text()).not.toContain("Pick a role to color the accent.");
  });

  it("requires a selection when allowUnset is false and surfaces an alert on empty", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        allowUnset: false,
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "" });

    const trigger = wrapper.find('[data-testid="tone-role"]');
    expect(trigger.attributes("aria-invalid")).toBe("true");
    const hint = wrapper.find('[data-testid="tone-theme-role-validation-hint"]');
    expect(hint.exists()).toBe(true);
    expect(hint.text()).toContain("Pick a theme role");
  });

  it("treats values outside the requested groups as unknown so legacy data is visible", () => {
    const params = {
      family: themeRoleParam(z.string().default(""), {
        label: "Font family",
        groups: ["font"],
        testId: "family-role",
      }),
    } satisfies ComponentParams;

    const valid = mountWithThemeRole(params, { family: "font.body" });
    expect(valid.find('[data-testid="family-role"]').attributes("data-theme-role-state")).toBe(
      "role",
    );
    expect(valid.find('[data-testid="family-role"]').text()).toContain("Body");

    const offGroup = mountWithThemeRole(params, { family: "color.accent" });
    expect(offGroup.find('[data-testid="family-role"]').attributes("data-theme-role-state")).toBe(
      "unknown",
    );
    expect(offGroup.find('[data-testid="family-role"]').attributes("aria-invalid")).toBe("true");
  });

  it("infers visible groups from allowedKeys when groups is not supplied", () => {
    // Documented contract (`component-definition.ts:145-150`): when
    // `allowedKeys` is provided, the dropdown ignores `groups`. Without this
    // fix, `allowedKeys: ["font.body"]` would fall back to the default
    // `groups: ["color"]` and render zero font options.
    const params = {
      family: themeRoleParam(z.string().default(""), {
        label: "Font family",
        allowedKeys: ["font.body"],
        testId: "family-role",
      }),
    } satisfies ComponentParams;

    const wrapper = mountWithThemeRole(params, { family: "font.body" });
    const trigger = wrapper.find('[data-testid="family-role"]');
    expect(trigger.attributes("data-theme-role-state")).toBe("role");
    expect(trigger.attributes("aria-invalid")).toBeUndefined();
    expect(trigger.text()).toContain("Body");
  });

  it("treats values outside allowedKeys as unknown even when the group matches", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent or chart tone",
        allowedKeys: ["color.accent", "color.chart1", "color.chart2"],
        testId: "tone-role",
      }),
    } satisfies ComponentParams;

    const valid = mountWithThemeRole(params, { tone: "color.accent" });
    expect(valid.find('[data-testid="tone-role"]').attributes("data-theme-role-state")).toBe(
      "role",
    );

    const offList = mountWithThemeRole(params, { tone: "color.chart3" });
    expect(offList.find('[data-testid="tone-role"]').attributes("data-theme-role-state")).toBe(
      "unknown",
    );
    expect(offList.find('[data-testid="tone-role"]').attributes("aria-invalid")).toBe("true");
  });

  it("renders the trigger swatch utility class only when themeContext is supplied", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        testId: "tone-role",
      }),
    } satisfies ComponentParams;

    const withContext = mountWithThemeRole(
      params,
      { tone: "color.accent" },
      { themeContext: sampleThemeContext },
    );
    const trigger = withContext.find('[data-testid="tone-role"]');
    expect(trigger.find(".bg-ct-accent").exists()).toBe(true);

    const withoutContext = mountWithThemeRole(params, { tone: "color.accent" });
    expect(withoutContext.find('[data-testid="tone-role"]').find(".bg-ct-accent").exists()).toBe(
      false,
    );
  });

  it("does not render a trigger swatch when the stored value is empty or unknown", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        testId: "tone-role",
      }),
    } satisfies ComponentParams;

    const empty = mountWithThemeRole(params, { tone: "" }, { themeContext: sampleThemeContext });
    expect(empty.find('[data-testid="tone-role"]').find('[class^="bg-ct-"]').exists()).toBe(false);

    const unknownValue = mountWithThemeRole(
      params,
      { tone: "color.legacy-magenta" },
      { themeContext: sampleThemeContext },
    );
    expect(unknownValue.find('[data-testid="tone-role"]').find('[class^="bg-ct-"]').exists()).toBe(
      false,
    );
  });

  it("describeThemePropertyKey returns canonical labels for built-in roles", () => {
    expect(describeThemePropertyKey("color.accent")).toMatchObject({
      group: "color",
      groupLabel: "Color",
      role: "accent",
      roleLabel: "Accent",
    });
    expect(describeThemePropertyKey("color.chart1")).toMatchObject({
      groupLabel: "Color",
      roleLabel: "Chart 1",
    });
    expect(describeThemePropertyKey("font.body")).toMatchObject({
      groupLabel: "Font",
      roleLabel: "Body",
    });
  });

  it("themeRoleParam descriptor only carries control metadata and never raw colors", () => {
    const descriptor = themeRoleParam(z.string().default(""), {
      label: "Accent role",
      groups: ["color"],
      allowedKeys: ["color.accent", "color.chart1"],
      allowUnset: false,
      unsetLabel: "Default",
      disabled: true,
      testId: "tone-role",
    });
    expect(descriptor.meta.control).toEqual({
      kind: "theme-role",
      groups: ["color"],
      allowedKeys: ["color.accent", "color.chart1"],
      allowUnset: false,
      unsetLabel: "Default",
      disabled: true,
      testId: "tone-role",
    });
    // No raw color/font escape hatches snuck in via the helper.
    expect(JSON.stringify(descriptor.meta.control)).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });

  it("descriptor.disabled stays optional and omitted when false", () => {
    const descriptor = themeRoleParam(z.string().default(""), {
      label: "Accent role",
      testId: "tone-role",
    });
    expect(descriptor.meta.control).toEqual({ kind: "theme-role", testId: "tone-role" });
  });

  it("does not break existing field types when mounted alongside theme-role", async () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
      }),
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { title: "Hello", tone: "" });
    const input = wrapper.find<HTMLInputElement>('input[data-testid="title-input"]');
    expect(input.exists()).toBe(true);
    await input.setValue("World");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      title: "World",
      tone: "",
    });
  });

  it("renders a non-interactive trigger and blocks emits when the disabled prop is true", async () => {
    // Field-level `disabledWhen` predicates surface to this control through a
    // `disabled` prop (separate from the descriptor's own `control.disabled`).
    // Either source must switch the trigger off and stop the change handler.
    const descriptor = themeRoleParam(z.string().default(""), {
      label: "Accent role",
      testId: "tone-role",
    });
    const wrapper = mount(SchemaFormThemeRoleControl, {
      props: { fieldKey: "tone", descriptor, value: "color.accent", disabled: true },
    });
    const trigger = wrapper.find('[data-testid="tone-role"]');
    expect(trigger.attributes("data-disabled")).toBeDefined();
    const select = wrapper.findComponent(Select);
    expect(select.props("disabled")).toBe(true);
    select.vm.$emit("update:modelValue", "color.destructive");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:value")).toBeUndefined();
  });

  it("combines descriptor-level disabled with field-level disabled (either source disables)", async () => {
    // Descriptor flag without the prop still disables the trigger.
    const descriptorDisabled = themeRoleParam(z.string().default(""), {
      label: "Accent role",
      testId: "tone-role",
      disabled: true,
    });
    const fromDescriptor = mount(SchemaFormThemeRoleControl, {
      props: { fieldKey: "tone", descriptor: descriptorDisabled, value: "color.accent" },
    });
    expect(fromDescriptor.findComponent(Select).props("disabled")).toBe(true);
    fromDescriptor.findComponent(Select).vm.$emit("update:modelValue", "color.destructive");
    await fromDescriptor.vm.$nextTick();
    expect(fromDescriptor.emitted("update:value")).toBeUndefined();

    // Prop without the descriptor flag also disables the trigger.
    const descriptorEnabled = themeRoleParam(z.string().default(""), {
      label: "Accent role",
      testId: "tone-role",
    });
    const fromProp = mount(SchemaFormThemeRoleControl, {
      props: {
        fieldKey: "tone",
        descriptor: descriptorEnabled,
        value: "color.accent",
        disabled: true,
      },
    });
    expect(fromProp.findComponent(Select).props("disabled")).toBe(true);

    // With both flags off the trigger is interactive again.
    const enabled = mount(SchemaFormThemeRoleControl, {
      props: { fieldKey: "tone", descriptor: descriptorEnabled, value: "color.accent" },
    });
    expect(enabled.findComponent(Select).props("disabled")).toBeFalsy();
    enabled.findComponent(Select).vm.$emit("update:modelValue", "color.destructive");
    await enabled.vm.$nextTick();
    expect(enabled.emitted("update:value")?.at(-1)?.[0]).toBe("color.destructive");
  });

  it("standalone mount of the control surfaces update:invalid when it transitions", async () => {
    // Mounting the inner control directly lets us assert the emitter contract
    // without bouncing through SchemaFormLiteralControl/SchemaFormField.
    const validDescriptor = themeRoleParam(z.string().default(""), {
      label: "Accent role",
    });
    const valid = mount(SchemaFormThemeRoleControl, {
      props: { fieldKey: "tone", descriptor: validDescriptor, value: "color.accent" },
    });
    expect(valid.emitted("update:invalid")?.at(-1)?.[0]).toBe(false);

    const requiredDescriptor = themeRoleParam(z.string().default(""), {
      label: "Accent role",
      allowUnset: false,
    });
    const required = mount(SchemaFormThemeRoleControl, {
      props: { fieldKey: "tone", descriptor: requiredDescriptor, value: "" },
    });
    expect(required.emitted("update:invalid")?.at(-1)?.[0]).toBe(true);
    await required.setProps({ value: "color.accent" });
    expect(required.emitted("update:invalid")?.at(-1)?.[0]).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Help text contract
//
// Outside the Theme component the only authoring surface is an abstract role
// picker, so the descriptor's `helpText` is the only place to explain what
// the active theme actually controls and what the unset/inherit option means.
// These tests prove:
//   * `helpText` renders below the trigger in default (unset) and known-role
//     states, using the muted SchemaForm help-text style
//   * the inline validation alert wins over help text when the value is
//     unknown or the field is required-but-empty
//   * descriptors without `helpText` render no help-text node at all
// ---------------------------------------------------------------------------

describe("SchemaForm — theme-role help text", () => {
  const helpCopy =
    "Pick the active theme color role that paints the divider. Inherits the muted accent when no role is selected.";

  it("renders descriptor.helpText below the trigger in the default unset state", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        helpText: helpCopy,
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "" });

    const help = wrapper.find('[data-testid="tone-theme-role-help-text"]');
    expect(help.exists()).toBe(true);
    expect(help.text()).toBe(helpCopy);
    // Uses the established muted SchemaForm help-text treatment, not destructive.
    expect(help.classes()).toEqual(expect.arrayContaining(["text-xs", "text-muted-foreground/80"]));
    expect(help.classes()).not.toContain("text-destructive");
    // No validation alert is rendered alongside the help text in valid state.
    expect(wrapper.find('[data-testid="tone-theme-role-validation-hint"]').exists()).toBe(false);
  });

  it("keeps helpText visible when a known role is stored", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        helpText: helpCopy,
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "color.accent" });

    const help = wrapper.find('[data-testid="tone-theme-role-help-text"]');
    expect(help.exists()).toBe(true);
    expect(help.text()).toBe(helpCopy);
  });

  it("suppresses helpText when the stored value is unknown so the alert is the only message", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        helpText: helpCopy,
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "color.legacy-magenta" });

    expect(wrapper.find('[data-testid="tone-theme-role-validation-hint"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="tone-theme-role-help-text"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain(helpCopy);
  });

  it("suppresses helpText when allowUnset is false and the value is empty", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        helpText: helpCopy,
        allowUnset: false,
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "" });

    expect(wrapper.find('[data-testid="tone-theme-role-validation-hint"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="tone-theme-role-help-text"]').exists()).toBe(false);
  });

  it("renders no help-text node when the descriptor omits helpText", () => {
    const params = {
      tone: themeRoleParam(z.string().default(""), {
        label: "Accent role",
        testId: "tone-role",
      }),
    } satisfies ComponentParams;
    const wrapper = mountWithThemeRole(params, { tone: "" });
    expect(wrapper.find('[data-testid="tone-theme-role-help-text"]').exists()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Keyboard access contract
//
// These tests fire real KeyboardEvent dispatches against the rendered trigger
// button and assert the reka-ui SelectRoot state transitions (aria-expanded,
// data-state) and focus placement. They do NOT use vm.$emit shortcuts, so
// they prove the actual keyboard pathway.
//
// The test harness attaches each wrapper to document.body so that:
//   a) document.activeElement tracking works correctly, and
//   b) reka-ui's Teleport-to-body portal has a real parent node.
// Each test unmounts in afterEach to prevent cross-test DOM leakage.
// ---------------------------------------------------------------------------

describe("SchemaForm — theme-role keyboard access", () => {
  let wrappers: ReturnType<typeof mount>[] = [];

  afterEach(() => {
    for (const w of wrappers) {
      try {
        w.unmount();
      } catch {
        // Ignore already-unmounted wrappers.
      }
    }
    wrappers = [];
  });

  function mountAttached(value: string, options: { disabled?: boolean } = {}) {
    const descriptor = themeRoleParam(z.string().default(""), {
      label: "Tone",
      testId: "kbd-tone-role",
      ...(options.disabled ? { disabled: true } : {}),
    });
    const w = mount(SchemaFormThemeRoleControl, {
      props: { fieldKey: "kbd-tone", descriptor, value },
      attachTo: document.body,
    });
    wrappers.push(w);
    return w;
  }

  it("trigger is a native combobox button with tabIndex 0 (keyboard-reachable)", async () => {
    // Proves structural keyboard reachability: a <button role="combobox"> with
    // tabIndex=0 is reachable via Tab without any additional keyboard-focus fix.
    const wrapper = mountAttached("");
    await wrapper.vm.$nextTick();

    const trigger = wrapper.find('[data-testid="kbd-tone-role"]');
    expect(trigger.element.tagName).toBe("BUTTON");
    expect(trigger.element.getAttribute("role")).toBe("combobox");
    expect((trigger.element as HTMLButtonElement).tabIndex).toBe(0);
    // Initial state: collapsed.
    expect(trigger.element.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.element.getAttribute("data-state")).toBe("closed");
  });

  it("Enter key opens the dropdown and sets aria-expanded to true", async () => {
    // reka-ui OPEN_KEYS includes "Enter" — dispatching it on the trigger
    // calls handleOpen() which flips rootContext.open.value.
    const wrapper = mountAttached("");
    await wrapper.vm.$nextTick();

    const trigger = wrapper.find('[data-testid="kbd-tone-role"]');
    await trigger.trigger("keydown", { key: "Enter" });
    await wrapper.vm.$nextTick();

    expect(trigger.element.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.element.getAttribute("data-state")).toBe("open");
  });

  it("Space key opens the dropdown", async () => {
    // reka-ui OPEN_KEYS includes " " (Space).
    const wrapper = mountAttached("color.accent");
    await wrapper.vm.$nextTick();

    const trigger = wrapper.find('[data-testid="kbd-tone-role"]');
    await trigger.trigger("keydown", { key: " " });
    await wrapper.vm.$nextTick();

    expect(trigger.element.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.element.getAttribute("data-state")).toBe("open");
  });

  it("ArrowDown key opens the dropdown", async () => {
    // reka-ui OPEN_KEYS includes "ArrowDown".
    const wrapper = mountAttached("");
    await wrapper.vm.$nextTick();

    const trigger = wrapper.find('[data-testid="kbd-tone-role"]');
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await wrapper.vm.$nextTick();

    expect(trigger.element.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.element.getAttribute("data-state")).toBe("open");
  });

  it("keyboard open moves focus into the listbox so arrow navigation is available", async () => {
    // After Enter-open, reka-ui moves focus to the current value's item (or
    // the first item when unset). Confirms the aria-activedescendant/focus
    // contract: document.activeElement must be an option element.
    const wrapper = mountAttached("");
    await wrapper.vm.$nextTick();

    const trigger = wrapper.find('[data-testid="kbd-tone-role"]');
    await trigger.trigger("keydown", { key: "Enter" });
    await wrapper.vm.$nextTick();
    // Allow reka-ui to flush the RAF-based focus move.
    await wrapper.vm.$nextTick();

    const activeEl = document.activeElement;
    expect(activeEl).not.toBe(null);
    expect(activeEl).not.toBe(document.body);
    expect(activeEl?.getAttribute("role")).toBe("option");
  });

  it("keyboard open on a value-set control focuses the matched option", async () => {
    // When a role is already selected, opening via keyboard should focus that
    // item rather than the first item, so the user can quickly change it.
    const wrapper = mountAttached("color.accent");
    await wrapper.vm.$nextTick();

    const trigger = wrapper.find('[data-testid="kbd-tone-role"]');
    await trigger.trigger("keydown", { key: "Enter" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const activeEl = document.activeElement;
    expect(activeEl?.getAttribute("role")).toBe("option");
    // The focused item corresponds to the stored value.
    expect(activeEl?.getAttribute("data-testid")).toBe("kbd-tone-theme-role-option-color.accent");
  });

  it("disabled trigger does not open via keyboard Enter", async () => {
    // reka-ui checks isDisabled before calling handleOpen: a disabled trigger
    // must stay closed regardless of keyboard input.
    const wrapper = mountAttached("", { disabled: true });
    await wrapper.vm.$nextTick();

    const trigger = wrapper.find('[data-testid="kbd-tone-role"]');
    // Disabled is expressed as data-disabled (reka-ui) not the native disabled
    // attribute, ensuring the element remains in tab order for screen-reader
    // announcement while blocking open interaction.
    expect(trigger.element.getAttribute("data-disabled")).toBe("");
    expect(trigger.element.getAttribute("data-state")).toBe("closed");

    await trigger.trigger("keydown", { key: "Enter" });
    await wrapper.vm.$nextTick();

    expect(trigger.element.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.element.getAttribute("data-state")).toBe("closed");
  });

  it("options are rendered in the portaled listbox once opened", async () => {
    // Confirms that SelectContent teleports to document.body and that all
    // expected option elements are present for keyboard navigation. The
    // selection step itself (Enter on a focused option) is handled by reka-ui
    // internals that need full focus-scope support; that emit path is proven
    // separately via the vm.$emit contract tests above.
    const wrapper = mountAttached("");
    await wrapper.vm.$nextTick();

    const trigger = wrapper.find('[data-testid="kbd-tone-role"]');
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    // Inherit option must always be present.
    expect(
      document.body.querySelector('[data-testid="kbd-tone-theme-role-option-inherit"]'),
    ).not.toBeNull();

    // Known role options for the default "color" group are present.
    expect(
      document.body.querySelector('[data-testid="kbd-tone-theme-role-option-color.accent"]'),
    ).not.toBeNull();
    expect(
      document.body.querySelector('[data-testid="kbd-tone-theme-role-option-color.destructive"]'),
    ).not.toBeNull();

    // All exposed items carry role="option" for screen readers.
    const options = document.body.querySelectorAll('[role="option"]');
    expect(options.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// allowedKeys rendering contract
//
// Asserts that an `allowedKeys` allowlist drives the actually-rendered option
// set, even when `groups` is omitted (or its default `["color"]` would
// otherwise hide font/radius/spacing/motion options). Uses the keyboard-open
// + portal-query pattern proven above to inspect SelectContent, since
// reka-ui only mounts the listbox on open.
// ---------------------------------------------------------------------------

describe("SchemaForm — theme-role allowedKeys-driven option groups", () => {
  let wrappers: ReturnType<typeof mount>[] = [];

  afterEach(() => {
    for (const w of wrappers) {
      try {
        w.unmount();
      } catch {
        // Ignore already-unmounted wrappers.
      }
    }
    wrappers = [];
  });

  function mountAttached(opts: {
    fieldKey: string;
    allowedKeys: readonly ThemePropertyKey[];
    groups?: readonly ComponentThemePropertyGroup[];
    value?: string;
    testId: string;
  }) {
    const descriptor = themeRoleParam(z.string().default(""), {
      label: "Tone",
      allowedKeys: opts.allowedKeys,
      ...(opts.groups ? { groups: opts.groups } : {}),
      testId: opts.testId,
    });
    const w = mount(SchemaFormThemeRoleControl, {
      props: { fieldKey: opts.fieldKey, descriptor, value: opts.value ?? "" },
      attachTo: document.body,
    });
    wrappers.push(w);
    return w;
  }

  async function openDropdown(wrapper: ReturnType<typeof mount>, triggerTestId: string) {
    await wrapper.vm.$nextTick();
    const trigger = wrapper.find(`[data-testid="${triggerTestId}"]`);
    await trigger.trigger("keydown", { key: "ArrowDown" });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
  }

  it("renders the allowed font option when allowedKeys is set without explicit groups", async () => {
    const wrapper = mountAttached({
      fieldKey: "family",
      allowedKeys: ["font.body"],
      testId: "family-role-kbd",
    });
    await openDropdown(wrapper, "family-role-kbd");

    expect(
      document.body.querySelector('[data-testid="family-theme-role-option-font.body"]'),
    ).not.toBeNull();
    // The default-fallback color options must NOT appear when allowedKeys
    // narrows the set to font.body only.
    expect(
      document.body.querySelector('[data-testid="family-theme-role-option-color.accent"]'),
    ).toBeNull();
    expect(
      document.body.querySelector('[data-testid="family-theme-role-option-color.pageBackground"]'),
    ).toBeNull();
    // Only one group is rendered, so SelectLabel ("Font") is suppressed.
    expect(
      document.body.querySelector('[data-testid="family-theme-role-group-font"]'),
    ).not.toBeNull();
    expect(document.body.querySelector('[data-testid="family-theme-role-group-color"]')).toBeNull();
  });

  it("renders both groups (with labels) for a mixed-group allowedKeys allowlist", async () => {
    const wrapper = mountAttached({
      fieldKey: "mixed",
      allowedKeys: ["color.accent", "font.heading"],
      testId: "mixed-role-kbd",
    });
    await openDropdown(wrapper, "mixed-role-kbd");

    // Allowed keys are present.
    expect(
      document.body.querySelector('[data-testid="mixed-theme-role-option-color.accent"]'),
    ).not.toBeNull();
    expect(
      document.body.querySelector('[data-testid="mixed-theme-role-option-font.heading"]'),
    ).not.toBeNull();
    // Disallowed sibling keys (same group, different role) must be absent.
    expect(
      document.body.querySelector('[data-testid="mixed-theme-role-option-color.surface"]'),
    ).toBeNull();
    expect(
      document.body.querySelector('[data-testid="mixed-theme-role-option-font.body"]'),
    ).toBeNull();
    // Both group buckets are rendered.
    expect(
      document.body.querySelector('[data-testid="mixed-theme-role-group-color"]'),
    ).not.toBeNull();
    expect(
      document.body.querySelector('[data-testid="mixed-theme-role-group-font"]'),
    ).not.toBeNull();
    // With >1 group, SelectLabel headings are visible.
    const colorGroup = document.body.querySelector('[data-testid="mixed-theme-role-group-color"]');
    const fontGroup = document.body.querySelector('[data-testid="mixed-theme-role-group-font"]');
    expect(colorGroup?.textContent).toContain("Color");
    expect(fontGroup?.textContent).toContain("Font");
  });

  it("treats an explicitly empty allowedKeys: [] as 'no roles' (no color fallback)", async () => {
    // Per documented contract: when `allowedKeys` is provided the dropdown
    // only offers those keys. An explicitly empty allowlist must therefore
    // produce zero role options — not silently fall back to the default
    // `["color"]` groups, which would render `color.accent` etc.
    const wrapper = mountAttached({
      fieldKey: "empty",
      allowedKeys: [],
      testId: "empty-role-kbd",
    });
    await openDropdown(wrapper, "empty-role-kbd");

    // The inherit option remains (allowUnset defaults to true) so the
    // dropdown is still usable even with no roles.
    expect(
      document.body.querySelector('[data-testid="empty-theme-role-option-inherit"]'),
    ).not.toBeNull();
    // No default-color fallback options must appear.
    expect(
      document.body.querySelector('[data-testid="empty-theme-role-option-color.accent"]'),
    ).toBeNull();
    expect(
      document.body.querySelector('[data-testid="empty-theme-role-option-color.pageBackground"]'),
    ).toBeNull();
    // No color group bucket should be rendered either.
    expect(document.body.querySelector('[data-testid="empty-theme-role-group-color"]')).toBeNull();
  });

  it("ignores `groups` when allowedKeys is also supplied (allowedKeys wins)", async () => {
    // Per documented contract: `allowedKeys` takes precedence and ignores
    // `groups`. Set `groups: ["color"]` alongside a font-only allowedKeys
    // and prove only the font option renders.
    const wrapper = mountAttached({
      fieldKey: "override",
      groups: ["color"],
      allowedKeys: ["font.body"],
      testId: "override-role-kbd",
    });
    await openDropdown(wrapper, "override-role-kbd");

    expect(
      document.body.querySelector('[data-testid="override-theme-role-option-font.body"]'),
    ).not.toBeNull();
    expect(
      document.body.querySelector('[data-testid="override-theme-role-option-color.accent"]'),
    ).toBeNull();
    expect(
      document.body.querySelector('[data-testid="override-theme-role-group-color"]'),
    ).toBeNull();
  });
});

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import SchemaForm from "../SchemaForm.vue";
import { ConfigSelector, Switch } from "../component-ui-primitives";
import { param } from "../public-sdk";
import { evaluateParamInteractivity } from "../schema-form-interactivity";
import type { ComponentParams } from "../public-sdk";
import { inputPort, mountForm } from "./schema-form-test-helpers";

describe("schema form interactivity", () => {
  it("evaluates showWhen and disabledWhen against defaults-merged config", () => {
    const descriptor = param(z.string().default("basic"), {
      label: "Mode detail",
      control: { kind: "input" },
      showWhen: (config) => config.mode === "advanced",
      disabledWhen: (config) => config.locked === true,
      disabledHelpText: "Unlock settings to edit.",
    });

    expect(
      evaluateParamInteractivity("detail", descriptor, { mode: "basic", locked: true }),
    ).toEqual({ hidden: true, disabled: false, diagnostics: [] });

    expect(
      evaluateParamInteractivity("detail", descriptor, { mode: "advanced", locked: true }),
    ).toEqual({
      hidden: false,
      disabled: true,
      disabledHelpText: "Unlock settings to edit.",
      diagnostics: [],
    });
  });

  it("gives static visible=false precedence over showWhen", () => {
    const descriptor = param(z.string().default("value"), {
      label: "Hidden",
      control: { kind: "input" },
      visible: false,
      showWhen: () => {
        throw new Error("should not run");
      },
    });

    expect(evaluateParamInteractivity("hidden", descriptor, {})).toEqual({
      hidden: true,
      disabled: false,
      diagnostics: [],
    });
  });

  it("fails open and reports deterministic diagnostics for throwing predicates", () => {
    const descriptor = param(z.string().default("value"), {
      label: "Risky",
      control: { kind: "input" },
      showWhen: () => {
        throw new Error("visibility failed");
      },
      disabledWhen: () => {
        throw new Error("disabled failed");
      },
      disabledHelpText: "Only shown when disabled.",
    });

    expect(evaluateParamInteractivity("risky", descriptor, {})).toEqual({
      hidden: false,
      disabled: false,
      diagnostics: [
        {
          paramKey: "risky",
          conditionKind: "showWhen",
          message: "visibility failed",
        },
        {
          paramKey: "risky",
          conditionKind: "disabledWhen",
          message: "disabled failed",
        },
      ],
    });
  });
});

describe("SchemaForm — showWhen/disabledWhen wiring", () => {
  function makeParams() {
    return {
      mode: param(z.string().default("basic"), {
        label: "Mode",
        control: {
          kind: "select",
          options: [
            { label: "Basic", value: "basic" },
            { label: "Advanced", value: "advanced" },
          ],
          testId: "mode-select",
        },
      }),
      detail: param(z.string().default(""), {
        label: "Detail",
        control: { kind: "input", testId: "detail-input" },
        showWhen: (config) => config.mode === "advanced",
        disabledWhen: (config) => config.locked === true,
        disabledHelpText: "Unlock settings to edit.",
      }),
      locked: param(z.boolean().default(false), {
        label: "Locked",
        control: { kind: "boolean", testId: "locked-switch" },
      }),
    } satisfies ComponentParams;
  }

  it("removes hidden fields from the DOM via showWhen", () => {
    const wrapper = mountForm(makeParams(), { mode: "basic", detail: "", locked: false });
    expect(wrapper.find('[data-field="detail"]').exists()).toBe(false);
    expect(wrapper.find('input[data-testid="detail-input"]').exists()).toBe(false);
  });

  it("renders showWhen-visible fields and reflects disabled state on the wrapper", () => {
    const wrapper = mountForm(makeParams(), { mode: "advanced", detail: "", locked: true });
    const detail = wrapper.find('[data-field="detail"]');
    expect(detail.exists()).toBe(true);
    expect(detail.attributes("aria-disabled")).toBe("true");
    expect(detail.attributes("data-disabled")).toBe("true");
    expect(wrapper.find('[data-testid="schema-field-detail-disabled-help"]').text()).toBe(
      "Unlock settings to edit.",
    );
  });

  it("blocks update:config emits when the field is disabled", async () => {
    const wrapper = mountForm(makeParams(), { mode: "advanced", detail: "", locked: true });
    const input = wrapper.find<HTMLInputElement>('input[data-testid="detail-input"]');
    expect(input.exists()).toBe(true);
    await input.setValue("attempted edit");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("detail" in (args[0] as Record<string, unknown>)))).toBe(true);
  });

  it("suppresses groups whose every member is hidden", () => {
    const params = {
      mode: param(z.string().default("basic"), {
        label: "Mode",
        control: { kind: "input", testId: "mode-input" },
      }),
      typographyDetail: param(z.string().default(""), {
        label: "Typography detail",
        group: "Typography",
        control: { kind: "input", testId: "typography-detail-input" },
        showWhen: (config) => config.mode === "advanced",
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { mode: "basic", typographyDetail: "" });
    expect(wrapper.find('[data-testid="schema-form-group-Typography"]').exists()).toBe(false);
  });

  it("falls back to descriptor.helpText when disabledHelpText is unset", () => {
    const params = {
      mode: param(z.string().default("basic"), {
        label: "Mode",
        control: { kind: "input", testId: "mode-input" },
      }),
      detail: param(z.string().default(""), {
        label: "Detail",
        helpText: "Use this to describe the variant.",
        control: { kind: "input", testId: "detail-input" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { mode: "basic", detail: "" });
    expect(wrapper.find('[data-testid="schema-field-detail-disabled-help"]').text()).toBe(
      "Use this to describe the variant.",
    );
  });

  it("falls back to a generic disabled explanation when no help text is provided", () => {
    const params = {
      detail: param(z.string().default(""), {
        label: "Detail",
        control: { kind: "input", testId: "detail-input" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { detail: "" });
    expect(wrapper.find('[data-testid="schema-field-detail-disabled-help"]').text()).toBe(
      "Controlled by another setting.",
    );
  });

  it("renders disabled boolean help text once when disabledHelpText falls back to helpText", () => {
    const params = {
      enabled: param(z.boolean().default(false), {
        label: "Enabled",
        helpText: "Toggle the live state.",
        control: { kind: "boolean", testId: "enabled-switch" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { enabled: false });
    const occurrences = wrapper
      .findAll("p")
      .filter((node) => node.text() === "Toggle the live state.");
    expect(occurrences).toHaveLength(1);
    expect(wrapper.find('[data-testid="schema-field-enabled-disabled-help"]').text()).toBe(
      "Toggle the live state.",
    );
  });

  it("suppresses the select hint while disabled so the disabled explanation isn't duplicated", () => {
    const params = {
      variant: param(z.string().default("primary"), {
        label: "Variant",
        helpText: "Pick a style preset.",
        control: {
          kind: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
          ],
          testId: "variant-select",
        },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { variant: "primary" });
    const selector = wrapper.findComponent(ConfigSelector);
    expect(selector.exists()).toBe(true);
    expect(selector.props("hint")).toBeUndefined();
    expect(wrapper.find('[data-testid="schema-field-variant-disabled-help"]').text()).toBe(
      "Pick a style preset.",
    );
    const occurrences = wrapper
      .findAll("p")
      .filter((node) => node.text() === "Pick a style preset.");
    expect(occurrences).toHaveLength(1);
  });

  it("does not duplicate helpText in child-owned branches when disabledHelpText is unset", () => {
    const params = {
      requestHeaders: param(z.array(z.unknown()).default([]), {
        label: "Headers",
        helpText: "Custom request headers.",
        control: { kind: "headers", testId: "request-headers" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { requestHeaders: [] });
    // Child component renders helpText itself; the parent's disabled-help
    // slot should not duplicate that copy when no explicit override exists.
    expect(wrapper.find('[data-testid="schema-field-requestHeaders-disabled-help"]').exists()).toBe(
      false,
    );
    const occurrences = wrapper
      .findAll("p")
      .filter((node) => node.text() === "Custom request headers.");
    expect(occurrences).toHaveLength(1);
  });

  it("still surfaces explicit disabledHelpText alongside child-owned helpText", () => {
    const params = {
      requestHeaders: param(z.array(z.unknown()).default([]), {
        label: "Headers",
        helpText: "Custom request headers.",
        control: { kind: "headers", testId: "request-headers" },
        disabledWhen: () => true,
        disabledHelpText: "Unlock to edit headers.",
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { requestHeaders: [] });
    expect(wrapper.find('[data-testid="schema-field-requestHeaders-disabled-help"]').text()).toBe(
      "Unlock to edit headers.",
    );
  });

  it("does not duplicate helpText in a disabled bindable field bound to a source", () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        helpText: "Heading shown above the hero.",
        control: { kind: "input", testId: "title-input" },
        bindable: true,
        bindFrom: [{ input: "data", typeId: "primitive.string" }],
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mount(SchemaForm, {
      props: {
        params,
        config: { title: "" },
        inputs: [inputPort("data", ["primitive.string"])],
        paramValues: { title: { mode: "bind", input: "data", path: "$" } },
      },
    });
    // BindingUI already renders helpText in bind mode; the parent's
    // disabled-help slot must not echo the same copy.
    expect(wrapper.find('[data-testid="schema-field-title-disabled-help"]').exists()).toBe(false);
    const occurrences = wrapper
      .findAll("p")
      .filter((node) => node.text() === "Heading shown above the hero.");
    expect(occurrences).toHaveLength(1);
  });

  it("renders deterministic diagnostics for throwing predicates inline", () => {
    const params = {
      risky: param(z.string().default(""), {
        label: "Risky",
        control: { kind: "input", testId: "risky-input" },
        showWhen: () => {
          throw new Error("boom");
        },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { risky: "" });
    const list = wrapper.find('[data-testid="schema-form-interactivity-diagnostics"]');
    expect(list.exists()).toBe(true);
    const item = wrapper.find(
      '[data-testid="schema-form-interactivity-diagnostic-risky-showWhen"]',
    );
    expect(item.exists()).toBe(true);
    expect(item.text()).toContain("risky");
    expect(item.text()).toContain("showWhen");
    expect(item.text()).toContain("boom");
    // Fails open: the field still renders so the author isn't locked out.
    expect(wrapper.find('input[data-testid="risky-input"]').exists()).toBe(true);
  });

  it("blocks update:config emits from a disabled boolean field", async () => {
    const params = {
      enabled: param(z.boolean().default(false), {
        label: "Enabled",
        control: { kind: "boolean", testId: "enabled-switch" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { enabled: false });
    const switchComponent = wrapper.findComponent(Switch);
    expect(switchComponent.exists()).toBe(true);
    switchComponent.vm.$emit("update:modelValue", true);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:config") ?? []).toHaveLength(0);
  });

  it("blocks update:config emits from a disabled select field", async () => {
    const params = {
      variant: param(z.string().default("primary"), {
        label: "Variant",
        control: {
          kind: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
          ],
          testId: "variant-select",
        },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { variant: "primary" });
    const selector = wrapper.findComponent(ConfigSelector);
    expect(selector.exists()).toBe(true);
    expect(selector.props("disabled")).toBe(true);
    selector.vm.$emit("update:modelValue", "secondary");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:config") ?? []).toHaveLength(0);
  });

  it("relocates focus to a later visible field when the focused field becomes hidden", async () => {
    const params = {
      mode: param(z.string().default("advanced"), {
        label: "Mode",
        control: { kind: "input", testId: "mode-input" },
      }),
      detail: param(z.string().default(""), {
        label: "Detail",
        control: { kind: "input", testId: "detail-input" },
        showWhen: (config) => config.mode === "advanced",
      }),
      summary: param(z.string().default(""), {
        label: "Summary",
        control: { kind: "input", testId: "summary-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { mode: "advanced", detail: "", summary: "" });
    document.body.appendChild(wrapper.element);
    try {
      const detailInput = wrapper.find<HTMLInputElement>('input[data-testid="detail-input"]');
      detailInput.element.focus();
      expect(document.activeElement).toBe(detailInput.element);

      await wrapper.setProps({
        config: { mode: "basic", detail: "", summary: "" },
      });
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      const summaryInput = wrapper.find<HTMLInputElement>('input[data-testid="summary-input"]');
      expect(summaryInput.exists()).toBe(true);
      expect(document.activeElement).toBe(summaryInput.element);
    } finally {
      wrapper.unmount();
    }
  });

  it("marks native input/textarea/number/color controls as disabled in the DOM", () => {
    const params = {
      title: param(z.string().default("hi"), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
        disabledWhen: () => true,
      }),
      note: param(z.string().default("hello"), {
        label: "Note",
        control: { kind: "textarea", testId: "note-textarea" },
        disabledWhen: () => true,
      }),
      count: param(z.number().default(3), {
        label: "Count",
        control: { kind: "number", testId: "count-number" },
        disabledWhen: () => true,
      }),
      accent: param(z.string().default("#ff0000"), {
        label: "Accent",
        control: { kind: "color", testId: "accent-color" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { title: "hi", note: "hello", count: 3, accent: "#ff0000" });
    expect(
      wrapper.find<HTMLInputElement>('input[data-testid="title-input"]').element.disabled,
    ).toBe(true);
    expect(
      wrapper.find<HTMLTextAreaElement>('textarea[data-testid="note-textarea"]').element.disabled,
    ).toBe(true);
    expect(
      wrapper.find<HTMLInputElement>('input[data-testid="count-number"]').element.disabled,
    ).toBe(true);
    expect(
      wrapper.find<HTMLInputElement>('input[data-testid="accent-color"]').element.disabled,
    ).toBe(true);
  });

  it("preserves the user-visible value while disabled", () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { title: "Locked content" });
    const input = wrapper.find<HTMLInputElement>('input[data-testid="title-input"]');
    expect(input.element.value).toBe("Locked content");
    expect(input.element.disabled).toBe(true);
  });

  it("blocks number-field drafts from emitting while disabled", async () => {
    const params = {
      count: param(z.number().default(0), {
        label: "Count",
        control: { kind: "number", testId: "count-number" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { count: 0 });
    const input = wrapper.find<HTMLInputElement>('input[data-testid="count-number"]');
    await input.setValue("42");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("count" in (args[0] as Record<string, unknown>)))).toBe(true);
  });

  it("disables the code textarea fallback when no code editor adapter is registered", () => {
    const params = {
      script: param(z.string().default("// hi"), {
        label: "Script",
        control: { kind: "code", language: "javascript", testId: "script-code" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { script: "// hi" });
    const textarea = wrapper.find<HTMLTextAreaElement>('textarea[data-testid="script-code"]');
    expect(textarea.exists()).toBe(true);
    expect(textarea.element.disabled).toBe(true);
  });

  it("blocks code-field emits while disabled", async () => {
    const params = {
      script: param(z.string().default("// hi"), {
        label: "Script",
        control: { kind: "code", language: "javascript", testId: "script-code" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { script: "// hi" });
    const textarea = wrapper.find<HTMLTextAreaElement>('textarea[data-testid="script-code"]');
    await textarea.setValue("// edit attempt");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("script" in (args[0] as Record<string, unknown>)))).toBe(true);
  });

  it("relocates focus to the form root landing zone when no eligible field follows", async () => {
    const params = {
      detail: param(z.string().default(""), {
        label: "Detail",
        control: { kind: "input", testId: "detail-input" },
        showWhen: (config) => config.mode === "advanced",
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { mode: "advanced", detail: "" });
    document.body.appendChild(wrapper.element);
    try {
      const detailInput = wrapper.find<HTMLInputElement>('input[data-testid="detail-input"]');
      detailInput.element.focus();
      expect(document.activeElement).toBe(detailInput.element);

      await wrapper.setProps({ config: { mode: "basic", detail: "" } });
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      const formRoot = wrapper.find<HTMLElement>('[data-testid="schema-form"]');
      expect(formRoot.attributes("tabindex")).toBe("-1");
      expect(document.activeElement).toBe(formRoot.element);
    } finally {
      wrapper.unmount();
    }
  });
});

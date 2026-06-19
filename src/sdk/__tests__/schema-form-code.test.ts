import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { z } from "zod";

import { registerCodeEditor } from "../code-editor-adapter";
import { param } from "../public-sdk";
import type { ComponentParams } from "../public-sdk";
import { mountForm } from "./schema-form-test-helpers";

describe("SchemaForm — kind: 'code' JSON-object value handling", () => {
  const arrayValue = [
    { id: "option-alpha", label: "Alpha", valueText: "" },
    { id: "option-beta", label: "Beta", valueText: "" },
  ];

  function arrayCodeParams() {
    return {
      manualOptions: param(z.array(z.unknown()).default([]), {
        label: "Manual options",
        control: { kind: "code", language: "json", testId: "manual-options-code" },
      }),
    } satisfies ComponentParams;
  }

  it("renders a JSON-array value as formatted JSON, not [object Object]", () => {
    const wrapper = mountForm(arrayCodeParams(), { manualOptions: arrayValue });
    const textarea = wrapper.find<HTMLTextAreaElement>(
      'textarea[data-testid="manual-options-code"]',
    );
    expect(textarea.exists()).toBe(true);
    expect(textarea.element.value).toBe(JSON.stringify(arrayValue, null, 2));
    expect(textarea.element.value).not.toContain("[object Object]");
  });

  it("renders a JSON-object value as formatted JSON", () => {
    const params = {
      payload: param(z.record(z.string(), z.unknown()).default({}), {
        label: "Payload",
        control: { kind: "code", language: "json", testId: "payload-code" },
      }),
    } satisfies ComponentParams;
    const value = { hello: "world", count: 3 };
    const wrapper = mountForm(params, { payload: value });
    expect(
      wrapper.find<HTMLTextAreaElement>('textarea[data-testid="payload-code"]').element.value,
    ).toBe(JSON.stringify(value, null, 2));
  });

  it("emits a parsed array when the user types valid JSON", async () => {
    const wrapper = mountForm(arrayCodeParams(), { manualOptions: arrayValue });
    const textarea = wrapper.find<HTMLTextAreaElement>(
      'textarea[data-testid="manual-options-code"]',
    );
    const next = [{ id: "option-zeta", label: "Zeta", valueText: "z" }];
    await textarea.setValue(JSON.stringify(next));
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as Record<string, unknown>;
    expect(last).toEqual({ manualOptions: next });
    expect(Array.isArray(last.manualOptions)).toBe(true);
  });

  it("emits a parsed primitive when the user types a JSON literal", async () => {
    const params = {
      value: param(z.unknown(), {
        label: "Value",
        control: { kind: "code", language: "json", testId: "value-code" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { value: { count: 0 } });
    await wrapper.find<HTMLTextAreaElement>('textarea[data-testid="value-code"]').setValue("42");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as Record<string, unknown>;
    expect(last).toEqual({ value: 42 });
    expect(typeof last.value).toBe("number");
  });

  it("does not emit and shows an inline alert when the user types invalid JSON", async () => {
    const wrapper = mountForm(arrayCodeParams(), { manualOptions: arrayValue });
    const textarea = wrapper.find<HTMLTextAreaElement>(
      'textarea[data-testid="manual-options-code"]',
    );
    await textarea.setValue("[{ broken json");
    expect(wrapper.emitted("update:config")).toBeUndefined();
    const hint = wrapper.find('[data-testid="manualOptions-code-validation-hint"]');
    expect(hint.exists()).toBe(true);
    expect(hint.attributes("role")).toBe("alert");
    expect(textarea.attributes("aria-invalid")).toBe("true");
    await textarea.setValue("[]");
    expect(wrapper.find('[data-testid="manualOptions-code-validation-hint"]').exists()).toBe(false);
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ manualOptions: [] });
  });

  it("flags an empty draft as invalid in JSON-object mode without emitting", async () => {
    const wrapper = mountForm(arrayCodeParams(), { manualOptions: arrayValue });
    await wrapper
      .find<HTMLTextAreaElement>('textarea[data-testid="manual-options-code"]')
      .setValue("");
    expect(wrapper.emitted("update:config")).toBeUndefined();
    expect(wrapper.find('[data-testid="manualOptions-code-validation-hint"]').exists()).toBe(true);
  });

  it("keeps string-mode code controls emitting raw strings unchanged", async () => {
    const params = {
      bodyText: param(z.string().default(""), {
        label: "Body",
        control: { kind: "code", language: "json", testId: "body-code" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { bodyText: "{}" });
    const textarea = wrapper.find<HTMLTextAreaElement>('textarea[data-testid="body-code"]');
    expect(textarea.element.value).toBe("{}");
    await textarea.setValue('{"a":');
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ bodyText: '{"a":' });
    await textarea.setValue('{"a":1}');
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ bodyText: '{"a":1}' });
  });

  it("keeps non-JSON code languages in string-mode (markdown/javascript)", async () => {
    const params = {
      script: param(z.string().default(""), {
        label: "Script",
        control: { kind: "code", language: "javascript", testId: "script-code" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { script: "return 1" });
    await wrapper
      .find<HTMLTextAreaElement>('textarea[data-testid="script-code"]')
      .setValue("return 1 + 2");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ script: "return 1 + 2" });
  });
});

describe("SchemaForm — kind: 'code' adapter", () => {
  function codeParams() {
    return {
      payload: param(z.string().default("{}"), {
        label: "Payload",
        control: { kind: "code", language: "json", testId: "payload-code" },
      }),
    } satisfies ComponentParams;
  }

  beforeEach(() => {
    registerCodeEditor(null);
  });

  afterEach(() => {
    registerCodeEditor(null);
  });

  it("falls back to the font-mono textarea when no adapter is registered", () => {
    const wrapper = mountForm(codeParams(), { payload: "{}" });
    const textarea = wrapper.find<HTMLTextAreaElement>('textarea[data-testid="payload-code"]');
    expect(textarea.exists()).toBe(true);
    expect(textarea.classes()).toContain("font-mono");
  });

  it("renders the registered adapter, forwards modelValue/language/testId, and emits update:config on change", async () => {
    const FakeCodeEditor = defineComponent({
      props: {
        modelValue: { type: String, required: true },
        language: { type: String, required: true },
        rows: { type: Number, default: undefined },
      },
      emits: ["update:modelValue"],
      setup(props, { attrs, emit }) {
        return () =>
          h("div", {
            ...attrs,
            "data-fake-code-editor": "true",
            "data-language": props.language,
            "data-rows": props.rows,
            "data-model-value": props.modelValue,
            onClick: () => emit("update:modelValue", `${props.modelValue}!`),
          });
      },
    });
    registerCodeEditor(FakeCodeEditor);
    const wrapper = mountForm(codeParams(), { payload: "{}" });
    expect(wrapper.find('textarea[data-testid="payload-code"]').exists()).toBe(false);
    const adapter = wrapper.find('[data-testid="payload-code"]');
    expect(adapter.exists()).toBe(true);
    expect(adapter.attributes("data-fake-code-editor")).toBe("true");
    expect(adapter.attributes("data-language")).toBe("json");
    expect(adapter.attributes("data-model-value")).toBe("{}");
    expect(adapter.classes()).toContain("font-mono");
    expect(adapter.attributes("data-rows")).toBe("6");
    await adapter.trigger("click");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ payload: "{}!" });
  });

  it("restores the textarea fallback after the adapter is unregistered", async () => {
    const FakeCodeEditor = defineComponent({
      props: { modelValue: { type: String, required: true } },
      emits: ["update:modelValue"],
      setup(_, { attrs }) {
        return () => h("div", { ...attrs, "data-fake-code-editor": "true" });
      },
    });
    registerCodeEditor(FakeCodeEditor);
    const wrapper = mountForm(codeParams(), { payload: "{}" });
    expect(wrapper.find('textarea[data-testid="payload-code"]').exists()).toBe(false);
    expect(wrapper.find('[data-fake-code-editor="true"]').exists()).toBe(true);
    registerCodeEditor(null);
    await wrapper.vm.$nextTick();
    const textarea = wrapper.find<HTMLTextAreaElement>('textarea[data-testid="payload-code"]');
    expect(textarea.exists()).toBe(true);
    expect(textarea.classes()).toContain("font-mono");
    expect(wrapper.find('[data-fake-code-editor="true"]').exists()).toBe(false);
  });
});

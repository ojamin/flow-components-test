import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import SchemaForm from "../SchemaForm.vue";
import { ConfigSelector } from "../component-ui-primitives";
import { param } from "../public-sdk";
import type { ComponentParams, InputPortDefinition, ParamValuesState } from "../public-sdk";
import { inputPort, mountForm } from "./schema-form-test-helpers";

describe("SchemaForm — binding UI", () => {
  function bindableTitleParams() {
    return {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
        bindable: true,
        bindFrom: [
          { input: "data", typeId: "primitive.string" },
          { input: "title", typeId: "primitive.string" },
          { input: "count", typeId: "primitive.string" },
        ],
      }),
    } satisfies ComponentParams;
  }

  const compatibleInputs: InputPortDefinition[] = [
    inputPort("data", ["all-data"]),
    inputPort("title", ["primitive.string"]),
    inputPort("count", ["primitive.number"]),
  ];

  it("shows the Literal/From data toggle when bindable and inputs are non-empty", () => {
    const wrapper = mount(SchemaForm, {
      props: { params: bindableTitleParams(), config: { title: "" }, inputs: compatibleInputs },
    });
    expect(wrapper.find('[data-testid="title-bind-toggle"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="title-bind-mode-literal"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="title-bind-mode-from-data"]').exists()).toBe(true);
  });

  it("hides the toggle when the param is not bindable", () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mount(SchemaForm, {
      props: { params, config: { title: "" }, inputs: compatibleInputs },
    });
    expect(wrapper.find('[data-testid="title-bind-toggle"]').exists()).toBe(false);
  });

  it("hides the toggle when inputs are not provided or empty", () => {
    const undefinedInputs = mountForm(bindableTitleParams(), { title: "" });
    expect(undefinedInputs.find('[data-testid="title-bind-toggle"]').exists()).toBe(false);
    const emptyInputs = mount(SchemaForm, {
      props: { params: bindableTitleParams(), config: { title: "" }, inputs: [] },
    });
    expect(emptyInputs.find('[data-testid="title-bind-toggle"]').exists()).toBe(false);
  });

  it("filters bind-source options through resolveAllowedParamBindSources", () => {
    const wrapper = mount(SchemaForm, {
      props: {
        params: bindableTitleParams(),
        config: { title: "" },
        inputs: compatibleInputs,
        paramValues: { title: { mode: "bind", input: "data", path: "$" } },
      },
    });
    const selector = wrapper.findComponent(ConfigSelector);
    expect(selector.exists()).toBe(true);
    expect(selector.props("options")).toEqual([
      { value: "data", label: "data" },
      { value: "title", label: "title" },
    ]);
  });

  it("emits update:paramValues with the first allowed source when toggling Literal → From data", async () => {
    const wrapper = mount(SchemaForm, {
      props: { params: bindableTitleParams(), config: { title: "" }, inputs: compatibleInputs },
    });
    await wrapper.find('[data-testid="title-bind-mode-from-data"]').trigger("click");
    expect(wrapper.emitted("update:paramValues")?.at(-1)?.[0]).toEqual({
      title: { mode: "bind", input: "data", path: "$" },
    } satisfies ParamValuesState);
  });

  it("emits update:paramValues with current literal config value when toggling From data → Literal", async () => {
    const wrapper = mount(SchemaForm, {
      props: {
        params: bindableTitleParams(),
        config: { title: "Current" },
        inputs: compatibleInputs,
        paramValues: { title: { mode: "bind", input: "data", path: "$.foo" } },
      },
    });
    await wrapper.find('[data-testid="title-bind-mode-literal"]').trigger("click");
    expect(wrapper.emitted("update:paramValues")?.at(-1)?.[0]).toEqual({
      title: { mode: "literal", value: "Current" },
    });
  });

  it("emits update:paramValues with the new source when changing the Source select while in bind mode", async () => {
    const wrapper = mount(SchemaForm, {
      props: {
        params: bindableTitleParams(),
        config: { title: "" },
        inputs: compatibleInputs,
        paramValues: { title: { mode: "bind", input: "data", path: "$.hero" } },
      },
    });
    wrapper.findComponent(ConfigSelector).vm.$emit("update:modelValue", "title");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:paramValues")?.at(-1)?.[0]).toEqual({
      title: { mode: "bind", input: "title", path: "$.hero" },
    });
  });

  it("validates JSONPath on blur and emits update:paramValues only on valid input", async () => {
    const wrapper = mount(SchemaForm, {
      props: {
        params: bindableTitleParams(),
        config: { title: "" },
        inputs: compatibleInputs,
        paramValues: { title: { mode: "bind", input: "data", path: "$" } },
      },
    });
    const pathInput = wrapper.find<HTMLInputElement>('input[data-testid="title-bind-path"]');
    expect(pathInput.exists()).toBe(true);
    await pathInput.setValue("$..bad");
    await pathInput.trigger("blur");
    const hint = wrapper.find('[data-testid="title-bind-path-validation-hint"]');
    expect(hint.exists()).toBe(true);
    expect(hint.attributes("role")).toBe("alert");
    expect(pathInput.attributes("aria-invalid")).toBe("true");
    expect(wrapper.emitted("update:paramValues")).toBeUndefined();
    await pathInput.setValue("$.hero.title");
    await pathInput.trigger("blur");
    expect(wrapper.find('[data-testid="title-bind-path-validation-hint"]').exists()).toBe(false);
    expect(wrapper.emitted("update:paramValues")?.at(-1)?.[0]).toEqual({
      title: { mode: "bind", input: "data", path: "$.hero.title" },
    });
  });

  it("does not emit update:paramValues when blurring the path with no actual change", async () => {
    const wrapper = mount(SchemaForm, {
      props: {
        params: bindableTitleParams(),
        config: { title: "" },
        inputs: compatibleInputs,
        paramValues: { title: { mode: "bind", input: "data", path: "$.hero" } },
      },
    });
    await wrapper.find<HTMLInputElement>('input[data-testid="title-bind-path"]').trigger("blur");
    expect(wrapper.emitted("update:paramValues")).toBeUndefined();
  });

  it("shows the disabled From data state when the param has no compatible inputs", async () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
        bindable: true,
        bindFrom: [{ input: "missing", typeId: "primitive.string" }],
      }),
    } satisfies ComponentParams;
    const wrapper = mount(SchemaForm, {
      props: { params, config: { title: "" }, inputs: compatibleInputs },
    });
    const fromDataButton = wrapper.find<HTMLButtonElement>(
      '[data-testid="title-bind-mode-from-data"]',
    );
    expect(fromDataButton.exists()).toBe(true);
    expect(fromDataButton.attributes("aria-disabled")).toBe("true");
    await fromDataButton.trigger("click");
    expect(wrapper.emitted("update:paramValues")).toBeUndefined();
  });

  it("marks both toggle items disabled when the bindable field is disabled", () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
        bindable: true,
        bindFrom: [{ input: "data", typeId: "primitive.string" }],
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mount(SchemaForm, {
      props: { params, config: { title: "" }, inputs: compatibleInputs },
    });
    const literal = wrapper.find<HTMLButtonElement>('[data-testid="title-bind-mode-literal"]');
    const fromData = wrapper.find<HTMLButtonElement>('[data-testid="title-bind-mode-from-data"]');
    expect(literal.attributes("disabled")).toBeDefined();
    expect(fromData.attributes("disabled")).toBeDefined();
  });

  it("does not emit update:paramValues when toggling mode while disabled", async () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
        bindable: true,
        bindFrom: [{ input: "data", typeId: "primitive.string" }],
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mount(SchemaForm, {
      props: { params, config: { title: "" }, inputs: compatibleInputs },
    });
    await wrapper.find('[data-testid="title-bind-mode-from-data"]').trigger("click");
    expect(wrapper.emitted("update:paramValues")).toBeUndefined();
  });

  it("forwards disabled to the bind source selector and blocks source changes", async () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
        bindable: true,
        bindFrom: [
          { input: "data", typeId: "primitive.string" },
          { input: "title", typeId: "primitive.string" },
        ],
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
    const wrapper = mount(SchemaForm, {
      props: {
        params,
        config: { title: "" },
        inputs: compatibleInputs,
        paramValues: { title: { mode: "bind", input: "data", path: "$" } },
      },
    });
    const selector = wrapper.findComponent(ConfigSelector);
    expect(selector.exists()).toBe(true);
    expect(selector.props("disabled")).toBe(true);
    selector.vm.$emit("update:modelValue", "title");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:paramValues")).toBeUndefined();
  });

  it("renders the bind path input as readonly + tabindex=-1 while disabled, keeping the bound path visible", () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
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
        inputs: compatibleInputs,
        paramValues: { title: { mode: "bind", input: "data", path: "$.hero.title" } },
      },
    });
    const pathInput = wrapper.find<HTMLInputElement>('input[data-testid="title-bind-path"]');
    expect(pathInput.exists()).toBe(true);
    expect(pathInput.attributes("readonly")).toBeDefined();
    expect(pathInput.attributes("tabindex")).toBe("-1");
    expect(pathInput.element.value).toBe("$.hero.title");
  });

  it("does not emit update:paramValues when blurring a disabled bind path input with a draft", async () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
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
        inputs: compatibleInputs,
        paramValues: { title: { mode: "bind", input: "data", path: "$" } },
      },
    });
    const pathInput = wrapper.find<HTMLInputElement>('input[data-testid="title-bind-path"]');
    await pathInput.setValue("$.hero");
    await pathInput.trigger("blur");
    expect(wrapper.emitted("update:paramValues")).toBeUndefined();
  });

  it("preserves unrelated paramValues entries when patching a single field", async () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
        bindable: true,
        bindFrom: [{ input: "data", typeId: "primitive.string" }],
      }),
      eyebrow: param(z.string().default(""), {
        label: "Eyebrow",
        control: { kind: "input", testId: "eyebrow-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mount(SchemaForm, {
      props: {
        params,
        config: { title: "", eyebrow: "Intro" },
        inputs: compatibleInputs,
        paramValues: { eyebrow: { mode: "literal", value: "Intro" } },
      },
    });
    await wrapper.find('[data-testid="title-bind-mode-from-data"]').trigger("click");
    expect(wrapper.emitted("update:paramValues")?.at(-1)?.[0]).toEqual({
      eyebrow: { mode: "literal", value: "Intro" },
      title: { mode: "bind", input: "data", path: "$" },
    });
  });
});

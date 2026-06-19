import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";

import SchemaForm from "../SchemaForm.vue";
import { registerDataPathPicker } from "../data-path-picker-adapter";
import { param } from "../public-sdk";
import type { ComponentParams, InputPortDefinition } from "../public-sdk";

const FakePicker = defineComponent({
  props: {
    modelValue: { type: String, required: true },
    fieldLabel: { type: String, required: true },
    mode: { type: String, required: true },
    outputFormat: { type: String, required: true },
    sourceInputId: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  template:
    "<button type=\"button\" data-testid=\"fake-path-picker\" @click=\"$emit('update:modelValue', outputFormat === 'jsonpath' ? '$.items[0].title' : 'items[0]')\">Pick</button>",
});

describe("SchemaForm — data-path picker", () => {
  afterEach(() => registerDataPathPicker(null));

  it("renders data-path controls as plain inputs when no adapter is registered", () => {
    const wrapper = mount(SchemaForm, {
      props: { params: dataPathParams(), config: { sourcePath: "items[0]" } },
    });
    expect(wrapper.find('input[data-testid="json-select-path-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="sourcePath-data-path-picker"]').exists()).toBe(false);
  });

  it("mounts the registered picker and emits literal relative paths", async () => {
    registerDataPathPicker(FakePicker);
    const wrapper = mount(SchemaForm, {
      props: { params: dataPathParams(), config: { sourcePath: "items[0]" }, instanceId: "node-1" },
    });
    await wrapper.find('[data-testid="sourcePath-data-path-picker"]').trigger("click");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ sourcePath: "items[0]" });
  });

  it("mounts the registered picker beside bind-mode paths and preserves paramValues", async () => {
    registerDataPathPicker(FakePicker);
    const inputs: InputPortDefinition[] = [inputPort("data")];
    const wrapper = mount(SchemaForm, {
      props: {
        params: bindableParams(),
        config: { title: "" },
        inputs,
        instanceId: "node-1",
        paramValues: { title: { mode: "bind", input: "data", path: "$.title" } },
      },
    });
    await wrapper.find('[data-testid="title-bind-data-path-picker"]').trigger("click");
    expect(wrapper.emitted("update:paramValues")?.at(-1)?.[0]).toEqual({
      title: { mode: "bind", input: "data", path: "$.items[0].title" },
    });
  });
});

describe("SchemaForm — data-path disabledWhen wiring", () => {
  afterEach(() => registerDataPathPicker(null));

  it("disables the inner input and stops typed edits from emitting", async () => {
    const wrapper = mount(SchemaForm, {
      props: {
        params: disabledDataPathParams(),
        config: { sourcePath: "items[0]" },
      },
    });
    const input = wrapper.find<HTMLInputElement>('input[data-testid="json-select-path-input"]');
    expect(input.exists()).toBe(true);
    expect(input.element.disabled).toBe(true);
    expect(input.element.value).toBe("items[0]");

    await input.setValue("attempted edit");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("sourcePath" in (args[0] as Record<string, unknown>)))).toBe(
      true,
    );
  });

  it("disables the registered picker root and blocks picker-driven emits", async () => {
    registerDataPathPicker(FakePicker);
    const wrapper = mount(SchemaForm, {
      props: {
        params: disabledDataPathParams(),
        config: { sourcePath: "items[0]" },
        instanceId: "node-1",
      },
    });
    const picker = wrapper.find<HTMLButtonElement>('[data-testid="sourcePath-data-path-picker"]');
    expect(picker.exists()).toBe(true);
    expect(picker.element.disabled).toBe(true);
    expect(picker.attributes("tabindex")).toBe("-1");
    expect(picker.attributes("aria-disabled")).toBe("true");

    // Even if a stray adapter event were to fire, the wrapper's emit guard must
    // suppress it. Simulate that path explicitly via vm.$emit since `click` on a
    // disabled <button> would otherwise be the only signal under jsdom.
    picker.findComponent(FakePicker).vm.$emit("update:modelValue", "tampered");
    await wrapper.vm.$nextTick();
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("sourcePath" in (args[0] as Record<string, unknown>)))).toBe(
      true,
    );
  });

  it("leaves controls interactive when not disabledWhen-triggered", () => {
    registerDataPathPicker(FakePicker);
    const wrapper = mount(SchemaForm, {
      props: { params: dataPathParams(), config: { sourcePath: "items[0]" } },
    });
    const input = wrapper.find<HTMLInputElement>('input[data-testid="json-select-path-input"]');
    expect(input.element.disabled).toBe(false);
    const picker = wrapper.find<HTMLButtonElement>('[data-testid="sourcePath-data-path-picker"]');
    expect(picker.element.disabled).toBe(false);
    expect(picker.attributes("tabindex")).toBeUndefined();
    expect(picker.attributes("aria-disabled")).toBeUndefined();
  });
});

function disabledDataPathParams() {
  return {
    sourcePath: param(z.string().default("items[0]"), {
      label: "Path",
      control: { kind: "data-path", placeholder: "items[0]", testId: "json-select-path-input" },
      disabledWhen: () => true,
    }),
  } satisfies ComponentParams;
}

function dataPathParams() {
  return {
    sourcePath: param(z.string().default("items[0]"), {
      label: "Path",
      control: { kind: "data-path", placeholder: "items[0]", testId: "json-select-path-input" },
    }),
  } satisfies ComponentParams;
}

function bindableParams() {
  return {
    title: param(z.string().default(""), {
      label: "Title",
      control: { kind: "input", testId: "title-input" },
      bindable: true,
      bindFrom: [{ input: "data", typeId: "primitive.string" }],
    }),
  } satisfies ComponentParams;
}

function inputPort(id: string): InputPortDefinition {
  return {
    id,
    label: id,
    mode: "full",
    acceptedTypeIds: ["all-data"],
    required: false,
    allowMultiple: false,
    allowCycle: false,
  };
}

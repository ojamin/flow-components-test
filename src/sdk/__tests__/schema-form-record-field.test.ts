import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";

import SchemaForm from "../SchemaForm.vue";
import { registerDataPathPicker } from "../data-path-picker-adapter";
import { dataPathParam, recordFieldParam } from "../public-sdk";
import type { ComponentParams } from "../public-sdk";

const FakePicker = defineComponent({
  props: {
    modelValue: { type: String, required: true },
    fieldLabel: { type: String, required: true },
    mode: { type: String, required: true },
    outputFormat: { type: String, required: true },
  },
  emits: ["update:modelValue"],
  template:
    '<button type="button" data-testid="fake-record-picker" @click="$emit(\'update:modelValue\', \'region\')">Pick</button>',
});

function recordFieldParams(initial = "") {
  return {
    keyField: recordFieldParam(z.string().default(initial), {
      label: "Key field",
      placeholder: "field path",
      helpText: "Pick a field path inside each row.",
      testId: "record-field-input",
    }),
  } satisfies ComponentParams;
}

describe("SchemaForm — record-field control", () => {
  afterEach(() => registerDataPathPicker(null));

  it("renders the labeled input with placeholder and help text without a registered picker", () => {
    const wrapper = mount(SchemaForm, {
      props: { params: recordFieldParams(), config: { keyField: "" } },
    });
    expect(wrapper.find('input[data-testid="record-field-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="keyField-record-field-picker"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("Key field");
    expect(wrapper.text()).toContain("Pick a field path inside each row.");
  });

  it("emits the typed value through update:config", async () => {
    const wrapper = mount(SchemaForm, {
      props: { params: recordFieldParams(), config: { keyField: "" } },
    });
    await wrapper
      .find<HTMLInputElement>('input[data-testid="record-field-input"]')
      .setValue("category");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ keyField: "category" });
  });

  it("mounts the registered picker beside the input and emits the picked value", async () => {
    registerDataPathPicker(FakePicker);
    const wrapper = mount(SchemaForm, {
      props: { params: recordFieldParams(), config: { keyField: "" } },
    });
    await wrapper.find('[data-testid="keyField-record-field-picker"]').trigger("click");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ keyField: "region" });
  });
});

describe("SchemaForm — record-field picker scope", () => {
  // Captures the latest `rootPath` prop the picker receives so the test can
  // assert that record-field rows scope through the descriptor's
  // `pickerRootPathKey`. Reset per-test so cross-test leakage is impossible.
  let capturedRootPath: string | undefined;

  const RecordingPicker = defineComponent({
    props: {
      modelValue: { type: String, required: true },
      fieldLabel: { type: String, required: true },
      mode: { type: String, required: true },
      outputFormat: { type: String, required: true },
      rootPath: { type: String, default: undefined },
    },
    emits: ["update:modelValue"],
    setup(props) {
      capturedRootPath = props.rootPath;
      return () => null;
    },
  });

  function scopedRecordFieldParams() {
    return {
      rowsPath: dataPathParam(z.string().default(""), {
        label: "Rows path",
        placeholder: "results",
      }),
      keyField: recordFieldParam(z.string().default(""), {
        label: "Key field",
        placeholder: "field path",
        pickerRootPathKey: "rowsPath",
        testId: "record-field-input",
      }),
    } satisfies ComponentParams;
  }

  afterEach(() => {
    registerDataPathPicker(null);
    capturedRootPath = undefined;
  });

  it("forwards the sibling `rowsPath` value as the picker rootPath when set", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: scopedRecordFieldParams(),
        config: { rowsPath: "results", keyField: "" },
      },
    });
    expect(capturedRootPath).toBe("results");
  });

  it("omits rootPath when the sibling key is blank", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: scopedRecordFieldParams(),
        config: { rowsPath: "", keyField: "" },
      },
    });
    expect(capturedRootPath).toBeUndefined();
  });
});

describe("SchemaForm — record-field nested picker scope", () => {
  // Emulates the multi-line shape: per-point fields like `xField` should
  // compose their picker scope from a base sibling (`seriesPath`) plus a
  // per-row child sibling (`pointsField`). Only the `xField` row is in
  // params so the captured rootPath belongs to the nested-suffix descriptor.
  let capturedRootPath: string | undefined;

  const RecordingPicker = defineComponent({
    props: {
      modelValue: { type: String, required: true },
      fieldLabel: { type: String, required: true },
      mode: { type: String, required: true },
      outputFormat: { type: String, required: true },
      rootPath: { type: String, default: undefined },
    },
    emits: ["update:modelValue"],
    setup(props) {
      capturedRootPath = props.rootPath;
      return () => null;
    },
  });

  function nestedRecordFieldParams() {
    return {
      xField: recordFieldParam(z.string().default(""), {
        label: "X field",
        placeholder: "x",
        pickerRootPathKey: "seriesPath",
        pickerRootPathSuffixKey: "pointsField",
        testId: "x-field-input",
      }),
    } satisfies ComponentParams;
  }

  afterEach(() => {
    registerDataPathPicker(null);
    capturedRootPath = undefined;
  });

  it("composes rootPath as `series[*].points` when both base and suffix sibling values are set", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: nestedRecordFieldParams(),
        config: { seriesPath: "series", pointsField: "points", xField: "" },
      },
    });
    expect(capturedRootPath).toBe("series[*].points");
  });

  it("preserves absolute base paths when composing the wildcard suffix", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: nestedRecordFieldParams(),
        config: { seriesPath: "$.series", pointsField: "points", xField: "" },
      },
    });
    expect(capturedRootPath).toBe("$.series[*].points");
  });

  it("falls back to the base rootPath when the suffix sibling is blank", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: nestedRecordFieldParams(),
        config: { seriesPath: "series", pointsField: "", xField: "" },
      },
    });
    expect(capturedRootPath).toBe("series");
  });

  it("omits rootPath when the base sibling is blank, even with a suffix value", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: nestedRecordFieldParams(),
        config: { seriesPath: "", pointsField: "points", xField: "" },
      },
    });
    expect(capturedRootPath).toBeUndefined();
  });

  it("does not add an extra wildcard when the base sibling already ends in `[*]`", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: nestedRecordFieldParams(),
        config: { seriesPath: "series[*]", pointsField: "points", xField: "" },
      },
    });
    expect(capturedRootPath).toBe("series[*].points");
  });

  it("preserves absolute base paths that already end in `[*]`", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: nestedRecordFieldParams(),
        config: { seriesPath: "$.series[*]", pointsField: "points", xField: "" },
      },
    });
    expect(capturedRootPath).toBe("$.series[*].points");
  });

  it("preserves indexed base paths (`series[0]`) without inserting a wildcard", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: nestedRecordFieldParams(),
        config: { seriesPath: "series[0]", pointsField: "points", xField: "" },
      },
    });
    expect(capturedRootPath).toBe("series[0].points");
  });

  it("appends bracket-led suffixes directly when the base already ends in a bracket", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: nestedRecordFieldParams(),
        config: { seriesPath: "series[*]", pointsField: "[0].x", xField: "" },
      },
    });
    expect(capturedRootPath).toBe("series[*][0].x");
  });
});

describe("SchemaForm — record-field disabledWhen wiring", () => {
  afterEach(() => registerDataPathPicker(null));

  function disabledRecordFieldParams() {
    return {
      keyField: recordFieldParam(z.string().default("category"), {
        label: "Key field",
        placeholder: "field path",
        testId: "record-field-input",
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
  }

  it("disables the inner input and stops typed edits from emitting", async () => {
    const wrapper = mount(SchemaForm, {
      props: {
        params: disabledRecordFieldParams(),
        config: { keyField: "category" },
      },
    });
    const input = wrapper.find<HTMLInputElement>('input[data-testid="record-field-input"]');
    expect(input.exists()).toBe(true);
    expect(input.element.disabled).toBe(true);
    expect(input.element.value).toBe("category");

    await input.setValue("hacked");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("keyField" in (args[0] as Record<string, unknown>)))).toBe(
      true,
    );
  });

  it("disables the registered picker root and blocks picker-driven emits", async () => {
    registerDataPathPicker(FakePicker);
    const wrapper = mount(SchemaForm, {
      props: {
        params: disabledRecordFieldParams(),
        config: { keyField: "category" },
      },
    });
    const picker = wrapper.find<HTMLButtonElement>('[data-testid="keyField-record-field-picker"]');
    expect(picker.exists()).toBe(true);
    expect(picker.element.disabled).toBe(true);
    expect(picker.attributes("tabindex")).toBe("-1");
    expect(picker.attributes("aria-disabled")).toBe("true");

    picker.findComponent(FakePicker).vm.$emit("update:modelValue", "tampered");
    await wrapper.vm.$nextTick();
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("keyField" in (args[0] as Record<string, unknown>)))).toBe(
      true,
    );
  });

  it("leaves controls interactive when not disabledWhen-triggered", () => {
    registerDataPathPicker(FakePicker);
    const wrapper = mount(SchemaForm, {
      props: {
        params: recordFieldParams("category"),
        config: { keyField: "category" },
      },
    });
    const input = wrapper.find<HTMLInputElement>('input[data-testid="record-field-input"]');
    expect(input.element.disabled).toBe(false);
    const picker = wrapper.find<HTMLButtonElement>('[data-testid="keyField-record-field-picker"]');
    expect(picker.element.disabled).toBe(false);
    expect(picker.attributes("tabindex")).toBeUndefined();
    expect(picker.attributes("aria-disabled")).toBeUndefined();
  });
});

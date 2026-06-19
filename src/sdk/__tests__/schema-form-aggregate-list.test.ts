import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";

import SchemaForm from "../SchemaForm.vue";
import { Select } from "../component-ui-primitives";
import { registerDataPathPicker } from "../data-path-picker-adapter";
import { aggregateListParam, dataPathParam } from "../public-sdk";
import type { ComponentParams } from "../public-sdk";

interface AggregateRow {
  sourceField: string;
  operation: string;
  outputField: string;
}

function aggregateParams(initial: AggregateRow[] = []) {
  return {
    aggregates: aggregateListParam(z.array(z.unknown()).default(initial), {
      label: "Aggregate rows",
      helpText: "Compute per-group summaries.",
      operations: [
        { label: "Sum", value: "sum" },
        { label: "Min", value: "min" },
        { label: "Max", value: "max" },
        { label: "Average", value: "average" },
      ],
      addLabel: "Add aggregate",
      sourcePlaceholder: "field path",
      outputPlaceholder: "result name",
      testId: "aggregates",
    }),
  } satisfies ComponentParams;
}

function mountList(value: AggregateRow[]) {
  return mount(SchemaForm, {
    attachTo: document.body,
    props: { params: aggregateParams(), config: { aggregates: value } },
  });
}

describe("SchemaForm — aggregate-list control", () => {
  it("renders the empty-state message and add button when there are no rows", () => {
    const wrapper = mountList([]);
    expect(wrapper.find('[data-testid="aggregates"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="aggregates-aggregate-list-empty"]').exists()).toBe(true);
    const addButton = wrapper.find('[data-testid="aggregates-aggregate-list-add"]');
    expect(addButton.exists()).toBe(true);
    expect(addButton.text()).toContain("Add aggregate");
    expect(wrapper.text()).toContain("Aggregate rows");
  });

  it("renders source/operation/output controls for each row", () => {
    const wrapper = mountList([
      { sourceField: "revenue", operation: "sum", outputField: "revenue_total" },
    ]);
    const source = wrapper.find<HTMLInputElement>(
      '[data-testid="aggregates-aggregate-list-row-0-source"]',
    );
    const output = wrapper.find<HTMLInputElement>(
      '[data-testid="aggregates-aggregate-list-row-0-output"]',
    );
    expect(source.exists()).toBe(true);
    expect(source.element.value).toBe("revenue");
    expect(output.exists()).toBe(true);
    expect(output.element.value).toBe("revenue_total");
    expect(wrapper.find('[data-testid="aggregates-aggregate-list-row-0-operation"]').exists()).toBe(
      true,
    );
  });

  it("adds a visible neutral draft row without emitting invalid blank config", async () => {
    const wrapper = mountList([]);
    await wrapper.find('[data-testid="aggregates-aggregate-list-add"]').trigger("click");
    expect(wrapper.emitted("update:config")).toBeUndefined();
    const row = wrapper.find('[data-testid="aggregates-aggregate-list-row-0-row"]');
    expect(row.exists()).toBe(true);
    expect(row.attributes("data-row-invalid")).toBeUndefined();
    expect(
      wrapper.find('[data-testid="aggregates-aggregate-list-validation-empty"]').exists(),
    ).toBe(false);
    expect(
      wrapper
        .find('[data-testid="aggregates-aggregate-list-row-0-source"]')
        .attributes("aria-invalid"),
    ).toBeUndefined();
  });

  it("marks a blank draft row invalid after source-field blur", async () => {
    const wrapper = mountList([]);
    await wrapper.find('[data-testid="aggregates-aggregate-list-add"]').trigger("click");
    await wrapper.find('[data-testid="aggregates-aggregate-list-row-0-source"]').trigger("blur");
    expect(wrapper.emitted("update:config")).toBeUndefined();
    expect(
      wrapper
        .find('[data-testid="aggregates-aggregate-list-row-0-row"]')
        .attributes("data-row-invalid"),
    ).toBe("true");
    expect(
      wrapper
        .find('[data-testid="aggregates-aggregate-list-row-0-source"]')
        .attributes("aria-invalid"),
    ).toBe("true");
    expect(
      wrapper.find('[data-testid="aggregates-aggregate-list-validation-empty"]').exists(),
    ).toBe(true);
  });

  it("commits a draft row with the default operation when its source field becomes non-empty", async () => {
    const wrapper = mountList([]);
    await wrapper.find('[data-testid="aggregates-aggregate-list-add"]').trigger("click");
    await wrapper
      .find<HTMLInputElement>('[data-testid="aggregates-aggregate-list-row-0-source"]')
      .setValue("score");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      aggregates: [{ sourceField: "score", operation: "sum", outputField: "" }],
    });
  });

  it("commits a draft row with its current output field once source is filled", async () => {
    const wrapper = mountList([]);
    await wrapper.find('[data-testid="aggregates-aggregate-list-add"]').trigger("click");
    await wrapper
      .find<HTMLInputElement>('[data-testid="aggregates-aggregate-list-row-0-output"]')
      .setValue("score_total");
    expect(wrapper.emitted("update:config")).toBeUndefined();
    await wrapper
      .find<HTMLInputElement>('[data-testid="aggregates-aggregate-list-row-0-source"]')
      .setValue("score");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      aggregates: [{ sourceField: "score", operation: "sum", outputField: "score_total" }],
    });
  });

  it("emits update:config with the patched source field when typing", async () => {
    const wrapper = mountList([{ sourceField: "", operation: "sum", outputField: "" }]);
    await wrapper
      .find<HTMLInputElement>('[data-testid="aggregates-aggregate-list-row-0-source"]')
      .setValue("score");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      aggregates: [{ sourceField: "score", operation: "sum", outputField: "" }],
    });
  });

  it("keeps focus in the edited persisted aggregate row when parent config updates after typing", async () => {
    const wrapper = mountList([{ sourceField: "", operation: "sum", outputField: "" }]);
    const source = wrapper.find<HTMLInputElement>(
      '[data-testid="aggregates-aggregate-list-row-0-source"]',
    );

    source.element.focus();
    await source.setValue("score");
    await wrapper.setProps({
      config: { aggregates: [{ sourceField: "score", operation: "sum", outputField: "" }] },
    });

    const updatedSource = wrapper.find<HTMLInputElement>(
      '[data-testid="aggregates-aggregate-list-row-0-source"]',
    );
    expect(document.activeElement).toBe(updatedSource.element);
    expect(updatedSource.element.value).toBe("score");
  });

  it("emits update:config with the patched output field when typing", async () => {
    const wrapper = mountList([{ sourceField: "score", operation: "sum", outputField: "" }]);
    await wrapper
      .find<HTMLInputElement>('[data-testid="aggregates-aggregate-list-row-0-output"]')
      .setValue("score_total");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      aggregates: [{ sourceField: "score", operation: "sum", outputField: "score_total" }],
    });
  });

  it("emits update:config when the operation select changes", async () => {
    const wrapper = mountList([{ sourceField: "score", operation: "sum", outputField: "" }]);
    // The Select primitive owns update:modelValue while its trigger child
    // owns the data-testid; walk from the trigger to the parent Select so
    // we drive the same model the user would.
    const trigger = wrapper.find('[data-testid="aggregates-aggregate-list-row-0-operation"]');
    expect(trigger.exists()).toBe(true);
    const operationSelect = wrapper.findAllComponents(Select).at(0);
    expect(operationSelect?.exists()).toBe(true);
    operationSelect!.vm.$emit("update:modelValue", "average");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      aggregates: [{ sourceField: "score", operation: "average", outputField: "" }],
    });
  });

  it("removes the targeted row when its remove button is clicked", async () => {
    const wrapper = mountList([
      { sourceField: "score", operation: "sum", outputField: "" },
      { sourceField: "revenue", operation: "max", outputField: "revenue_max" },
    ]);
    await wrapper.find('[data-testid="aggregates-aggregate-list-row-0-remove"]').trigger("click");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      aggregates: [{ sourceField: "revenue", operation: "max", outputField: "revenue_max" }],
    });
  });

  it("surfaces a missing-source hint when any row has no source field", () => {
    const wrapper = mountList([{ sourceField: "", operation: "sum", outputField: "" }]);
    const hint = wrapper.find('[data-testid="aggregates-aggregate-list-validation-empty"]');
    expect(hint.exists()).toBe(true);
    expect(hint.attributes("role")).toBe("alert");
    expect(
      wrapper
        .find('[data-testid="aggregates-aggregate-list-row-0-source"]')
        .attributes("aria-invalid"),
    ).toBe("true");
  });
});

describe("SchemaForm — aggregate-list disabled state", () => {
  function disabledAggregateParams(initial: AggregateRow[] = []) {
    return {
      aggregates: aggregateListParam(z.array(z.unknown()).default(initial), {
        label: "Aggregate rows",
        operations: [
          { label: "Sum", value: "sum" },
          { label: "Min", value: "min" },
        ],
        addLabel: "Add aggregate",
        sourcePlaceholder: "field path",
        outputPlaceholder: "result name",
        testId: "aggregates",
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
  }

  function mountDisabled(value: AggregateRow[]) {
    return mount(SchemaForm, {
      attachTo: document.body,
      props: { params: disabledAggregateParams(), config: { aggregates: value } },
    });
  }

  it("disables source/output inputs, the operation select, and add/remove buttons", () => {
    const wrapper = mountDisabled([
      { sourceField: "revenue", operation: "sum", outputField: "revenue_total" },
    ]);
    const source = wrapper.find<HTMLInputElement>(
      '[data-testid="aggregates-aggregate-list-row-0-source"]',
    );
    const output = wrapper.find<HTMLInputElement>(
      '[data-testid="aggregates-aggregate-list-row-0-output"]',
    );
    expect(source.element.disabled).toBe(true);
    expect(output.element.disabled).toBe(true);
    expect(source.element.value).toBe("revenue");
    expect(output.element.value).toBe("revenue_total");
    const operationSelect = wrapper.findAllComponents(Select).at(0);
    expect(operationSelect?.props("disabled")).toBe(true);
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="aggregates-aggregate-list-row-0-remove"]')
        .element.disabled,
    ).toBe(true);
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="aggregates-aggregate-list-add"]').element
        .disabled,
    ).toBe(true);
  });

  it("does not emit update:config when typing into a disabled source or output", async () => {
    const wrapper = mountDisabled([{ sourceField: "revenue", operation: "sum", outputField: "" }]);
    await wrapper
      .find<HTMLInputElement>('[data-testid="aggregates-aggregate-list-row-0-source"]')
      .setValue("score");
    await wrapper
      .find<HTMLInputElement>('[data-testid="aggregates-aggregate-list-row-0-output"]')
      .setValue("score_total");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("aggregates" in (args[0] as Record<string, unknown>)))).toBe(
      true,
    );
  });

  it("does not emit update:config when the operation select tries to change while disabled", async () => {
    const wrapper = mountDisabled([{ sourceField: "revenue", operation: "sum", outputField: "" }]);
    const operationSelect = wrapper.findAllComponents(Select).at(0);
    operationSelect!.vm.$emit("update:modelValue", "min");
    await wrapper.vm.$nextTick();
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("aggregates" in (args[0] as Record<string, unknown>)))).toBe(
      true,
    );
  });

  it("does not emit update:config when clicking add or remove while disabled", async () => {
    const wrapper = mountDisabled([{ sourceField: "revenue", operation: "sum", outputField: "" }]);
    await wrapper.find('[data-testid="aggregates-aggregate-list-add"]').trigger("click");
    await wrapper.find('[data-testid="aggregates-aggregate-list-row-0-remove"]').trigger("click");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("aggregates" in (args[0] as Record<string, unknown>)))).toBe(
      true,
    );
  });
});

function scopedAggregateParams(initial: AggregateRow[]) {
  return {
    rowsPath: dataPathParam(z.string().default(""), {
      label: "Rows path",
      placeholder: "results",
    }),
    aggregates: aggregateListParam(z.array(z.unknown()).default(initial), {
      label: "Aggregate rows",
      operations: [
        { label: "Sum", value: "sum" },
        { label: "Min", value: "min" },
      ],
      addLabel: "Add aggregate",
      sourcePlaceholder: "field path",
      outputPlaceholder: "result name",
      sourcePickerRootPathKey: "rowsPath",
      testId: "aggregates",
    }),
  } satisfies ComponentParams;
}

describe("SchemaForm — aggregate-list source-picker scope", () => {
  // Captures the latest `rootPath` prop the source-field picker receives so
  // the test can assert that aggregate rows scope through the descriptor's
  // `sourcePickerRootPathKey`. Reset per-test so cross-test leakage is
  // impossible.
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

  afterEach(() => {
    registerDataPathPicker(null);
    capturedRootPath = undefined;
  });

  it("forwards the sibling `rowsPath` value as the picker rootPath when set", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: scopedAggregateParams([
          { sourceField: "revenue", operation: "sum", outputField: "" },
        ]),
        config: {
          rowsPath: "results",
          aggregates: [{ sourceField: "revenue", operation: "sum", outputField: "" }],
        },
      },
    });
    expect(capturedRootPath).toBe("results");
  });

  it("forwards the sibling `rowsPath` value to draft-row source pickers", async () => {
    registerDataPathPicker(RecordingPicker);
    const wrapper = mount(SchemaForm, {
      props: {
        params: scopedAggregateParams([]),
        config: {
          rowsPath: "results",
          aggregates: [],
        },
      },
    });
    await wrapper.find('[data-testid="aggregates-aggregate-list-add"]').trigger("click");
    expect(capturedRootPath).toBe("results");
  });

  it("omits rootPath when the sibling key is blank", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: scopedAggregateParams([
          { sourceField: "revenue", operation: "sum", outputField: "" },
        ]),
        config: {
          rowsPath: "",
          aggregates: [{ sourceField: "revenue", operation: "sum", outputField: "" }],
        },
      },
    });
    expect(capturedRootPath).toBeUndefined();
  });
});

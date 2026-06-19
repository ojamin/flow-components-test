import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";

import SchemaForm from "../SchemaForm.vue";
import { registerDataPathPicker } from "../data-path-picker-adapter";
import { dataPathParam, fieldListParam } from "../public-sdk";
import type { ComponentParams } from "../public-sdk";

function fieldListParams(initial: string[] = []) {
  return {
    groupByFields: fieldListParam(z.array(z.string().trim().min(1)).default(initial), {
      label: "Group by fields",
      helpText: "Rows with matching values fold into one row.",
      itemPlaceholder: "field path",
      addLabel: "Add field",
      testId: "group-by-fields",
    }),
  } satisfies ComponentParams;
}

function mountList(value: string[]) {
  return mount(SchemaForm, {
    attachTo: document.body,
    props: { params: fieldListParams(), config: { groupByFields: value } },
  });
}

function scopedFieldListParams() {
  return {
    rowsPath: dataPathParam(z.string().default(""), {
      label: "Rows path",
      placeholder: "results",
    }),
    groupByFields: fieldListParam(z.array(z.string().trim().min(1)).default([]), {
      label: "Group by fields",
      itemPlaceholder: "field path",
      addLabel: "Add field",
      pickerRootPathKey: "rowsPath",
      testId: "group-by-fields",
    }),
  } satisfies ComponentParams;
}

describe("SchemaForm — field-list control", () => {
  it("renders the empty-state message and add button when there are no rows", () => {
    const wrapper = mountList([]);
    const root = wrapper.find('[data-testid="group-by-fields"]');
    expect(root.exists()).toBe(true);
    expect(root.element.tagName.toLowerCase()).toBe("fieldset");
    expect(wrapper.find('[data-testid="groupByFields-field-list-empty"]').exists()).toBe(true);
    const addButton = wrapper.find('[data-testid="groupByFields-field-list-add"]');
    expect(addButton.exists()).toBe(true);
    expect(addButton.text()).toContain("Add field");
    expect(wrapper.text()).toContain("Group by fields");
    expect(wrapper.text()).toContain("Rows with matching values fold into one row.");
  });

  it("renders one input per entry and emits the patched array when editing a row", async () => {
    const wrapper = mountList(["region"]);
    const input = wrapper.find<HTMLInputElement>(
      '[data-testid="groupByFields-field-list-row-0-input"]',
    );
    expect(input.exists()).toBe(true);
    expect(input.element.value).toBe("region");
    await input.setValue("category");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      groupByFields: ["category"],
    });
  });

  it("keeps focus in the edited persisted row when parent config updates after typing", async () => {
    const wrapper = mountList(["region"]);
    const input = wrapper.find<HTMLInputElement>(
      '[data-testid="groupByFields-field-list-row-0-input"]',
    );

    input.element.focus();
    await input.setValue("category");
    await wrapper.setProps({ config: { groupByFields: ["category"] } });

    const updatedInput = wrapper.find<HTMLInputElement>(
      '[data-testid="groupByFields-field-list-row-0-input"]',
    );
    expect(document.activeElement).toBe(updatedInput.element);
    expect(updatedInput.element.value).toBe("category");
  });

  it("renders a local empty draft row neutrally without emitting invalid config when add is clicked", async () => {
    const wrapper = mountList(["region"]);
    await wrapper.find('[data-testid="groupByFields-field-list-add"]').trigger("click");
    const input = wrapper.find('[data-testid="groupByFields-field-list-row-1-input"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes("aria-invalid")).toBeUndefined();
    expect(
      wrapper
        .find('[data-testid="groupByFields-field-list-row-1-row"]')
        .attributes("data-row-invalid"),
    ).toBeUndefined();
    expect(wrapper.find('[data-testid="groupByFields-field-list-validation-empty"]').exists()).toBe(
      false,
    );
    expect(wrapper.emitted("update:config")).toBeUndefined();
  });

  it("shows the empty field-path message after a blank draft row is blurred", async () => {
    const wrapper = mountList(["region"]);
    await wrapper.find('[data-testid="groupByFields-field-list-add"]').trigger("click");
    const input = wrapper.find('[data-testid="groupByFields-field-list-row-1-input"]');

    await input.trigger("blur");

    const hint = wrapper.find('[data-testid="groupByFields-field-list-validation-empty"]');
    expect(hint.exists()).toBe(true);
    expect(hint.text()).toBe("Field path must not be empty.");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(wrapper.emitted("update:config")).toBeUndefined();
  });

  it("commits a draft row once it receives a non-empty field value", async () => {
    const wrapper = mountList(["region"]);
    await wrapper.find('[data-testid="groupByFields-field-list-add"]').trigger("click");
    await wrapper.find('[data-testid="groupByFields-field-list-row-1-input"]').setValue("category");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      groupByFields: ["region", "category"],
    });
  });

  it("removes the targeted row when its remove button is clicked", async () => {
    const wrapper = mountList(["region", "category"]);
    await wrapper.find('[data-testid="groupByFields-field-list-row-0-remove"]').trigger("click");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      groupByFields: ["category"],
    });
  });

  it("surfaces an empty-row hint when any field is blank", () => {
    const wrapper = mountList(["", "region"]);
    const hint = wrapper.find('[data-testid="groupByFields-field-list-validation-empty"]');
    expect(hint.exists()).toBe(true);
    expect(hint.text()).toBe("Field path must not be empty.");
    expect(hint.attributes("role")).toBe("alert");
    expect(
      wrapper
        .find('[data-testid="groupByFields-field-list-row-0-input"]')
        .attributes("aria-invalid"),
    ).toBe("true");
  });
});

describe("SchemaForm — field-list disabled state", () => {
  function disabledFieldListParams(initial: string[] = []) {
    return {
      groupByFields: fieldListParam(z.array(z.string().trim().min(1)).default(initial), {
        label: "Group by fields",
        helpText: "Rows with matching values fold into one row.",
        itemPlaceholder: "field path",
        addLabel: "Add field",
        testId: "group-by-fields",
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
  }

  function mountDisabled(value: string[]) {
    return mount(SchemaForm, {
      attachTo: document.body,
      props: { params: disabledFieldListParams(), config: { groupByFields: value } },
    });
  }

  it("keeps persisted rows visible but disables row inputs and the add/remove buttons", () => {
    const wrapper = mountDisabled(["region"]);
    const input = wrapper.find<HTMLInputElement>(
      '[data-testid="groupByFields-field-list-row-0-input"]',
    );
    expect(input.exists()).toBe(true);
    expect(input.element.value).toBe("region");
    expect(input.element.disabled).toBe(true);
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="groupByFields-field-list-row-0-remove"]')
        .element.disabled,
    ).toBe(true);
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="groupByFields-field-list-add"]').element
        .disabled,
    ).toBe(true);
  });

  it("does not emit update:config when typing into a disabled row", async () => {
    const wrapper = mountDisabled(["region"]);
    await wrapper
      .find<HTMLInputElement>('[data-testid="groupByFields-field-list-row-0-input"]')
      .setValue("category");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(
      emitted.every((args) => !("groupByFields" in (args[0] as Record<string, unknown>))),
    ).toBe(true);
  });

  it("does not emit update:config when clicking add while disabled", async () => {
    const wrapper = mountDisabled(["region"]);
    await wrapper.find('[data-testid="groupByFields-field-list-add"]').trigger("click");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(
      emitted.every((args) => !("groupByFields" in (args[0] as Record<string, unknown>))),
    ).toBe(true);
    expect(wrapper.find('[data-testid="groupByFields-field-list-row-1-input"]').exists()).toBe(
      false,
    );
  });

  it("does not emit update:config when clicking remove while disabled", async () => {
    const wrapper = mountDisabled(["region", "category"]);
    await wrapper.find('[data-testid="groupByFields-field-list-row-0-remove"]').trigger("click");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(
      emitted.every((args) => !("groupByFields" in (args[0] as Record<string, unknown>))),
    ).toBe(true);
  });
});

describe("SchemaForm — field-list picker scope", () => {
  // Captures the latest `rootPath` prop the picker receives so the test can
  // assert that field-list rows scope through the descriptor's
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

  afterEach(() => {
    registerDataPathPicker(null);
    capturedRootPath = undefined;
  });

  it("forwards the sibling `rowsPath` value as the picker rootPath when set", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: scopedFieldListParams(),
        config: { rowsPath: "results", groupByFields: ["region"] },
      },
    });
    expect(capturedRootPath).toBe("results");
  });

  it("omits rootPath when the sibling key is blank", () => {
    registerDataPathPicker(RecordingPicker);
    mount(SchemaForm, {
      props: {
        params: scopedFieldListParams(),
        config: { rowsPath: "", groupByFields: ["region"] },
      },
    });
    expect(capturedRootPath).toBeUndefined();
  });
});

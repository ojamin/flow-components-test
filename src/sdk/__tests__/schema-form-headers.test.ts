import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import SchemaForm from "../SchemaForm.vue";
import { Switch } from "../component-ui-primitives";
import { param } from "../public-sdk";
import type { ComponentParams, InputPortDefinition, ParamHeaderRow } from "../public-sdk";
import { headerRow, inputPort, mountForm } from "./schema-form-test-helpers";

describe("SchemaForm — headers control", () => {
  function headersParams() {
    return {
      requestHeaders: param(z.array(z.unknown()).default([]), {
        label: "Headers",
        helpText: "Custom request headers",
        control: { kind: "headers", testId: "request-headers" },
      }),
    } satisfies ComponentParams;
  }

  it("renders the headers fieldset with empty-state copy when there are no rows", () => {
    const wrapper = mountForm(headersParams(), { requestHeaders: [] });
    const root = wrapper.find('[data-testid="request-headers"]');
    expect(root.exists()).toBe(true);
    expect(root.element.tagName.toLowerCase()).toBe("fieldset");
    expect(wrapper.find('[data-testid="requestHeaders-headers-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="requestHeaders-headers-add"]').exists()).toBe(true);
  });

  it("renders one row per entry with key/value inputs, enabled toggle, and remove button", () => {
    const rows: ParamHeaderRow[] = [
      headerRow({ id: "row-1", key: "Accept", value: "application/json" }),
      headerRow({ id: "row-2", key: "X-Token", value: "abc", enabled: false }),
    ];
    const wrapper = mountForm(headersParams(), { requestHeaders: rows });
    expect(wrapper.find('[data-testid="requestHeaders-headers-empty"]').exists()).toBe(false);
    const keyInput = wrapper.find<HTMLInputElement>(
      '[data-testid="requestHeaders-headers-row-row-1-key"]',
    );
    const valueInput = wrapper.find<HTMLInputElement>(
      '[data-testid="requestHeaders-headers-row-row-1-value"]',
    );
    expect(keyInput.exists()).toBe(true);
    expect(keyInput.element.value).toBe("Accept");
    expect(keyInput.element.disabled).toBe(false);
    expect(valueInput.element.value).toBe("application/json");
    expect(
      wrapper.find<HTMLInputElement>('[data-testid="requestHeaders-headers-row-row-2-key"]').element
        .disabled,
    ).toBe(true);
    expect(
      wrapper.find<HTMLInputElement>('[data-testid="requestHeaders-headers-row-row-2-value"]')
        .element.disabled,
    ).toBe(true);
    expect(wrapper.find('[data-testid="requestHeaders-headers-row-row-1-enabled"]').exists()).toBe(
      true,
    );
    expect(wrapper.find('[data-testid="requestHeaders-headers-row-row-1-remove"]').exists()).toBe(
      true,
    );
  });

  it("emits update:config with the patched key when editing a row", async () => {
    const rows = [headerRow({ id: "row-1", key: "Accept", value: "application/json" })];
    const wrapper = mountForm(headersParams(), { requestHeaders: rows });
    await wrapper
      .find<HTMLInputElement>('[data-testid="requestHeaders-headers-row-row-1-key"]')
      .setValue("Authorization");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as
      | { requestHeaders?: ParamHeaderRow[] }
      | undefined;
    expect(last?.requestHeaders).toEqual([
      { id: "row-1", key: "Authorization", value: "application/json", enabled: true },
    ]);
  });

  it("emits update:config with the patched value when editing a row value", async () => {
    const wrapper = mountForm(headersParams(), {
      requestHeaders: [headerRow({ id: "row-1", key: "Accept", value: "" })],
    });
    await wrapper
      .find<HTMLInputElement>('[data-testid="requestHeaders-headers-row-row-1-value"]')
      .setValue("application/json");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      requestHeaders: [{ id: "row-1", key: "Accept", value: "application/json", enabled: true }],
    });
  });

  it("emits update:config with a new row when the add button is pressed", async () => {
    const wrapper = mountForm(headersParams(), { requestHeaders: [] });
    await wrapper.find('[data-testid="requestHeaders-headers-add"]').trigger("click");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as
      | { requestHeaders?: ParamHeaderRow[] }
      | undefined;
    expect(Array.isArray(last?.requestHeaders)).toBe(true);
    expect(last?.requestHeaders).toHaveLength(1);
    const created = last!.requestHeaders![0]!;
    expect(created.key).toBe("");
    expect(created.value).toBe("");
    expect(created.enabled).toBe(true);
    expect(typeof created.id).toBe("string");
    expect(created.id.length).toBeGreaterThan(0);
  });

  it("emits update:config without the removed row when the remove button is pressed", async () => {
    const rows: ParamHeaderRow[] = [
      headerRow({ id: "row-1", key: "Accept", value: "application/json" }),
      headerRow({ id: "row-2", key: "X-Token", value: "abc" }),
    ];
    const wrapper = mountForm(headersParams(), { requestHeaders: rows });
    await wrapper.find('[data-testid="requestHeaders-headers-row-row-1-remove"]').trigger("click");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      requestHeaders: [{ id: "row-2", key: "X-Token", value: "abc", enabled: true }],
    });
  });

  it("emits update:config with the toggled enabled flag when the row switch is flipped", async () => {
    const wrapper = mountForm(headersParams(), {
      requestHeaders: [headerRow({ id: "row-1", key: "Accept", value: "application/json" })],
    });
    const toggle = wrapper.findComponent<typeof Switch>(
      '[data-testid="requestHeaders-headers-row-row-1-enabled"]',
    );
    expect(toggle.exists()).toBe(true);
    toggle.vm.$emit("update:modelValue", false);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      requestHeaders: [{ id: "row-1", key: "Accept", value: "application/json", enabled: false }],
    });
  });

  it("surfaces an empty-key validation hint when an enabled row has no key", () => {
    const wrapper = mountForm(headersParams(), {
      requestHeaders: [headerRow({ id: "row-1", key: "", value: "abc" })],
    });
    const hint = wrapper.find('[data-testid="requestHeaders-headers-validation-empty"]');
    expect(hint.exists()).toBe(true);
    expect(hint.attributes("role")).toBe("alert");
    expect(
      wrapper
        .find('[data-testid="requestHeaders-headers-row-row-1-key"]')
        .attributes("aria-invalid"),
    ).toBe("true");
  });

  it("does not surface the empty-key hint for disabled rows", () => {
    const wrapper = mountForm(headersParams(), {
      requestHeaders: [headerRow({ id: "row-1", key: "", value: "abc", enabled: false })],
    });
    expect(wrapper.find('[data-testid="requestHeaders-headers-validation-empty"]').exists()).toBe(
      false,
    );
  });

  it("surfaces a duplicate-key validation hint when two enabled rows share a name", () => {
    const wrapper = mountForm(headersParams(), {
      requestHeaders: [
        headerRow({ id: "row-1", key: "Accept", value: "application/json" }),
        headerRow({ id: "row-2", key: "accept", value: "text/plain" }),
      ],
    });
    const hint = wrapper.find('[data-testid="requestHeaders-headers-validation-duplicate"]');
    expect(hint.exists()).toBe(true);
    expect(hint.attributes("role")).toBe("alert");
    expect(
      wrapper
        .find('[data-testid="requestHeaders-headers-row-row-1-key"]')
        .attributes("aria-invalid"),
    ).toBe("true");
    expect(
      wrapper
        .find('[data-testid="requestHeaders-headers-row-row-2-key"]')
        .attributes("aria-invalid"),
    ).toBe("true");
  });

  it("does not surface duplicate hint when one of the duplicates is disabled", () => {
    const wrapper = mountForm(headersParams(), {
      requestHeaders: [
        headerRow({ id: "row-1", key: "Accept", value: "application/json" }),
        headerRow({ id: "row-2", key: "Accept", value: "text/plain", enabled: false }),
      ],
    });
    expect(
      wrapper.find('[data-testid="requestHeaders-headers-validation-duplicate"]').exists(),
    ).toBe(false);
  });

  it("preserves untouched config keys when patching the headers field", async () => {
    const params = {
      requestHeaders: param(z.array(z.unknown()).default([]), {
        label: "Headers",
        control: { kind: "headers", testId: "request-headers" },
      }),
      timeoutMs: param(z.number().default(10_000), {
        label: "Timeout",
        control: { kind: "number", testId: "timeout-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { requestHeaders: [], timeoutMs: 10_000 });
    await wrapper.find('[data-testid="requestHeaders-headers-add"]').trigger("click");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as Record<string, unknown>;
    expect(last.timeoutMs).toBe(10_000);
    expect(Array.isArray(last.requestHeaders)).toBe(true);
  });

  it("does not duplicate the label row when a bindable headers field renders in literal mode", () => {
    const compatibleInputs: InputPortDefinition[] = [inputPort("params", ["all-data"])];
    const params = {
      requestHeaders: param(z.array(z.unknown()).default([]), {
        label: "Headers",
        helpText: "Custom request headers sent with each call.",
        control: { kind: "headers", testId: "request-headers" },
        bindable: true,
        bindFrom: [{ input: "params", typeId: "all-data" }],
      }),
    } satisfies ComponentParams;
    const wrapper = mount(SchemaForm, {
      props: { params, config: { requestHeaders: [] }, inputs: compatibleInputs },
    });
    expect(wrapper.find('[data-testid="requestHeaders-bind-toggle"]').exists()).toBe(true);
    expect(wrapper.findAll("label").filter((node) => node.text() === "Headers")).toHaveLength(1);
    expect(wrapper.find('[data-testid="requestHeaders-headers-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="requestHeaders-headers-add"]').exists()).toBe(true);
  });

  it("uses the descriptor's add label when rendering a bindable headers field in literal mode", () => {
    const compatibleInputs: InputPortDefinition[] = [inputPort("params", ["all-data"])];
    const params = {
      query: param(z.array(z.unknown()).default([]), {
        label: "Query parameters",
        helpText: "Appended to the URL as ?key=value pairs.",
        control: {
          kind: "headers",
          keyPlaceholder: "Param name",
          valuePlaceholder: "Param value",
          addLabel: "Add query parameter",
          testId: "request-query",
        },
        bindable: true,
        bindFrom: [{ input: "params", typeId: "all-data" }],
      }),
    } satisfies ComponentParams;
    const wrapper = mount(SchemaForm, {
      props: { params, config: { query: [] }, inputs: compatibleInputs },
    });
    const addButton = wrapper.find('[data-testid="query-headers-add"]');
    expect(addButton.exists()).toBe(true);
    expect(addButton.text()).toContain("Add query parameter");
  });

  it("renders query-parameter empty copy when the descriptor's addLabel targets query params", () => {
    const params = {
      query: param(z.array(z.unknown()).default([]), {
        label: "Query parameters",
        helpText: "Appended to the URL as ?key=value pairs.",
        control: {
          kind: "headers",
          keyPlaceholder: "Param name",
          valuePlaceholder: "Param value",
          addLabel: "Add query parameter",
          testId: "request-query",
        },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { query: [] });
    const empty = wrapper.find('[data-testid="query-headers-empty"]');
    expect(empty.exists()).toBe(true);
    expect(empty.text()).toBe("No query parameters yet. Add one to append a custom URL parameter.");
  });

  it("keeps the default header empty copy when the descriptor uses header-style addLabel", () => {
    const wrapper = mountForm(headersParams(), { requestHeaders: [] });
    const empty = wrapper.find('[data-testid="requestHeaders-headers-empty"]');
    expect(empty.exists()).toBe(true);
    expect(empty.text()).toBe("No headers yet. Add one to send a custom request header.");
  });
});

describe("SchemaForm — headers disabled state", () => {
  function disabledHeadersParams() {
    return {
      requestHeaders: param(z.array(z.unknown()).default([]), {
        label: "Headers",
        helpText: "Custom request headers",
        control: { kind: "headers", testId: "request-headers" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
  }

  it("keeps rows readable but disables key/value inputs, the enabled toggle, and add/remove buttons", () => {
    const rows = [headerRow({ id: "row-1", key: "Accept", value: "application/json" })];
    const wrapper = mountForm(disabledHeadersParams(), { requestHeaders: rows });
    const keyInput = wrapper.find<HTMLInputElement>(
      '[data-testid="requestHeaders-headers-row-row-1-key"]',
    );
    const valueInput = wrapper.find<HTMLInputElement>(
      '[data-testid="requestHeaders-headers-row-row-1-value"]',
    );
    expect(keyInput.element.value).toBe("Accept");
    expect(valueInput.element.value).toBe("application/json");
    expect(keyInput.element.disabled).toBe(true);
    expect(valueInput.element.disabled).toBe(true);
    const toggle = wrapper.findComponent<typeof Switch>(
      '[data-testid="requestHeaders-headers-row-row-1-enabled"]',
    );
    expect(toggle.props("disabled")).toBe(true);
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="requestHeaders-headers-row-row-1-remove"]')
        .element.disabled,
    ).toBe(true);
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="requestHeaders-headers-add"]').element
        .disabled,
    ).toBe(true);
  });

  it("does not emit update:config when typing into a disabled row input", async () => {
    const wrapper = mountForm(disabledHeadersParams(), {
      requestHeaders: [headerRow({ id: "row-1", key: "Accept", value: "" })],
    });
    await wrapper
      .find<HTMLInputElement>('[data-testid="requestHeaders-headers-row-row-1-value"]')
      .setValue("application/json");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(
      emitted.every((args) => !("requestHeaders" in (args[0] as Record<string, unknown>))),
    ).toBe(true);
  });

  it("does not emit update:config when toggling the row enabled switch while disabled", async () => {
    const wrapper = mountForm(disabledHeadersParams(), {
      requestHeaders: [headerRow({ id: "row-1", key: "Accept", value: "application/json" })],
    });
    const toggle = wrapper.findComponent<typeof Switch>(
      '[data-testid="requestHeaders-headers-row-row-1-enabled"]',
    );
    toggle.vm.$emit("update:modelValue", false);
    await wrapper.vm.$nextTick();
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(
      emitted.every((args) => !("requestHeaders" in (args[0] as Record<string, unknown>))),
    ).toBe(true);
  });

  it("does not emit update:config when clicking add or remove while disabled", async () => {
    const wrapper = mountForm(disabledHeadersParams(), {
      requestHeaders: [headerRow({ id: "row-1", key: "Accept", value: "application/json" })],
    });
    await wrapper.find('[data-testid="requestHeaders-headers-add"]').trigger("click");
    await wrapper.find('[data-testid="requestHeaders-headers-row-row-1-remove"]').trigger("click");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(
      emitted.every((args) => !("requestHeaders" in (args[0] as Record<string, unknown>))),
    ).toBe(true);
  });
});

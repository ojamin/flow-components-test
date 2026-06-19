import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import SchemaForm from "../SchemaForm.vue";
import SchemaFormChartAdapterField from "../SchemaFormChartAdapterField.vue";
import { ConfigSelector } from "../component-ui-primitives";
import { param } from "../public-sdk";
import type { ComponentParams, JsonValue, ParamDescriptor } from "../public-sdk";
import type { DatasetDerivationResponse, DatasetDerivationService } from "../runtime-services";

describe("SchemaForm — chart-adapter control", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const barRowsData: JsonValue = {
    rows: [
      { month: "Jan", revenue: 12000, activeUsers: 320 },
      { month: "Feb", revenue: 15400, activeUsers: 360 },
      { month: "Mar", revenue: 14950, activeUsers: 342 },
    ],
  };

  const donutRowsData: JsonValue = {
    segments: [
      { segment: "Pro", share: 0.62 },
      { segment: "Starter", share: 0.28 },
      { segment: "Free", share: 0.1 },
    ],
  };

  function barChartParams(): ComponentParams {
    return {
      rowsPath: param(z.string().default("rows"), {
        label: "Chart data",
        control: {
          kind: "chart-adapter",
          rowsKey: "rowsPath",
          rowsLabel: "Rows path",
          fields: [
            { key: "xField", role: "x", label: "X field" },
            { key: "yField", role: "y", label: "Y field" },
          ],
          testId: "bar-chart-adapter",
        },
      }),
      xField: param(z.string().default("month"), {
        label: "X field",
        control: { kind: "input" },
        visible: false,
      }),
      yField: param(z.string().default("revenue"), {
        label: "Y field",
        control: { kind: "input" },
        visible: false,
      }),
    } satisfies ComponentParams;
  }

  function donutChartParams(): ComponentParams {
    return {
      rowsPath: param(z.string().default("segments"), {
        label: "Donut data",
        control: {
          kind: "chart-adapter",
          rowsKey: "rowsPath",
          fields: [
            { key: "labelField", role: "label" },
            { key: "valueField", role: "value" },
          ],
          testId: "donut-chart-adapter",
        },
      }),
      labelField: param(z.string().default("segment"), {
        label: "Label",
        control: { kind: "input" },
        visible: false,
      }),
      valueField: param(z.string().default("share"), {
        label: "Value",
        control: { kind: "input" },
        visible: false,
      }),
    } satisfies ComponentParams;
  }

  function mountChartAdapter(
    params: ComponentParams,
    config: Record<string, unknown>,
    data: JsonValue | undefined,
    datasetDerivationService?: DatasetDerivationService,
  ) {
    return mount(SchemaForm, { props: { params, config, data, datasetDerivationService } });
  }

  async function flushServiceUpdates() {
    await Promise.resolve();
    await Promise.resolve();
  }

  function createChartFieldService(
    optionsByDatasetPath: Record<string, Array<{ path: string; roles: string[] }>>,
  ): DatasetDerivationService {
    return {
      derive: vi.fn(async (request): Promise<DatasetDerivationResponse> => {
        return {
          status: "success",
          requestId: request.requestId,
          kind: "chart-field-options",
          result: {
            chartFieldOptions: (optionsByDatasetPath[request.datasetPath] ?? []).map((option) => ({
              path: option.path,
              label: option.path,
              sampleValue: null,
              availableRowCount: 2,
              numericRowCount: option.roles.includes("y") || option.roles.includes("value") ? 2 : 0,
              categoricalRowCount:
                option.roles.includes("x") || option.roles.includes("label") ? 2 : 0,
              supportedRoles: option.roles as Array<"x" | "y" | "label" | "value">,
            })),
          },
        };
      }),
      clearCache: vi.fn(),
    };
  }

  function findSelectorByLabel(wrapper: ReturnType<typeof mount>, label: string) {
    const selector = wrapper
      .findAllComponents(ConfigSelector)
      .find((candidate) => candidate.props("label") === label);
    expect(selector, `ConfigSelector for "${label}" not found`).toBeDefined();
    return selector!;
  }

  it("renders the rows selector and one selector per declared field role", () => {
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "rows", xField: "month", yField: "revenue" },
      barRowsData,
    );
    const root = wrapper.find('[data-testid="bar-chart-adapter"]');
    expect(root.exists()).toBe(true);
    expect(root.element.tagName.toLowerCase()).toBe("fieldset");
    expect(wrapper.find('[data-testid="bar-chart-adapter-rows"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="bar-chart-adapter-field-xField"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="bar-chart-adapter-field-yField"]').exists()).toBe(true);
    const rowsSelector = findSelectorByLabel(wrapper, "Rows path");
    expect(rowsSelector.props("modelValue")).toBe("rows");
    expect(
      (rowsSelector.props("options") as ReadonlyArray<{ value: string }>).some(
        (option) => option.value === "rows",
      ),
    ).toBe(true);
    const xOptionValues = (
      findSelectorByLabel(wrapper, "X field").props("options") as ReadonlyArray<{ value: string }>
    ).map((option) => option.value);
    expect(xOptionValues).toEqual(expect.arrayContaining(["month", "revenue", "activeUsers"]));
    const yOptionValues = (
      findSelectorByLabel(wrapper, "Y field").props("options") as ReadonlyArray<{ value: string }>
    ).map((option) => option.value);
    expect(yOptionValues).toEqual(expect.arrayContaining(["revenue", "activeUsers"]));
    expect(yOptionValues).not.toContain("month");
  });

  it("emits a multi-key update:config patch when the rows path changes and resuggests dependent fields", async () => {
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "rows", xField: "month", yField: "revenue" },
      barRowsData,
    );
    findSelectorByLabel(wrapper, "Rows path").vm.$emit("update:modelValue", "missing-path");
    await wrapper.vm.$nextTick();
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as Record<string, unknown>;
    expect(last.rowsPath).toBe("missing-path");
    expect(last.xField).toBe("");
    expect(last.yField).toBe("");
  });

  it("preserves dependent fields when the rows path change keeps them valid", async () => {
    const dataWithTwoArrays: JsonValue = {
      rows: [
        { month: "Jan", revenue: 12000 },
        { month: "Feb", revenue: 15400 },
      ],
      altRows: [
        { month: "Mar", revenue: 14950 },
        { month: "Apr", revenue: 17120 },
      ],
    };
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "rows", xField: "month", yField: "revenue" },
      dataWithTwoArrays,
    );
    findSelectorByLabel(wrapper, "Rows path").vm.$emit("update:modelValue", "altRows");
    await wrapper.vm.$nextTick();
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as Record<string, unknown>;
    expect(last.rowsPath).toBe("altRows");
    expect(last.xField).toBe("month");
    expect(last.yField).toBe("revenue");
  });

  it("defers dependent field selector updates and emits only the latest pending field value", async () => {
    vi.useFakeTimers();
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "rows", xField: "month", yField: "revenue" },
      barRowsData,
    );
    findSelectorByLabel(wrapper, "Y field").vm.$emit("update:modelValue", "activeUsers");
    findSelectorByLabel(wrapper, "Y field").vm.$emit("update:modelValue", "revenue");
    findSelectorByLabel(wrapper, "Y field").vm.$emit("update:modelValue", "activeUsers");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:config")).toBeUndefined();

    await vi.runOnlyPendingTimersAsync();
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:config")).toHaveLength(1);
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toMatchObject({
      rowsPath: "rows",
      xField: "month",
      yField: "activeUsers",
    });
  });

  it("supports the donut mapping (label/value roles) through descriptor field roles", () => {
    const wrapper = mountChartAdapter(
      donutChartParams(),
      { rowsPath: "segments", labelField: "segment", valueField: "share" },
      donutRowsData,
    );
    expect(wrapper.find('[data-testid="donut-chart-adapter-rows"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="donut-chart-adapter-field-labelField"]').exists()).toBe(
      true,
    );
    expect(wrapper.find('[data-testid="donut-chart-adapter-field-valueField"]').exists()).toBe(
      true,
    );
    const labelOptionValues = (
      findSelectorByLabel(wrapper, "Label field").props("options") as ReadonlyArray<{
        value: string;
      }>
    ).map((option) => option.value);
    expect(labelOptionValues).toEqual(expect.arrayContaining(["segment", "share"]));
    const valueOptionValues = (
      findSelectorByLabel(wrapper, "Value field").props("options") as ReadonlyArray<{
        value: string;
      }>
    ).map((option) => option.value);
    expect(valueOptionValues).not.toContain("segment");
    expect(valueOptionValues).toContain("share");
  });

  it("uses the dataset derivation service for field suggestions when provided", async () => {
    const service = createChartFieldService({
      rows: [
        { path: "serviceMonth", roles: ["x", "label"] },
        { path: "serviceRevenue", roles: ["y", "value"] },
      ],
    });
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "rows", xField: "manualField", yField: "serviceRevenue" },
      barRowsData,
      service,
    );

    await flushServiceUpdates();
    await wrapper.vm.$nextTick();

    expect(service.derive).toHaveBeenCalledTimes(1);
    expect(vi.mocked(service.derive).mock.calls[0]?.[0]).toMatchObject({
      kind: "chart-field-options",
      datasetPath: "rows",
    });
    const xOptionValues = (
      findSelectorByLabel(wrapper, "X field").props("options") as ReadonlyArray<{
        value: string;
      }>
    ).map((option) => option.value);
    expect(xOptionValues).toEqual(["manualField", "serviceMonth"]);
    expect(xOptionValues).not.toContain("month");
  });

  it("caps service field suggestion rows while preserving an unsampled current field", async () => {
    const rows = Array.from({ length: 750 }, (_, index) => ({
      sampledField: `row-${index}`,
      measure: index,
      ...(index === 700 ? { lateField: "outside sample" } : {}),
    }));
    const service: DatasetDerivationService = {
      derive: vi.fn(async (request): Promise<DatasetDerivationResponse> => {
        const dataset = Array.isArray(request.dataset) ? request.dataset : [];
        return {
          status: "success",
          requestId: request.requestId,
          kind: "chart-field-options",
          result: {
            chartFieldOptions: [
              {
                path: "sampledField",
                label: "sampledField",
                sampleValue: null,
                availableRowCount: dataset.length,
                numericRowCount: 0,
                categoricalRowCount: dataset.length,
                supportedRoles: ["x"],
              },
              {
                path: "measure",
                label: "measure",
                sampleValue: null,
                availableRowCount: dataset.length,
                numericRowCount: dataset.length,
                categoricalRowCount: 0,
                supportedRoles: ["y"],
              },
            ],
          },
        };
      }),
      clearCache: vi.fn(),
    };
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "rows", xField: "lateField", yField: "measure" },
      { rows } as JsonValue,
      service,
    );

    await flushServiceUpdates();
    await wrapper.vm.$nextTick();

    const request = vi.mocked(service.derive).mock.calls[0]?.[0];
    const requestDataset = Array.isArray(request?.dataset) ? request.dataset : [];
    expect(requestDataset).toHaveLength(500);
    const xOptions = findSelectorByLabel(wrapper, "X field").props("options") as ReadonlyArray<{
      value: string;
      label: string;
    }>;
    const stale = xOptions.find((option) => option.value === "lateField");
    expect(stale, "unsampled current field should remain selectable").toBeDefined();
    expect(stale!.label).toContain("unavailable");
    expect(xOptions.map((option) => option.value)).toContain("sampledField");
  });

  it("keeps same-rows field changes on the cached service result without copying rows again", async () => {
    let rowsCopyCount = 0;
    const trackedRows = new Proxy(
      [
        { month: "Jan", revenue: 12000, activeUsers: 320 },
        { month: "Feb", revenue: 15400, activeUsers: 360 },
      ],
      {
        get(target, property, receiver) {
          if (property === Symbol.iterator) rowsCopyCount += 1;
          return Reflect.get(target, property, receiver) as unknown;
        },
      },
    );
    const service = createChartFieldService({
      rows: [
        { path: "month", roles: ["x"] },
        { path: "revenue", roles: ["y"] },
        { path: "activeUsers", roles: ["y"] },
      ],
    });
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "rows", xField: "month", yField: "revenue" },
      { rows: trackedRows } as JsonValue,
      service,
    );

    await flushServiceUpdates();
    await wrapper.vm.$nextTick();
    expect(service.derive).toHaveBeenCalledTimes(1);

    rowsCopyCount = 0;
    findSelectorByLabel(wrapper, "Y field").vm.$emit("update:modelValue", "activeUsers");
    await wrapper.setProps({
      config: { rowsPath: "rows", xField: "month", yField: "activeUsers" },
      data: { rows: trackedRows } as JsonValue,
    });
    await flushServiceUpdates();
    await wrapper.vm.$nextTick();

    expect(service.derive).toHaveBeenCalledTimes(1);
    expect(rowsCopyCount).toBe(0);
  });

  it("omits field-count summaries from rows options when service-backed suggestions are enabled", async () => {
    const service = createChartFieldService({ rows: [{ path: "serviceMonth", roles: ["x"] }] });
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "rows", xField: "serviceMonth", yField: "" },
      barRowsData,
      service,
    );
    await flushServiceUpdates();

    const rowsOptions = findSelectorByLabel(wrapper, "Rows path").props("options") as Array<{
      value: string;
      label: string;
    }>;
    const rowsOption = rowsOptions.find((option) => option.value === "rows");

    expect(rowsOption?.label).toBe("Rows · 3 rows");
    expect(rowsOption?.label).not.toContain("fields");
  });

  it("announces pending and failed dataset field suggestion status", async () => {
    let resolveDerivation: (() => void) | undefined;
    const service: DatasetDerivationService = {
      derive: vi.fn(
        (request) =>
          new Promise<DatasetDerivationResponse>((resolve) => {
            resolveDerivation = () =>
              resolve({
                status: "failure",
                requestId: request.requestId,
                error: { category: "worker-failure", message: "offline" },
              });
          }),
      ),
      clearCache: vi.fn(),
    };
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "rows", xField: "month", yField: "revenue" },
      barRowsData,
      service,
    );

    await wrapper.vm.$nextTick();
    let status = wrapper.find('[data-testid="bar-chart-adapter-rows-helper-status"]');
    expect(status.attributes("role")).toBe("status");
    expect(status.attributes("aria-live")).toBe("polite");
    expect(status.text()).toBe("Updating field suggestions…");

    expect(resolveDerivation, "service derivation promise should be pending").toBeDefined();
    resolveDerivation?.();
    await flushServiceUpdates();
    await wrapper.vm.$nextTick();

    status = wrapper.find('[data-testid="bar-chart-adapter-rows-helper-status"]');
    expect(status.text()).toBe(
      "Field suggestions unavailable. Keep the current field or choose another rows path.",
    );
  });

  it("resuggests dependent fields from the service result after a rows path change", async () => {
    const dataWithTwoArrays: JsonValue = {
      rows: [{ month: "Jan", revenue: 12000 }],
      altRows: [{ quarter: "Q1", total: 27400 }],
    };
    const service = createChartFieldService({
      rows: [
        { path: "month", roles: ["x", "label"] },
        { path: "revenue", roles: ["y", "value"] },
      ],
      altRows: [
        { path: "quarter", roles: ["x", "label"] },
        { path: "total", roles: ["y", "value"] },
      ],
    });
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "rows", xField: "month", yField: "revenue" },
      dataWithTwoArrays,
      service,
    );

    await flushServiceUpdates();
    findSelectorByLabel(wrapper, "Rows path").vm.$emit("update:modelValue", "altRows");
    await wrapper.setProps({
      config: { rowsPath: "altRows", xField: "month", yField: "revenue" },
    });
    await flushServiceUpdates();
    await wrapper.vm.$nextTick();

    expect(vi.mocked(service.derive).mock.calls.map((call) => call[0].datasetPath)).toContain(
      "altRows",
    );
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.at(-1)?.[0]).toMatchObject({
      rowsPath: "altRows",
      xField: "quarter",
      yField: "total",
    });
  });

  it("keeps the current rows path option visible with an unavailable suffix when missing from data", () => {
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "missing-rows", xField: "", yField: "" },
      barRowsData,
    );
    const rowsOptions = findSelectorByLabel(wrapper, "Rows path").props("options") as Array<{
      value: string;
      label: string;
    }>;
    const stale = rowsOptions.find((option) => option.value === "missing-rows");
    expect(stale, "stale rowsPath option should remain selectable").toBeDefined();
    expect(stale!.label).toContain("unavailable");
    expect(stale!.label).toContain("missing-rows");
  });

  it("keeps a dependent field's stale value visible when it no longer matches the resolved rows", () => {
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "rows", xField: "missingField", yField: "revenue" },
      barRowsData,
    );
    const xOptions = findSelectorByLabel(wrapper, "X field").props("options") as Array<{
      value: string;
      label: string;
    }>;
    const stale = xOptions.find((option) => option.value === "missingField");
    expect(stale, "stale xField option should remain selectable").toBeDefined();
    expect(stale!.label).toContain("unavailable");
    expect(wrapper.find('[data-testid="bar-chart-adapter-field-xField-validation"]').exists()).toBe(
      true,
    );
  });

  it("disables the rows selector and shows the no-data hint when no data is provided", () => {
    const wrapper = mountChartAdapter(
      barChartParams(),
      { rowsPath: "", xField: "", yField: "" },
      undefined,
    );
    expect(findSelectorByLabel(wrapper, "Rows path").props("disabled")).toBe(true);
    const root = wrapper.find('[data-testid="bar-chart-adapter"]');
    expect(root.attributes("data-no-data")).toBe("true");
    expect(wrapper.find('[data-testid="bar-chart-adapter-no-data"]').exists()).toBe(true);
    expect(findSelectorByLabel(wrapper, "X field").props("disabled")).toBe(true);
  });

  it("disables the rows selector when data has no detectable arrays of objects", () => {
    const wrapper = mountChartAdapter(barChartParams(), { rowsPath: "", xField: "", yField: "" }, {
      meta: { only: "scalars" },
    } as JsonValue);
    expect(findSelectorByLabel(wrapper, "Rows path").props("disabled")).toBe(true);
    expect(wrapper.find('[data-testid="bar-chart-adapter-no-data"]').exists()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// disabled prop contract
//
// `disabledWhen` predicates surface as a `disabled` prop on the chart-adapter
// field. While disabled, every inner selector must be non-interactive and
// every emit path (rows change, debounced field change, deferred service
// resuggest) must defensively no-op so config cannot mutate. The data-derived
// disabled state for empty/scalar data must keep working independently when
// the prop is false (covered by the existing tests above).
// ---------------------------------------------------------------------------

describe("SchemaFormChartAdapterField — disabled prop", () => {
  function barChartDescriptor(): ParamDescriptor {
    return param(z.string().default("rows"), {
      label: "Chart data",
      control: {
        kind: "chart-adapter",
        rowsKey: "rowsPath",
        rowsLabel: "Rows path",
        fields: [
          { key: "xField", role: "x", label: "X field" },
          { key: "yField", role: "y", label: "Y field" },
        ],
        testId: "bar-chart-adapter",
      },
    });
  }

  const barRows: JsonValue = {
    rows: [
      { month: "Jan", revenue: 12000, activeUsers: 320 },
      { month: "Feb", revenue: 15400, activeUsers: 360 },
    ],
  };

  function mountDirect(disabled: boolean) {
    return mount(SchemaFormChartAdapterField, {
      props: {
        fieldKey: "rowsPath",
        descriptor: barChartDescriptor(),
        config: { rowsPath: "rows", xField: "month", yField: "revenue" },
        data: barRows,
        disabled,
      },
    });
  }

  function findSelectorByLabel(wrapper: ReturnType<typeof mount>, label: string) {
    const selector = wrapper
      .findAllComponents(ConfigSelector)
      .find((candidate) => candidate.props("label") === label);
    expect(selector, `ConfigSelector for "${label}" not found`).toBeDefined();
    return selector!;
  }

  it("forwards disabled to the rows selector and every per-role field selector", () => {
    const wrapper = mountDirect(true);
    expect(findSelectorByLabel(wrapper, "Rows path").props("disabled")).toBe(true);
    expect(findSelectorByLabel(wrapper, "X field").props("disabled")).toBe(true);
    expect(findSelectorByLabel(wrapper, "Y field").props("disabled")).toBe(true);
  });

  it("blocks update:configPatch emits from a rows-path change while disabled", async () => {
    const wrapper = mountDirect(true);
    findSelectorByLabel(wrapper, "Rows path").vm.$emit("update:modelValue", "missing-path");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:configPatch")).toBeUndefined();
  });

  it("blocks deferred update:configPatch emits from field changes while disabled", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mountDirect(true);
      findSelectorByLabel(wrapper, "Y field").vm.$emit("update:modelValue", "activeUsers");
      await wrapper.vm.$nextTick();
      await vi.runOnlyPendingTimersAsync();
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:configPatch")).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("drops deferred field patches if disabled flips on before the timer fires", async () => {
    vi.useFakeTimers();
    try {
      const wrapper = mountDirect(false);
      findSelectorByLabel(wrapper, "Y field").vm.$emit("update:modelValue", "activeUsers");
      await wrapper.vm.$nextTick();
      await wrapper.setProps({ disabled: true });
      await vi.runOnlyPendingTimersAsync();
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:configPatch")).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("drops pending service-driven rows resuggest patches when disabled flips on mid-flight", async () => {
    let resolveDerivation: ((response: DatasetDerivationResponse) => void) | undefined;
    const service: DatasetDerivationService = {
      derive: vi.fn(
        (request) =>
          new Promise<DatasetDerivationResponse>((resolve) => {
            resolveDerivation = (response) =>
              resolve({ ...response, requestId: request.requestId });
          }),
      ),
      clearCache: vi.fn(),
    };
    const wrapper = mount(SchemaFormChartAdapterField, {
      props: {
        fieldKey: "rowsPath",
        descriptor: barChartDescriptor(),
        config: { rowsPath: "rows", xField: "month", yField: "revenue" },
        data: barRows,
        datasetDerivationService: service,
        disabled: false,
      },
    });

    findSelectorByLabel(wrapper, "Rows path").vm.$emit("update:modelValue", "rows");
    await wrapper.vm.$nextTick();
    await wrapper.setProps({ disabled: true });

    expect(resolveDerivation, "service derivation promise should be pending").toBeDefined();
    resolveDerivation?.({
      status: "success",
      requestId: "irrelevant — overwritten in the wrapper above",
      kind: "chart-field-options",
      result: {
        chartFieldOptions: [
          {
            path: "quarter",
            label: "quarter",
            sampleValue: null,
            availableRowCount: 2,
            numericRowCount: 0,
            categoricalRowCount: 2,
            supportedRoles: ["x"],
          },
        ],
      },
    });
    await Promise.resolve();
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted("update:configPatch") ?? [];
    // The synchronous "rows path picked" emit landed before disabled flipped,
    // but the deferred multi-key resuggest must not.
    const lateMultiKey = emitted.find((args) => Object.keys(args[0] as object).length > 1);
    expect(lateMultiKey).toBeUndefined();
  });

  it("preserves the existing data-derived disabled state when the prop is false", () => {
    const wrapper = mount(SchemaFormChartAdapterField, {
      props: {
        fieldKey: "rowsPath",
        descriptor: barChartDescriptor(),
        config: { rowsPath: "", xField: "", yField: "" },
        data: undefined,
        disabled: false,
      },
    });
    expect(findSelectorByLabel(wrapper, "Rows path").props("disabled")).toBe(true);
    expect(findSelectorByLabel(wrapper, "X field").props("disabled")).toBe(true);
    expect(wrapper.find('[data-testid="bar-chart-adapter-no-data"]').exists()).toBe(true);
  });
});

import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, onMounted, ref } from "vue";
import { z } from "zod";

import type { ComponentDefinition } from "@flow-builder/components/sdk";
import type { DatasetDerivationService } from "@flow-builder/components/runtime-services";

import RendererHostPane from "../RendererHostPane.vue";

const rows = [
  { region: "North", sales: 12, active: true },
  { region: "South", sales: 7, active: false },
];

const sha256 = `sha256:${"a".repeat(64)}` as const;

const DatasetServiceProbeRenderer = defineComponent({
  props: ["datasetDerivationService"],
  setup(props) {
    const status = ref("pending");

    onMounted(async () => {
      const service = props.datasetDerivationService as DatasetDerivationService | undefined;
      if (!service) {
        status.value = "missing-service";
        return;
      }

      const [tableResponse, chartResponse] = await Promise.all([
        service.derive({
          requestId: "table-preview-proof",
          kind: "table-columns",
          rootSource: { id: "fixture", contentHash: sha256 },
          datasetPath: "__root__",
          target: { componentId: "content.table" },
          materialization: { definitionHash: sha256 },
          configSignature: sha256,
          dataset: rows,
          table: {
            columnsMode: "selected",
            selectedColumns: ["region", "sales"],
            visibleStartIndex: 0,
            visibleRowCount: 2,
          },
        }),
        service.derive({
          requestId: "chart-preview-proof",
          kind: "chart-series-mapping",
          rootSource: { id: "fixture", contentHash: sha256 },
          datasetPath: "__root__",
          target: { componentId: "chart.bar" },
          materialization: { definitionHash: sha256 },
          configSignature: sha256,
          dataset: rows,
          chartSeriesMapping: {
            kind: "xy",
            xField: "region",
            yField: "sales",
          },
        }),
      ]);

      const tableColumns =
        tableResponse.status === "success"
          ? tableResponse.result.tableColumns?.map((column) => column.id)
          : [];
      const chartPointCount =
        chartResponse.status === "success"
          ? chartResponse.result.chartSeriesMappings?.[0]?.data.length
          : 0;

      status.value = `${tableColumns?.join(",")}:${chartPointCount}`;
    });

    return () => h("div", { "data-testid": "dataset-service-probe" }, status.value);
  },
});

function createDefinition(): ComponentDefinition {
  return {
    id: "test.preview.dataset-service",
    version: 1,
    displayName: "Dataset Service Probe",
    icon: "lucide:table",
    category: "content",
    renderable: true,
    slots: [],
    configSchema: z.object({}) as never,
    configDefaults: {} as never,
    params: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [],
    renderer: async () => DatasetServiceProbeRenderer,
    loadFixtureData: async () => rows,
  };
}

async function settlePreviewHost(): Promise<void> {
  for (let iteration = 0; iteration < 6; iteration += 1) {
    await flushPromises();
    await nextTick();
  }
}

describe("RendererHostPane — dataset derivation service", () => {
  test("passes a package-safe service into renderers for table and chart derivations", async () => {
    const wrapper = mount(RendererHostPane, {
      props: { definition: createDefinition() },
      attachTo: document.body,
    });

    await settlePreviewHost();

    expect(wrapper.get('[data-testid="dataset-service-probe"]').text()).toBe("region,sales:2");

    wrapper.unmount();
  });
});

import { expect } from "vitest";

import type {
  StaticComponentContractCase,
  StaticComponentRenderCase,
  StaticComponentTransformCase,
} from "../../../../testing";

export const contractCases = [
  {
    name: "declares optional data input plus passthrough output",
    check: ({ definition }) => {
      expect(definition.inputs).toEqual([
        {
          id: "data",
          label: "Data",
          mode: "full",
          acceptedTypeIds: ["all-data"],
          required: false,
          allowMultiple: false,
          allowCycle: false,
        },
      ]);
      expect(definition.outputs).toEqual([{ id: "all", label: "All data", typeId: "all-data" }]);
    },
  },
  {
    name: "declares params with bindable label and value",
    check: ({ definition }) => {
      expect(Object.keys(definition.params ?? {})).toEqual(["label", "value", "tone", "size"]);
      expect(definition.params?.label?.meta).toMatchObject({
        bindable: true,
        bindFrom: [{ input: "data", typeId: "all-data" }],
      });
      expect(definition.params?.value?.meta).toMatchObject({
        bindable: true,
        bindFrom: [{ input: "data", typeId: "all-data" }],
      });
      expect(definition.params?.tone?.meta.bindable).toBeUndefined();
      expect(definition.params?.size?.meta.bindable).toBeUndefined();
    },
  },
  {
    name: "declares source-owned theme roles consumed by the renderer",
    check: ({ definition }) => {
      expect(definition.themeContract?.consumes.map((entry) => entry.propertyKey)).toEqual([
        "color.accent",
        "color.border",
        "color.destructive",
        "color.foreground",
        "color.foregroundMuted",
        "color.surfaceMuted",
      ]);
    },
  },
] as const satisfies readonly StaticComponentContractCase[];

export const renderCases = [
  {
    name: "renders configured label and value",
    mountOptions: {
      props: {
        config: {
          label: "Sync service",
          value: "Operational",
          tone: "success",
          size: "md",
        },
      },
    },
    check: ({ wrapper }) => {
      expect(wrapper.find('[data-testid="status-badge"]').exists()).toBe(true);
      expect(wrapper.text()).toContain("Sync service");
      expect(wrapper.text()).toContain("Operational");
    },
  },
  {
    name: "renders an empty state when label and value are blank",
    mountOptions: {
      props: {
        config: {
          label: "",
          value: "",
          tone: "neutral",
          size: "md",
        },
      },
    },
    check: ({ wrapper }) => {
      expect(wrapper.find('[data-testid="status-badge-empty-state"]').exists()).toBe(true);
      expect(wrapper.text()).toContain("Add a status label or value.");
    },
  },
  {
    name: "applies the warning tone without relying on color alone",
    mountOptions: {
      props: {
        config: {
          label: "API latency",
          value: "Elevated",
          tone: "warning",
          size: "sm",
        },
      },
    },
    check: ({ wrapper }) => {
      const badge = wrapper.find('[data-testid="status-badge"]');
      expect(badge.classes().join(" ")).toContain("border-amber-500/35");
      expect(wrapper.text()).toContain("API latency");
      expect(wrapper.text()).toContain("Elevated");
    },
  },
] as const satisfies readonly StaticComponentRenderCase[];

export const transformCases = [
  {
    name: "passes data input to all",
    inputs: { data: { label: "Sync service", value: "Operational" } },
    check: ({ outputs }) => {
      expect(outputs.all).toEqual({ label: "Sync service", value: "Operational" });
    },
  },
  {
    name: "omits all output when no data input is connected",
    check: ({ outputs }) => {
      expect(outputs).toEqual({});
    },
  },
] as const satisfies readonly StaticComponentTransformCase[];

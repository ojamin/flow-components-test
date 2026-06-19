import { expect } from "vitest";

import type {
  StaticComponentContractCase,
  StaticComponentRenderCase,
  StaticComponentTransformCase,
} from "../../../../testing";

export const contractCases = [
  {
    name: "declares the optional full data input plus all-data passthrough output",
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
      expect(definition.outputs).toEqual([
        {
          id: "all",
          label: "All data",
          typeId: "all-data",
        },
      ]);
    },
  },
  {
    name: "description is user-facing and does not contain internal scaffold markers",
    check: ({ definition }) => {
      expect(definition.description).not.toContain("PRD-aligned");
    },
  },
  {
    name: "declares source-owned theme roles consumed by the renderer",
    check: ({ definition }) => {
      expect(definition.themeContract?.consumes.map((entry) => entry.propertyKey)).toEqual([
        "color.foreground",
        "color.foregroundMuted",
      ]);
    },
  },
  {
    name: "declares params with config parity and text-only bindability",
    check: ({ definition }) => {
      expect(Object.keys(definition.params ?? {})).toEqual([
        "text",
        "prose",
        "align",
        "clampLines",
      ]);
      const shape = (definition.configSchema as unknown as { shape: Record<string, unknown> })
        .shape;
      expect(definition.params?.text?.schema).toBe(shape.text);
      expect(definition.params?.prose?.schema).toBe(shape.prose);
      expect(definition.params?.align?.schema).toBe(shape.align);
      expect(definition.params?.clampLines?.schema).toBe(shape.clampLines);

      expect(definition.params?.text?.meta).toMatchObject({
        bindable: true,
        bindFrom: [{ input: "data", typeId: "all-data" }],
      });
      expect(definition.params?.prose?.meta.bindable).toBeUndefined();
      expect(definition.params?.align?.meta.bindable).toBeUndefined();
      expect(definition.params?.clampLines?.meta.bindable).toBeUndefined();
    },
  },
] as const satisfies readonly StaticComponentContractCase[];

export const renderCases = [
  {
    name: "renders the configured text body",
    mountOptions: {
      props: {
        config: {
          text: "Reusable folder contracts make later component work less fragile.",
          prose: false,
          align: "center",
        },
      },
    },
    check: ({ wrapper }) => {
      expect(wrapper.text()).toContain(
        "Reusable folder contracts make later component work less fragile.",
      );
    },
  },
  {
    name: "renders an empty-state hint when text is blank",
    mountOptions: {
      props: {
        config: {
          text: "",
        },
      },
    },
    check: ({ wrapper }) => {
      expect(wrapper.find('[data-testid="text-empty-state"]').exists()).toBe(true);
      // Harness injects fixture copy from sample-data.json; renderer has a separate fallback.
      expect(wrapper.text()).toContain("Add body copy or bind it from data.");
    },
  },
  {
    name: "empty state is a single muted line without faux-card chrome",
    mountOptions: {
      props: {
        config: {
          text: "",
        },
      },
    },
    check: ({ wrapper }) => {
      const emptyState = wrapper.find('[data-testid="text-empty-state"]');
      expect(emptyState.exists()).toBe(true);
      // Must not contain the old faux-card border+rounded container classes
      expect(emptyState.classes()).not.toContain("rounded-2xl");
      expect(emptyState.classes()).not.toContain("border-dashed");
    },
  },
  {
    // Task 6.12: paragraph and empty-state copy paint through the canonical
    // `text-ct-foreground` / `text-ct-foreground-muted` aliases so themed
    // descendants (Tabs/ViewStack/Card/Section slot content) stay readable
    // under the active component theme. The unscoped host `text-foreground`
    // / `text-muted-foreground` tokens must not survive.
    name: "paragraph and empty-state copy paint through component-theme aliases",
    mountOptions: {
      props: {
        config: {
          text: "Themed paragraph copy.",
          prose: false,
        },
      },
    },
    check: ({ wrapper }) => {
      const paragraph = wrapper.find('[data-testid="text-body"]');
      expect(paragraph.classes()).toContain("text-ct-foreground");
      expect(paragraph.classes()).not.toContain("text-foreground");
    },
  },
  {
    name: "empty-state copy uses text-ct-foreground-muted alias",
    mountOptions: { props: { config: { text: "" } } },
    check: ({ wrapper }) => {
      const emptyState = wrapper.find('[data-testid="text-empty-state"]');
      const paragraph = emptyState.find("p");
      expect(paragraph.classes()).toContain("text-ct-foreground-muted");
      expect(paragraph.classes()).not.toContain("text-muted-foreground");
    },
  },
] as const satisfies readonly StaticComponentRenderCase[];

export const transformCases = [
  {
    name: "passes the optional full data input through the all output",
    inputs: {
      data: {
        body: "Contract scaffolds keep transform tests readable.",
      },
    },
    check: ({ outputs }) => {
      expect(outputs).toEqual({
        all: {
          body: "Contract scaffolds keep transform tests readable.",
        },
      });
    },
  },
  {
    name: "omits the all output when no data input is connected",
    check: ({ outputs }) => {
      expect(outputs).toEqual({});
    },
  },
] as const satisfies readonly StaticComponentTransformCase[];

export const componentTestCases = {
  contractCases,
  renderCases,
  transformCases,
};

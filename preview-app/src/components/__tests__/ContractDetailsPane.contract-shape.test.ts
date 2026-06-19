// Focused contract-shape coverage for ContractDetailsPane params, events, and event outputs.

import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import ContractDetailsPane from "../ContractDetailsPane.vue";
import type { ComponentDefinition, ParamDescriptor } from "@flow-builder/components/sdk";
import type { EnrichedCatalogEntry } from "../../catalog-loader";

function makeDefinition(overrides: Partial<ComponentDefinition> = {}): ComponentDefinition {
  return {
    id: "test.component",
    version: 2,
    displayName: "Test Component",
    icon: "circle",
    category: "content",
    renderable: true,
    slots: [],
    configSchema: z.object({}),
    configDefaults: {},
    builder: {},
    flow: {},
    inputs: [],
    outputs: [],
    loadFixtureData: async () => undefined,
    ...overrides,
  } as ComponentDefinition;
}

function makeEntry(overrides: Partial<EnrichedCatalogEntry> = {}): EnrichedCatalogEntry {
  return {
    id: "test.component",
    group: "content",
    title: "Test Component",
    definition: undefined,
    section: "basic",
    ...overrides,
  } as EnrichedCatalogEntry;
}

describe("ContractDetailsPane contract shape sections", () => {
  // ── Params section ────────────────────────────────────────────────────────

  test("renders empty params message when definition has no params", () => {
    const def = makeDefinition();
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });
    expect(wrapper.find('[data-testid="params-section"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="params-empty"]').exists()).toBe(true);
  });

  test("renders param rows with schema summary, control kind, bindable badge, and bindFrom", () => {
    const params: Record<string, ParamDescriptor> = {
      title: {
        schema: z.string(),
        meta: {
          label: "Title",
          control: { kind: "input" },
        },
      },
      rows: {
        schema: z.array(z.object({ x: z.number(), y: z.number() })),
        meta: {
          label: "Rows",
          control: { kind: "code", language: "json" },
          bindable: true,
          bindFrom: [{ input: "data", typeId: "json-array" }],
        },
      },
    };
    const def = makeDefinition({ params });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    // Empty placeholder must NOT be present when there are params.
    expect(wrapper.find('[data-testid="params-empty"]').exists()).toBe(false);

    // Literal param: shows schema summary + control kind, no bindable badge.
    const titleRow = wrapper.find('[data-testid="param-row-title"]');
    expect(titleRow.exists()).toBe(true);
    expect(titleRow.text()).toContain("title");
    expect(titleRow.text()).toContain("string");
    expect(wrapper.find('[data-testid="param-control-title"]').text()).toBe("input");
    expect(wrapper.find('[data-testid="param-bindable-title"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="param-bindfrom-title"]').exists()).toBe(false);

    // Bindable param: schema summary surfaces array<...>, bindable badge + bindFrom row visible.
    const rowsRow = wrapper.find('[data-testid="param-row-rows"]');
    expect(rowsRow.exists()).toBe(true);
    expect(rowsRow.text()).toMatch(/array<object \{ x, y \}>/);
    expect(wrapper.find('[data-testid="param-control-rows"]').text()).toBe("code");
    expect(wrapper.find('[data-testid="param-bindable-rows"]').exists()).toBe(true);
    const bindFrom = wrapper.find('[data-testid="param-bindfrom-rows"]');
    expect(bindFrom.exists()).toBe(true);
    expect(bindFrom.text()).toContain("data:json-array");
  });

  // ── Events section ────────────────────────────────────────────────────────

  test("renders empty events message when definition has no events", () => {
    const def = makeDefinition();
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });
    expect(wrapper.find('[data-testid="events-section"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="events-empty"]').exists()).toBe(true);
  });

  test("renders event rows with label, description, and payload schema summary", () => {
    const def = makeDefinition({
      events: [
        {
          id: "submitted",
          label: "Submitted",
          description: "Fired when the user clicks the submit button.",
          payloadSchema: z.object({ name: z.string(), email: z.string() }),
        },
        {
          id: "selected",
          label: "Row selected",
          payloadSchema: z.object({ id: z.string() }),
          payloadTypeId: "json-object",
        },
      ],
    });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    expect(wrapper.find('[data-testid="events-empty"]').exists()).toBe(false);

    // Schema-summary fallback when no payloadTypeId is declared.
    const submitted = wrapper.find('[data-testid="event-row-submitted"]');
    expect(submitted.exists()).toBe(true);
    expect(submitted.text()).toContain("Submitted");
    expect(submitted.text()).toContain("Fired when the user clicks the submit button.");
    expect(wrapper.find('[data-testid="event-payload-submitted"]').text()).toMatch(
      /object \{ name, email \}/,
    );

    // payloadTypeId takes precedence over schema-shape summary.
    const selected = wrapper.find('[data-testid="event-row-selected"]');
    expect(selected.exists()).toBe(true);
    expect(wrapper.find('[data-testid="event-payload-selected"]').text()).toBe("json-object");
  });

  // ── Event outputs section ─────────────────────────────────────────────────

  test("does not render eventOutputs section when no eventOutputs are declared", () => {
    const def = makeDefinition();
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });
    expect(wrapper.find('[data-testid="event-outputs-section"]').exists()).toBe(false);
  });

  test("renders eventOutputs mappings with eventId → outputId and projection badge", () => {
    const def = makeDefinition({
      eventOutputs: [
        { eventId: "submitted", outputId: "submission" },
        { eventId: "selected", outputId: "selectedRow", project: (payload) => payload },
      ],
    });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    const section = wrapper.find('[data-testid="event-outputs-section"]');
    expect(section.exists()).toBe(true);

    const identity = wrapper.find('[data-testid="event-output-row-submitted"]');
    expect(identity.exists()).toBe(true);
    expect(identity.text()).toContain("submitted");
    expect(identity.text()).toContain("submission");
    expect(identity.text()).not.toContain("projected");

    const projected = wrapper.find('[data-testid="event-output-row-selected"]');
    expect(projected.exists()).toBe(true);
    expect(projected.text()).toContain("selected");
    expect(projected.text()).toContain("selectedRow");
    expect(projected.text()).toContain("projected");
  });

  // ── Async fixture resolution drives downstream sections ──────────────────

  test("params/events/eventOutputs sections render before async fixture resolves", () => {
    // Loading-state fixture must not block the contract-shape sections from rendering.
    const pending = new Promise<unknown>(() => {});
    const def = makeDefinition({
      loadFixtureData: () => pending,
      params: {
        title: { schema: z.string(), meta: { label: "Title", control: { kind: "input" } } },
      },
      events: [{ id: "clicked", label: "Clicked", payloadSchema: z.object({}) }],
      eventOutputs: [{ eventId: "clicked", outputId: "clicks" }],
    });
    const wrapper = mount(ContractDetailsPane, { props: { definition: def, entry: makeEntry() } });

    expect(wrapper.find('[data-testid="fixture-data-loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="param-row-title"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="event-row-clicked"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="event-output-row-clicked"]').exists()).toBe(true);
  });
});

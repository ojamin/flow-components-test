// Tests for ValidationStatusPane event-declaration drift: folds undeclared
// `emitEvent(id, …)` captures from RendererHostPane into the validation surface.

import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import ValidationStatusPane, { type CapturedRendererEvent } from "../ValidationStatusPane.vue";
import type { ComponentDefinition, ComponentManifestSummary } from "@flow-builder/components/sdk";

// Sequential capture ids mirror RendererHostPane's monotonic counter.
let nextCapturedEventId = 0;

function makeCapturedEvent(overrides: Partial<CapturedRendererEvent> = {}): CapturedRendererEvent {
  return {
    id: ++nextCapturedEventId,
    eventId: "undeclared.event",
    payload: undefined,
    status: "undeclared",
    message: 'Event "undeclared.event" is not declared on this component.',
    ...overrides,
  };
}

function makeDefinition(overrides: Partial<ComponentDefinition> = {}): ComponentDefinition {
  return {
    id: "test.component",
    version: 1,
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
    ...overrides,
  } as ComponentDefinition;
}

function makeManifestEntry(
  overrides: Partial<ComponentManifestSummary> = {},
): ComponentManifestSummary {
  return {
    id: "test.component",
    displayName: "Test Component",
    group: "content",
    source: "static",
    sourceId: "flow-components-test",
    version: "1.0.0",
    renderable: true,
    tags: [],
    sourcePath: "src/groups/content/test/component.ts",
    contentHash: "sha256:" + "a".repeat(64),
    ...overrides,
  };
}

describe("ValidationStatusPane event-declaration drift section", () => {
  test("renders the event-declaration-drift pane and its help text", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    expect(wrapper.find('[data-testid="event-declaration-drift-pane"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="event-declaration-drift-help-text"]').text()).toContain(
      "emitEvent",
    );
  });

  test("shows healthy state when no captured event has been forwarded", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    expect(wrapper.find('[data-testid="event-declaration-drift-healthy"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="event-declaration-drift-issues"]').exists()).toBe(false);
  });

  test("shows healthy state when latestCapturedEvent is null", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: {
        definition: makeDefinition(),
        manifestEntry: makeManifestEntry(),
        latestCapturedEvent: null,
      },
    });
    expect(wrapper.find('[data-testid="event-declaration-drift-healthy"]').exists()).toBe(true);
  });

  test("shows healthy state when the latest captured event is valid", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: {
        definition: makeDefinition(),
        manifestEntry: makeManifestEntry(),
        latestCapturedEvent: makeCapturedEvent({
          eventId: "click",
          status: "valid",
          message: undefined,
        }),
      },
    });
    expect(wrapper.find('[data-testid="event-declaration-drift-healthy"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="event-declaration-drift-issues"]').exists()).toBe(false);
  });

  test("shows healthy state when the latest captured event is invalid (declared but bad payload)", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: {
        definition: makeDefinition(),
        manifestEntry: makeManifestEntry(),
        latestCapturedEvent: makeCapturedEvent({
          eventId: "submit",
          status: "invalid",
          message: "Payload failed validation.",
        }),
      },
    });
    expect(wrapper.find('[data-testid="event-declaration-drift-healthy"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="event-declaration-drift-issues"]').exists()).toBe(false);
  });

  test("surfaces an undeclared event as an event-declaration drift issue with id and message", () => {
    const wrapper = mount(ValidationStatusPane, {
      props: {
        definition: makeDefinition(),
        manifestEntry: makeManifestEntry(),
        latestCapturedEvent: makeCapturedEvent({
          eventId: "foo",
          status: "undeclared",
          message: 'Event "foo" is not declared on this component.',
        }),
      },
    });
    const issue = wrapper.find('[data-testid="event-declaration-drift-issue-foo"]');
    expect(issue.exists()).toBe(true);
    expect(issue.text()).toContain("foo");
    expect(issue.text()).toContain("not declared");
    expect(issue.classes()).toContain("text-destructive");
    expect(wrapper.find('[data-testid="event-declaration-drift-healthy"]').exists()).toBe(false);
  });

  test("falls back to a default message when the captured event has no message", async () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    await wrapper.setProps({
      latestCapturedEvent: makeCapturedEvent({
        eventId: "bar",
        status: "undeclared",
        message: undefined,
      }),
    });
    const issue = wrapper.find('[data-testid="event-declaration-drift-issue-bar"]');
    expect(issue.exists()).toBe(true);
    expect(issue.text()).toContain('Event "bar" is not declared');
  });

  test("accumulates multiple distinct undeclared event ids across prop updates", async () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    await wrapper.setProps({
      latestCapturedEvent: makeCapturedEvent({ eventId: "foo" }),
    });
    await wrapper.setProps({
      latestCapturedEvent: makeCapturedEvent({ eventId: "bar" }),
    });
    const issues = wrapper.findAll('[data-testid^="event-declaration-drift-issue-"]');
    expect(issues).toHaveLength(2);
    expect(wrapper.find('[data-testid="event-declaration-drift-issue-foo"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="event-declaration-drift-issue-bar"]').exists()).toBe(true);
  });

  test("dedupes repeated undeclared captures of the same event id into a single entry", async () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    await wrapper.setProps({
      latestCapturedEvent: makeCapturedEvent({ eventId: "foo", message: "first" }),
    });
    await wrapper.setProps({
      latestCapturedEvent: makeCapturedEvent({ eventId: "foo", message: "second" }),
    });
    const issues = wrapper.findAll('[data-testid^="event-declaration-drift-issue-"]');
    expect(issues).toHaveLength(1);
    // Latest message wins so authors see the most recent diagnostic detail.
    expect(wrapper.find('[data-testid="event-declaration-drift-issue-foo"]').text()).toContain(
      "second",
    );
  });

  test("ignores valid captures interleaved between undeclared captures", async () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    await wrapper.setProps({
      latestCapturedEvent: makeCapturedEvent({ eventId: "foo", status: "undeclared" }),
    });
    await wrapper.setProps({
      latestCapturedEvent: makeCapturedEvent({
        eventId: "click",
        status: "valid",
        message: undefined,
      }),
    });
    // The valid emit must not clear the previously captured undeclared drift.
    expect(wrapper.find('[data-testid="event-declaration-drift-issue-foo"]').exists()).toBe(true);
  });

  test("resets accumulated drift when the selected component definition changes", async () => {
    const wrapper = mount(ValidationStatusPane, {
      props: { definition: makeDefinition(), manifestEntry: makeManifestEntry() },
    });
    await wrapper.setProps({
      latestCapturedEvent: makeCapturedEvent({ eventId: "foo" }),
    });
    expect(wrapper.find('[data-testid="event-declaration-drift-issue-foo"]').exists()).toBe(true);

    // Switch to a different component selection and clear the latest event the
    // way ComponentBrowserView does on selection change.
    await wrapper.setProps({
      definition: makeDefinition({ id: "test.other" }),
      latestCapturedEvent: null,
    });
    expect(wrapper.find('[data-testid="event-declaration-drift-issue-foo"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="event-declaration-drift-healthy"]').exists()).toBe(true);
  });
});

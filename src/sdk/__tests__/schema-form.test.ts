import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ConfigSelector, Input, Switch } from "../component-ui-primitives";
import { param } from "../public-sdk";
import type { ComponentParams } from "../public-sdk";
import { mountForm } from "./schema-form-test-helpers";

describe("SchemaForm — base controls", () => {
  it("renders an input control and emits update:config with the patched value", async () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", placeholder: "Untitled", testId: "title-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { title: "Hello" });
    const input = wrapper.find<HTMLInputElement>('input[data-testid="title-input"]');
    expect(input.exists()).toBe(true);
    expect(input.element.value).toBe("Hello");
    expect(input.attributes("placeholder")).toBe("Untitled");
    await input.setValue("World");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ title: "World" });
  });

  it("renders a textarea control with descriptor rows and emits patched updates", async () => {
    const params = {
      body: param(z.string().default(""), {
        label: "Body",
        control: { kind: "textarea", rows: 5, placeholder: "Body…", testId: "body-area" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { body: "old" });
    const textarea = wrapper.find<HTMLTextAreaElement>('textarea[data-testid="body-area"]');
    expect(textarea.exists()).toBe(true);
    expect(textarea.attributes("rows")).toBe("5");
    expect(textarea.attributes("placeholder")).toBe("Body…");
    await textarea.setValue("new content");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ body: "new content" });
  });

  it("renders a number input with min/max/step and emits Number-coerced values", async () => {
    const params = {
      count: param(z.number().default(1), {
        label: "Count",
        control: { kind: "number", min: 0, max: 10, step: 1, testId: "count-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { count: 1 });
    const input = wrapper.find<HTMLInputElement>('input[data-testid="count-input"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes("type")).toBe("number");
    expect(input.attributes("min")).toBe("0");
    expect(input.attributes("max")).toBe("10");
    expect(input.attributes("step")).toBe("1");
    await input.setValue("42");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as Record<string, unknown>;
    expect(last).toEqual({ count: 42 });
    expect(typeof last.count).toBe("number");
  });

  it("rejects non-finite number input, retains previous value, and shows inline hint", async () => {
    const params = {
      count: param(z.number().default(0), {
        label: "Count",
        control: { kind: "number", testId: "count-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { count: 5 });
    const inputComponent = wrapper.findComponent(Input);
    expect(inputComponent.exists()).toBe(true);
    inputComponent.vm.$emit("update:modelValue", "abc");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:config")).toBeUndefined();
    const hint = wrapper.find('[data-testid="count-number-validation-hint"]');
    expect(hint.exists()).toBe(true);
    expect(hint.attributes("role")).toBe("alert");
    const input = wrapper.find<HTMLInputElement>('input[data-testid="count-input"]');
    expect(input.attributes("aria-invalid")).toBe("true");
    inputComponent.vm.$emit("update:modelValue", "7");
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="count-number-validation-hint"]').exists()).toBe(false);
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as Record<string, unknown>;
    expect(last).toEqual({ count: 7 });
    expect(typeof last.count).toBe("number");
  });

  it("renders a select control via ConfigSelector and emits the chosen value", async () => {
    const params = {
      variant: param(z.string().default("primary"), {
        label: "Variant",
        control: {
          kind: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
          ],
          testId: "variant-select",
        },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { variant: "primary" });
    const selector = wrapper.findComponent(ConfigSelector);
    expect(selector.exists()).toBe(true);
    expect(selector.props("modelValue")).toBe("primary");
    expect(selector.props("label")).toBe("Variant");
    expect(selector.props("options")).toEqual([
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
    ]);
    selector.vm.$emit("update:modelValue", "secondary");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ variant: "secondary" });
  });

  it("renders a boolean Switch and emits update:config on toggle", async () => {
    const params = {
      enabled: param(z.boolean().default(false), {
        label: "Enabled",
        control: { kind: "boolean", testId: "enabled-switch" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { enabled: false });
    const switchComponent = wrapper.findComponent(Switch);
    expect(switchComponent.exists()).toBe(true);
    expect(switchComponent.props("modelValue")).toBe(false);
    expect(switchComponent.attributes("aria-label")).toBe("Enabled");
    switchComponent.vm.$emit("update:modelValue", true);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ enabled: true });
  });

  it("renders a color input and emits the patched hex string", async () => {
    const params = {
      accent: param(z.string().default("#000000"), {
        label: "Accent",
        control: { kind: "color", testId: "accent-color" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { accent: "#000000" });
    const input = wrapper.find<HTMLInputElement>('input[data-testid="accent-color"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes("type")).toBe("color");
    await input.setValue("#ff0044");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ accent: "#ff0044" });
  });

  it("renders a code control as a font-mono textarea and emits patched updates", async () => {
    const params = {
      payload: param(z.string().default("{}"), {
        label: "Payload",
        control: { kind: "code", language: "json", testId: "payload-code" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { payload: "{}" });
    const textarea = wrapper.find<HTMLTextAreaElement>('textarea[data-testid="payload-code"]');
    expect(textarea.exists()).toBe(true);
    expect(textarea.classes()).toContain("font-mono");
    await textarea.setValue('{"a":1}');
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ payload: '{"a":1}' });
  });

  it("preserves untouched config keys when patching a single field", async () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
      }),
      enabled: param(z.boolean().default(false), {
        label: "Enabled",
        control: { kind: "boolean", testId: "enabled-switch" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { title: "Hi", enabled: true });
    await wrapper.find<HTMLInputElement>('input[data-testid="title-input"]').setValue("Hi there");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({
      title: "Hi there",
      enabled: true,
    });
  });
});

describe("SchemaForm — empty state", () => {
  // Slice C contract: when a component has no params or every param is hidden,
  // the Config tab must not render an empty grid. SchemaForm shows a single
  // muted sentence so the inspector communicates that the component is
  // intentionally configurable but currently exposes nothing to edit.
  it("renders muted copy when params is empty", () => {
    const wrapper = mountForm({} satisfies ComponentParams, {});
    const empty = wrapper.find('[data-testid="schema-form-empty"]');
    expect(empty.exists()).toBe(true);
    expect(empty.text()).toBe("No configurable fields.");
    expect(empty.classes()).toContain("text-muted-foreground");
    const cardChrome = /^(border(?:-|$)|rounded-(?:xl|2xl|3xl)$|shadow-|bg-card$)/;
    expect(empty.classes().find((cls) => cardChrome.test(cls))).toBeUndefined();
  });

  it("renders muted copy when every param is hidden via meta.visible:false", () => {
    const params = {
      x: param(z.string().default(""), {
        label: "X",
        visible: false,
        control: { kind: "input", testId: "x-input" },
      }),
      y: param(z.string().default(""), {
        label: "Y",
        visible: false,
        control: { kind: "input", testId: "y-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { x: "", y: "" });
    expect(wrapper.find('[data-testid="schema-form-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-field="x"]').exists()).toBe(false);
    expect(wrapper.find('[data-field="y"]').exists()).toBe(false);
  });

  it("does not render empty state when at least one visible field is present", () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { title: "" });
    expect(wrapper.find('[data-testid="schema-form-empty"]').exists()).toBe(false);
    expect(wrapper.find('[data-field="title"]').exists()).toBe(true);
  });
});

describe("SchemaForm — meta.group rendering", () => {
  it("renders ungrouped fields flat without any group container", () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
      }),
      body: param(z.string().default(""), {
        label: "Body",
        control: { kind: "textarea", testId: "body-area" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { title: "", body: "" });
    expect(wrapper.findAll("details")).toHaveLength(0);
    expect(wrapper.find("[data-group]").exists()).toBe(false);
    expect(wrapper.find('[data-slot="collapsible"]').exists()).toBe(false);
    const root = wrapper.find('[data-testid="schema-form"]');
    const titleField = root.find('[data-field="title"]');
    const bodyField = root.find('[data-field="body"]');
    expect(titleField.exists()).toBe(true);
    expect(bodyField.exists()).toBe(true);
    expect(titleField.element.parentElement).toBe(root.element);
    expect(bodyField.element.parentElement).toBe(root.element);
  });

  it("renders fields sharing meta.group under a single flat disclosure section", () => {
    const params = {
      headline: param(z.string().default(""), {
        label: "Headline",
        group: "Typography",
        control: { kind: "input", testId: "headline-input" },
      }),
      body: param(z.string().default(""), {
        label: "Body",
        group: "Typography",
        control: { kind: "textarea", testId: "body-area" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { headline: "", body: "" });
    const groups = wrapper.findAll('[data-testid="schema-form-group-Typography"]');
    expect(groups).toHaveLength(1);
    const group = groups[0]!;
    expect(group.attributes("data-group")).toBe("Typography");
    expect(group.attributes("data-state")).toBe("open");
    const header = group.find('[data-testid="schema-form-group-Typography-header"]');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain("Typography");
    expect(group.findAll("[data-field]").map((field) => field.attributes("data-field"))).toEqual([
      "headline",
      "body",
    ]);
  });

  it("keeps ungrouped fields outside group containers when groups are present", () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
      }),
      headline: param(z.string().default(""), {
        label: "Headline",
        group: "Typography",
        control: { kind: "input", testId: "headline-input" },
      }),
      footer: param(z.string().default(""), {
        label: "Footer",
        control: { kind: "input", testId: "footer-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { title: "", headline: "", footer: "" });
    const root = wrapper.find('[data-testid="schema-form"]');
    expect(root.find('[data-field="title"]').element.parentElement).toBe(root.element);
    expect(root.find('[data-field="footer"]').element.parentElement).toBe(root.element);
    const group = root.find('[data-testid="schema-form-group-Typography"]');
    expect(group.exists()).toBe(true);
    expect(group.attributes("data-group")).toBe("Typography");
    expect(group.find('[data-field="headline"]').exists()).toBe(true);
    expect(root.find('[data-field="headline"]').element.parentElement).not.toBe(root.element);
  });

  it("renders one disclosure per group and no chrome for ungrouped fields", () => {
    const params = {
      title: param(z.string().default(""), {
        label: "Title",
        control: { kind: "input", testId: "title-input" },
      }),
      headline: param(z.string().default(""), {
        label: "Headline",
        group: "Typography",
        control: { kind: "input", testId: "headline-input" },
      }),
      bg: param(z.string().default("#ffffff"), {
        label: "Background",
        group: "Appearance",
        control: { kind: "color", testId: "bg-color" },
      }),
      body: param(z.string().default(""), {
        label: "Body",
        group: "Typography",
        control: { kind: "textarea", testId: "body-area" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { title: "", headline: "", bg: "#ffffff", body: "" });
    expect(wrapper.findAll("[data-group]").map((group) => group.attributes("data-group"))).toEqual([
      "Typography",
      "Appearance",
    ]);
    expect(wrapper.find('[data-testid="schema-form-group-Typography"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="schema-form-group-Typography-header"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="schema-form-group-Appearance"]').exists()).toBe(true);
    const typographyFields = wrapper
      .find('[data-testid="schema-form-group-Typography"]')
      .findAll("[data-field]");
    expect(typographyFields.map((field) => field.attributes("data-field"))).toEqual([
      "headline",
      "body",
    ]);
  });

  it("does not introduce card/faux-card chrome around group sections", () => {
    const params = {
      headline: param(z.string().default(""), {
        label: "Headline",
        group: "Typography",
        control: { kind: "input", testId: "headline-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { headline: "" });
    const group = wrapper.find('[data-testid="schema-form-group-Typography"]');
    expect(group.exists()).toBe(true);
    const cardChrome = /^(border(?:-|$)|rounded-(?:xl|2xl|3xl)$|shadow-(?:md|lg|xl|2xl)$|bg-card$)/;
    expect(group.classes().find((cls) => cardChrome.test(cls))).toBeUndefined();
    expect(
      group
        .find('[data-testid="schema-form-group-Typography-header"]')
        .classes()
        .find((cls) => cardChrome.test(cls)),
    ).toBeUndefined();
  });

  it("still emits update:config from controls rendered inside a group", async () => {
    const params = {
      headline: param(z.string().default(""), {
        label: "Headline",
        group: "Typography",
        control: { kind: "input", testId: "headline-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { headline: "Old" });
    const input = wrapper
      .find('[data-testid="schema-form-group-Typography"]')
      .find<HTMLInputElement>('input[data-testid="headline-input"]');
    expect(input.exists()).toBe(true);
    await input.setValue("New");
    expect(wrapper.emitted("update:config")?.at(-1)?.[0]).toEqual({ headline: "New" });
  });
});

describe("SchemaForm — group collapse persistence", () => {
  // Locks in the Slice B contract: a user-collapsed group must survive any
  // re-render that would otherwise reset uncontrolled disclosure state, e.g.
  // the parent emitting a fresh `config` on every keystroke.
  const groupedParams = {
    headline: param(z.string().default(""), {
      label: "Headline",
      group: "Typography",
      control: { kind: "input", testId: "headline-input" },
    }),
    body: param(z.string().default(""), {
      label: "Body",
      group: "Typography",
      control: { kind: "textarea", testId: "body-area" },
    }),
  } satisfies ComponentParams;

  it("renders each group expanded by default", () => {
    const wrapper = mountForm(groupedParams, { headline: "", body: "" });
    const group = wrapper.find('[data-testid="schema-form-group-Typography"]');
    expect(group.exists()).toBe(true);
    expect(group.attributes("data-state")).toBe("open");
  });

  it("collapses the group when the header trigger is activated", async () => {
    const wrapper = mountForm(groupedParams, { headline: "", body: "" });
    const header = wrapper.find('[data-testid="schema-form-group-Typography-header"]');
    expect(header.exists()).toBe(true);
    await header.trigger("click");
    const group = wrapper.find('[data-testid="schema-form-group-Typography"]');
    expect(group.attributes("data-state")).toBe("closed");
  });

  it("keeps a collapsed group closed across config-driven re-renders", async () => {
    const wrapper = mountForm(groupedParams, { headline: "", body: "" });
    await wrapper.find('[data-testid="schema-form-group-Typography-header"]').trigger("click");
    expect(
      wrapper.find('[data-testid="schema-form-group-Typography"]').attributes("data-state"),
    ).toBe("closed");

    // Simulate a parent committing a config patch (the common cause of the
    // previous `<details :open="true">` reset bug).
    await wrapper.setProps({ config: { headline: "Updated headline", body: "" } });
    await wrapper.setProps({ config: { headline: "Updated headline", body: "Updated body" } });

    expect(
      wrapper.find('[data-testid="schema-form-group-Typography"]').attributes("data-state"),
    ).toBe("closed");
  });

  it("tracks open state independently for each group", async () => {
    const params = {
      headline: param(z.string().default(""), {
        label: "Headline",
        group: "Typography",
        control: { kind: "input", testId: "headline-input" },
      }),
      bg: param(z.string().default("#ffffff"), {
        label: "Background",
        group: "Appearance",
        control: { kind: "color", testId: "bg-color" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { headline: "", bg: "#ffffff" });

    await wrapper.find('[data-testid="schema-form-group-Typography-header"]').trigger("click");

    expect(
      wrapper.find('[data-testid="schema-form-group-Typography"]').attributes("data-state"),
    ).toBe("closed");
    expect(
      wrapper.find('[data-testid="schema-form-group-Appearance"]').attributes("data-state"),
    ).toBe("open");
  });
});

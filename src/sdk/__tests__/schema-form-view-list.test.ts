import { describe, expect, it } from "vitest";
import { z } from "zod";

import { Switch } from "../component-ui-primitives";
import { param } from "../public-sdk";
import type { ComponentParams } from "../public-sdk";
import type { ViewContainerItem } from "../../shared/view-container";
import { mountForm } from "./schema-form-test-helpers";

function viewListParams() {
  return {
    views: param(z.array(z.unknown()).default([]), {
      label: "Views",
      helpText: "Ordered views with stable IDs.",
      control: { kind: "view-list", testId: "views-control" },
    }),
  } satisfies ComponentParams;
}

function viewItem(overrides: Partial<ViewContainerItem> & { id: string }): ViewContainerItem {
  return { label: "View", ...overrides };
}

describe("SchemaForm — view-list control", () => {
  it("renders empty-state copy when there are no views", () => {
    const wrapper = mountForm(viewListParams(), { views: [] });
    const root = wrapper.find('[data-testid="views-control"]');
    expect(root.exists()).toBe(true);
    expect(root.element.tagName.toLowerCase()).toBe("fieldset");
    const empty = wrapper.find('[data-testid="views-view-list-empty"]');
    expect(empty.exists()).toBe(true);
    expect(empty.text()).toBe("No views. Add one.");
    expect(wrapper.find('[data-testid="views-view-list-add"]').text()).toContain("Add view");
  });

  it("renders one row per view with label input and icon-only controls", () => {
    const views: ViewContainerItem[] = [
      viewItem({ id: "intro", label: "Intro" }),
      viewItem({ id: "details", label: "Details" }),
    ];
    const wrapper = mountForm(viewListParams(), { views });
    expect(wrapper.find('[data-testid="views-view-list-empty"]').exists()).toBe(false);
    const labelInput = wrapper.find<HTMLInputElement>(
      '[data-testid="views-view-list-row-intro-label"]',
    );
    expect(labelInput.exists()).toBe(true);
    expect(labelInput.element.value).toBe("Intro");
    // Icon-only controls expose accessible aria-labels per design brief.
    expect(
      wrapper.find('[data-testid="views-view-list-row-intro-move-up"]').attributes("aria-label"),
    ).toBe("Move Intro up");
    expect(
      wrapper.find('[data-testid="views-view-list-row-intro-move-down"]').attributes("aria-label"),
    ).toBe("Move Intro down");
    expect(
      wrapper.find('[data-testid="views-view-list-row-intro-delete"]').attributes("aria-label"),
    ).toBe("Delete view Intro");
    expect(
      wrapper
        .find('[data-testid="views-view-list-row-intro-toggle-details"]')
        .attributes("aria-label"),
    ).toBe("Edit Intro details");
  });

  it("disables move-up on the first row and move-down on the last row", () => {
    const views: ViewContainerItem[] = [
      viewItem({ id: "a", label: "A" }),
      viewItem({ id: "b", label: "B" }),
    ];
    const wrapper = mountForm(viewListParams(), { views });
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="views-view-list-row-a-move-up"]').element
        .disabled,
    ).toBe(true);
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="views-view-list-row-b-move-down"]').element
        .disabled,
    ).toBe(true);
  });

  it("emits update:config with a new item using `View ${n+1}` default label on add", async () => {
    const views: ViewContainerItem[] = [viewItem({ id: "intro", label: "Intro" })];
    const wrapper = mountForm(viewListParams(), { views });
    await wrapper.find('[data-testid="views-view-list-add"]').trigger("click");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as
      | { views?: ViewContainerItem[] }
      | undefined;
    expect(Array.isArray(last?.views)).toBe(true);
    expect(last?.views).toHaveLength(2);
    const created = last!.views![1]!;
    expect(created.label).toBe("View 2");
    expect(typeof created.id).toBe("string");
    // Stable IDs must NOT be label/index-derived.
    expect(created.id).not.toBe("View 2");
    expect(created.id).not.toBe("1");
    expect(created.id.length).toBeGreaterThan(0);
  });

  it("emits update:config with a renamed label when the label input is edited", async () => {
    const views: ViewContainerItem[] = [viewItem({ id: "intro", label: "Intro" })];
    const wrapper = mountForm(viewListParams(), { views });
    await wrapper
      .find<HTMLInputElement>('[data-testid="views-view-list-row-intro-label"]')
      .setValue("Overview");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as { views?: ViewContainerItem[] };
    // Helpers omit `disabled` when it normalizes to false.
    expect(last.views).toEqual([{ id: "intro", label: "Overview" }]);
  });

  it("reorders a row down when the move-down button is pressed", async () => {
    const views: ViewContainerItem[] = [
      viewItem({ id: "a", label: "A" }),
      viewItem({ id: "b", label: "B" }),
      viewItem({ id: "c", label: "C" }),
    ];
    const wrapper = mountForm(viewListParams(), { views });
    await wrapper.find('[data-testid="views-view-list-row-a-move-down"]').trigger("click");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as { views: ViewContainerItem[] };
    expect(last.views.map((item) => item.id)).toEqual(["b", "a", "c"]);
  });

  it("reorders a row up when the move-up button is pressed", async () => {
    const views: ViewContainerItem[] = [
      viewItem({ id: "a", label: "A" }),
      viewItem({ id: "b", label: "B" }),
    ];
    const wrapper = mountForm(viewListParams(), { views });
    await wrapper.find('[data-testid="views-view-list-row-b-move-up"]').trigger("click");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as { views: ViewContainerItem[] };
    expect(last.views.map((item) => item.id)).toEqual(["b", "a"]);
  });

  it("expands details and emits update:config with a normalized hash slug on edit", async () => {
    const views: ViewContainerItem[] = [viewItem({ id: "intro", label: "Intro" })];
    const wrapper = mountForm(viewListParams(), { views });
    expect(wrapper.find('[data-testid="views-view-list-row-intro-details"]').exists()).toBe(false);
    await wrapper.find('[data-testid="views-view-list-row-intro-toggle-details"]').trigger("click");
    expect(wrapper.find('[data-testid="views-view-list-row-intro-details"]').exists()).toBe(true);
    const hashInput = wrapper.find<HTMLInputElement>(
      '[data-testid="views-view-list-row-intro-hash-slug"]',
    );
    expect(hashInput.exists()).toBe(true);
    expect(hashInput.attributes("placeholder")).toBe("url-slug");
    await hashInput.setValue(" #Hello World ");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as { views: ViewContainerItem[] };
    // Helper normalizes free-text slugs into URL-safe form.
    expect(last.views).toEqual([{ id: "intro", label: "Intro", hashSlug: "hello-world" }]);
  });

  it("emits update:config with the toggled disabled flag when the row switch is flipped", async () => {
    const views: ViewContainerItem[] = [viewItem({ id: "intro", label: "Intro" })];
    const wrapper = mountForm(viewListParams(), { views });
    await wrapper.find('[data-testid="views-view-list-row-intro-toggle-details"]').trigger("click");
    const toggle = wrapper.findComponent<typeof Switch>(
      '[data-testid="views-view-list-row-intro-disabled"]',
    );
    expect(toggle.exists()).toBe(true);
    toggle.vm.$emit("update:modelValue", true);
    await wrapper.vm.$nextTick();
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as { views: ViewContainerItem[] };
    expect(last.views).toEqual([{ id: "intro", label: "Intro", disabled: true }]);
  });

  it("emits update:config with the reduced list when delete is pressed (host applies guard)", async () => {
    const views: ViewContainerItem[] = [
      viewItem({ id: "intro", label: "Intro" }),
      viewItem({ id: "details", label: "Details" }),
    ];
    const wrapper = mountForm(viewListParams(), { views });
    await wrapper.find('[data-testid="views-view-list-row-intro-delete"]').trigger("click");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as { views: ViewContainerItem[] };
    expect(last.views).toEqual([{ id: "details", label: "Details" }]);
  });

  it("does not emit when reordering at the boundary is a no-op", async () => {
    const views: ViewContainerItem[] = [
      viewItem({ id: "a", label: "A" }),
      viewItem({ id: "b", label: "B" }),
    ];
    const wrapper = mountForm(viewListParams(), { views });
    // First row is already at index 0; move-up is disabled, so a click is a no-op
    // even if the button were pressed programmatically.
    await wrapper.find('[data-testid="views-view-list-row-a-move-up"]').trigger("click");
    expect(wrapper.emitted("update:config")).toBeUndefined();
  });

  it("preserves untouched config keys when patching the views field", async () => {
    const params = {
      views: param(z.array(z.unknown()).default([]), {
        label: "Views",
        control: { kind: "view-list", testId: "views-control" },
      }),
      activeViewId: param(z.string().default(""), {
        label: "Active view",
        control: { kind: "input", testId: "active-view-input" },
      }),
    } satisfies ComponentParams;
    const wrapper = mountForm(params, { views: [], activeViewId: "intro" });
    await wrapper.find('[data-testid="views-view-list-add"]').trigger("click");
    const last = wrapper.emitted("update:config")?.at(-1)?.[0] as Record<string, unknown>;
    expect(last.activeViewId).toBe("intro");
    expect(Array.isArray(last.views)).toBe(true);
  });
});

describe("SchemaForm — view-list disabled state", () => {
  function disabledViewListParams() {
    return {
      views: param(z.array(z.unknown()).default([]), {
        label: "Views",
        helpText: "Ordered views with stable IDs.",
        control: { kind: "view-list", testId: "views-control" },
        disabledWhen: () => true,
      }),
    } satisfies ComponentParams;
  }

  it("disables row inputs, reorder/delete/toggle buttons, the per-view switch, and the add button", () => {
    const views: ViewContainerItem[] = [
      viewItem({ id: "intro", label: "Intro" }),
      viewItem({ id: "details", label: "Details" }),
    ];
    const wrapper = mountForm(disabledViewListParams(), { views });
    const labelInput = wrapper.find<HTMLInputElement>(
      '[data-testid="views-view-list-row-intro-label"]',
    );
    expect(labelInput.element.value).toBe("Intro");
    expect(labelInput.element.disabled).toBe(true);
    // Boundary disabled for move-up at index 0, plus field-level disabled.
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="views-view-list-row-intro-move-up"]').element
        .disabled,
    ).toBe(true);
    // Non-boundary move-down on the first row should still be disabled
    // because the whole field is disabled.
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="views-view-list-row-intro-move-down"]').element
        .disabled,
    ).toBe(true);
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="views-view-list-row-intro-toggle-details"]')
        .element.disabled,
    ).toBe(true);
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="views-view-list-row-intro-delete"]').element
        .disabled,
    ).toBe(true);
    expect(
      wrapper.find<HTMLButtonElement>('[data-testid="views-view-list-add"]').element.disabled,
    ).toBe(true);
  });

  it("does not emit update:config when typing into a disabled label input", async () => {
    const views: ViewContainerItem[] = [viewItem({ id: "intro", label: "Intro" })];
    const wrapper = mountForm(disabledViewListParams(), { views });
    await wrapper
      .find<HTMLInputElement>('[data-testid="views-view-list-row-intro-label"]')
      .setValue("Overview");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("views" in (args[0] as Record<string, unknown>)))).toBe(true);
  });

  it("does not emit update:config when add/move/delete buttons are clicked while disabled", async () => {
    const views: ViewContainerItem[] = [
      viewItem({ id: "intro", label: "Intro" }),
      viewItem({ id: "details", label: "Details" }),
    ];
    const wrapper = mountForm(disabledViewListParams(), { views });
    await wrapper.find('[data-testid="views-view-list-add"]').trigger("click");
    await wrapper.find('[data-testid="views-view-list-row-intro-move-down"]').trigger("click");
    await wrapper.find('[data-testid="views-view-list-row-intro-delete"]').trigger("click");
    const emitted = wrapper.emitted("update:config") ?? [];
    expect(emitted.every((args) => !("views" in (args[0] as Record<string, unknown>)))).toBe(true);
  });
});

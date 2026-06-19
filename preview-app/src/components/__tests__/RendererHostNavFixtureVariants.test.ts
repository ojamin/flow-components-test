import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

import { requireBuiltInComponentDefinition } from "@flow-builder/components/catalog";
import type { ComponentDefinition } from "@flow-builder/components/sdk";
import PreviewControlsBar from "../PreviewControlsBar.vue";
import RendererHostPane from "../RendererHostPane.vue";

const navbarDefinition = requireBuiltInComponentDefinition("layout.navbar");
const sidebarNavDefinition = requireBuiltInComponentDefinition("layout.sidebar-nav");

async function mountRendererHost(definition: ComponentDefinition) {
  const wrapper = mount(RendererHostPane, {
    props: { definition },
    attachTo: document.body,
  });
  await flushPromises();
  await flushPromises();
  await vi.waitFor(() => {
    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(true);
  });
  return wrapper;
}

async function selectFixtureVariant(
  wrapper: Awaited<ReturnType<typeof mountRendererHost>>,
  id: string,
) {
  wrapper.findComponent(PreviewControlsBar).vm.$emit("update:fixtureVariantId", id);
  await flushPromises();
  await flushPromises();
  await vi.waitFor(() => {
    expect(wrapper.find('[data-testid="renderer-loaded"]').exists()).toBe(true);
  });
}

describe("RendererHostPane nav fixture variants", () => {
  test("navbar package-preview fixture variant applies nested and mobile config state", async () => {
    const wrapper = await mountRendererHost(navbarDefinition);

    await selectFixtureVariant(wrapper, "default");

    expect(wrapper.text()).toContain("Overview");
    expect(wrapper.text()).not.toContain("API");

    await selectFixtureVariant(wrapper, "nested");

    expect(wrapper.text()).toContain("Resources");
    await wrapper.find('[data-testid="navbar-nav-item-Resources"]').trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("API");

    await selectFixtureVariant(wrapper, "mobile-menu");
    await wrapper.find('[data-testid="navbar-mobile-menu-button"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Disabled mobile");
    expect(wrapper.find('[data-testid="navbar-primary-cta-Start"]').exists()).toBe(true);
  });

  test("sidebar package-preview fixture variant applies grouped and collapsed config state", async () => {
    const wrapper = await mountRendererHost(sidebarNavDefinition);

    await selectFixtureVariant(wrapper, "default");

    expect(wrapper.find('[data-testid="sidebar-nav-root"]').attributes("aria-label")).toBe(
      "Workspace navigation",
    );
    expect(wrapper.text()).not.toContain("API");

    await selectFixtureVariant(wrapper, "grouped");

    expect(wrapper.find('[data-testid="sidebar-nav-root"]').attributes("aria-label")).toBe(
      "Grouped workspace navigation",
    );
    expect(wrapper.text()).toContain("Resources");
    expect(wrapper.text()).toContain("API");

    await selectFixtureVariant(wrapper, "collapsed");

    expect(wrapper.find('[data-testid="sidebar-nav-root"]').attributes("aria-label")).toBe(
      "Sidebar navigation",
    );
    expect(wrapper.find('[data-testid="sidebar-nav-item-Docs"]').attributes("aria-label")).toBe(
      "Docs",
    );
  });
});

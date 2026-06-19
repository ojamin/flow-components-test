import { expect, test } from "vitest";
import { mount } from "@vue/test-utils";

import { describeStaticComponentRenderer } from "../../../../testing";

import { componentDefinition } from "../component";
import Renderer from "../Renderer.vue";
import { renderCases } from "./cases";

describeStaticComponentRenderer(componentDefinition, renderCases);

test("demo.demo-button gives each disabled reason a unique description id", async () => {
  const wrapper = mount({
    components: { Renderer },
    data: () => ({
      firstConfig: {
        label: "Submit report",
        href: "https://example.com/report",
        disabled: true,
        disabledReason: "Report is locked",
      },
      secondConfig: {
        label: "Publish update",
        href: "https://example.com/publish",
        disabled: true,
        disabledReason: "Approval is pending",
      },
    }),
    template: `
      <div>
        <Renderer :config="firstConfig" />
        <Renderer :config="secondConfig" />
      </div>
    `,
  });

  try {
    const buttons = wrapper.findAll('[data-testid="button-disabled"]');
    expect(buttons).toHaveLength(2);

    const firstButton = buttons[0]!;
    const secondButton = buttons[1]!;
    expect(firstButton).toBeDefined();
    expect(secondButton).toBeDefined();
    const firstId = firstButton.attributes("aria-describedby");
    const secondId = secondButton.attributes("aria-describedby");

    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
    const descriptions = wrapper.findAll(".sr-only");
    expect(descriptions.map((description) => description.attributes("id"))).toEqual([
      firstId,
      secondId,
    ]);
  } finally {
    wrapper.unmount();
  }
});

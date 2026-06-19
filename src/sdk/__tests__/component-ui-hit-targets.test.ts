import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { Checkbox, RadioGroup, RadioGroupItem, Slider, Switch } from "../component-ui-primitives";

const centeredHitTargetClasses = [
  "after:absolute",
  "after:left-1/2",
  "after:top-1/2",
  "after:size-6",
  "after:-translate-x-1/2",
  "after:-translate-y-1/2",
  "after:content-['']",
] as const;

function expectClasses(className: string, classes: readonly string[]) {
  for (const utility of classes) {
    expect(className).toContain(utility);
  }
}

describe("component-ui compact control hit targets", () => {
  it("keeps checkbox visuals compact while exposing a 24px pseudo hit target", () => {
    const wrapper = mount(Checkbox);

    const control = wrapper.get('[data-slot="checkbox"]');
    const className = control.attributes("class") ?? "";

    expectClasses(className, ["size-4", ...centeredHitTargetClasses]);
  });

  it("keeps radio item visuals compact while exposing a 24px pseudo hit target", () => {
    const wrapper = mount({
      components: { RadioGroup, RadioGroupItem },
      template: `
        <RadioGroup default-value="one">
          <RadioGroupItem value="one" />
        </RadioGroup>
      `,
    });

    const control = wrapper.get('[data-slot="radio-group-item"]');
    const className = control.attributes("class") ?? "";

    expectClasses(className, ["size-4", ...centeredHitTargetClasses]);
  });

  it("keeps switch track sizes compact while giving every size at least a 24px-high target", () => {
    const wrapper = mount(Switch, { props: { size: "sm" } });

    const control = wrapper.get('[data-slot="switch"]');
    const className = control.attributes("class") ?? "";

    expectClasses(className, [
      "data-[size=sm]:h-[14px]",
      "data-[size=sm]:w-[24px]",
      "after:absolute",
      "after:left-1/2",
      "after:top-1/2",
      "after:h-6",
      "after:w-full",
      "after:min-w-6",
      "after:-translate-x-1/2",
      "after:-translate-y-1/2",
      "after:content-['']",
    ]);
  });

  it("keeps slider thumbs compact while exposing a 24px pseudo hit target", () => {
    const wrapper = mount(Slider, { props: { defaultValue: [50] } });

    const thumb = wrapper.get('[data-slot="slider-thumb"]');
    const className = thumb.attributes("class") ?? "";

    expectClasses(className, ["size-3", ...centeredHitTargetClasses]);
  });
});

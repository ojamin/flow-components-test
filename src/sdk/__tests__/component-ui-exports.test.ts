import { describe, expect, it } from "vitest";

import * as ComponentUi from "@flow-builder/components/component-ui";

describe("component-ui navigation primitive exports", () => {
  it("exposes navigation menu and dialog primitives through the package facade", () => {
    expect(ComponentUi.NavigationMenu).toBeTypeOf("object");
    expect(ComponentUi.NavigationMenuList).toBeTypeOf("object");
    expect(ComponentUi.NavigationMenuItem).toBeTypeOf("object");
    expect(ComponentUi.NavigationMenuTrigger).toBeTypeOf("object");
    expect(ComponentUi.NavigationMenuContent).toBeTypeOf("object");
    expect(ComponentUi.NavigationMenuLink).toBeTypeOf("object");
    expect(ComponentUi.NavigationMenuViewport).toBeTypeOf("object");

    expect(ComponentUi.Dialog).toBeTypeOf("object");
    expect(ComponentUi.DialogTrigger).toBeTypeOf("object");
    expect(ComponentUi.DialogContent).toBeTypeOf("object");
    expect(ComponentUi.DialogTitle).toBeTypeOf("object");
    expect(ComponentUi.DialogDescription).toBeTypeOf("object");
    expect(ComponentUi.DialogClose).toBeTypeOf("object");
  });
});

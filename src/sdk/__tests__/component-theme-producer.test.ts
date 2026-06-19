import { describe, expect, it } from "vitest";

import { staticComponentPackageCatalog } from "../../generated/catalog";
import { staticComponentSourceManifest } from "../../generated/source-manifest";

describe("component-theme producer catalog contract", () => {
  it("keeps theme.theme as the only canonical component-theme producer", () => {
    const componentThemeProducers = staticComponentPackageCatalog.definitions
      .filter((definition) =>
        definition.outputs.some((output) => output.typeId === "component-theme"),
      )
      .map((definition) => definition.id);

    expect(componentThemeProducers).toEqual(["theme.theme"]);
  });

  it("keeps the canonical Theme component headless but cataloged for Flow authoring", () => {
    const definition = staticComponentPackageCatalog.definitions.find(
      (candidate) => candidate.id === "theme.theme",
    );
    const summary = staticComponentSourceManifest.components.find(
      (candidate) => candidate.id === "theme.theme",
    );

    expect(definition).toMatchObject({
      id: "theme.theme",
      renderable: false,
      builder: { scaffolded: true },
    });
    expect(summary).toMatchObject({
      id: "theme.theme",
      group: "theme",
      renderable: false,
      sourcePath: "src/groups/theme/theme",
    });
  });

  it("does not catalog the removed legacy viz.theme adapter", () => {
    const definition = staticComponentPackageCatalog.definitions.find(
      (candidate) => candidate.id === "viz.theme",
    );
    const summary = staticComponentSourceManifest.components.find(
      (candidate) => candidate.id === "viz.theme",
    );

    expect(definition).toBeUndefined();
    expect(summary).toBeUndefined();
  });
});

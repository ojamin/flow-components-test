import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  createViewContainerItem,
  createViewContainerSlots,
  deleteViewContainerItem,
  normalizeHashSlug,
  normalizeViewContainerItems,
  renameViewContainerItem,
  reorderViewContainerItems,
  resolveActiveViewId,
  setViewContainerItemDisabled,
  setViewContainerItemHashSlug,
  viewChangedPayloadSchema,
  viewRequestedPayloadSchema,
} from "../../shared/view-container";
import { resolvePackagePath } from "./package-paths";

describe("view-container helpers", () => {
  it("normalizes persisted item semantics without deriving IDs from labels", () => {
    const items = normalizeViewContainerItems([
      { id: " intro ", label: " Intro ", hashSlug: " #Hello World ", disabled: true },
      { id: "intro", label: "Duplicate id is ignored" },
      { id: "details", label: "Details", disabled: false },
      { id: "", label: "Missing id" },
      { id: "summary", label: "" },
    ]);

    expect(items).toEqual([
      { id: "intro", label: "Intro", hashSlug: "hello-world", disabled: true },
      { id: "details", label: "Details", disabled: false },
    ]);
  });

  it("resolves disabled or missing active views to the first enabled view", () => {
    const items = normalizeViewContainerItems([
      { id: "intro", label: "Intro", disabled: true },
      { id: "details", label: "Details" },
      { id: "summary", label: "Summary" },
    ]);

    expect(resolveActiveViewId(items, "intro")).toBe("details");
    expect(resolveActiveViewId(items, "missing")).toBe("details");
    expect(resolveActiveViewId(items, "summary")).toBe("summary");
  });

  it("resolves empty or all-disabled lists deterministically", () => {
    expect(resolveActiveViewId([], "anything")).toBeUndefined();
    expect(
      resolveActiveViewId(
        normalizeViewContainerItems([
          { id: "intro", label: "Intro", disabled: true },
          { id: "details", label: "Details", disabled: true },
        ]),
        "details",
      ),
    ).toBeUndefined();
  });

  it("normalizes hash slugs safely and deterministically resolves invalid or duplicate slugs", () => {
    expect(normalizeHashSlug(" #Résumé & News! ")).toBe("resume-news");
    expect(normalizeHashSlug("###")).toBeUndefined();

    expect(
      normalizeViewContainerItems([
        { id: "b-view", label: "B", hashSlug: "Overview" },
        { id: "a-view", label: "A", hashSlug: "overview" },
        { id: "invalid", label: "Invalid", hashSlug: "###" },
      ]),
    ).toEqual([
      { id: "b-view", label: "B", hashSlug: "overview-b-view", disabled: false },
      { id: "a-view", label: "A", hashSlug: "overview-a-view", disabled: false },
      { id: "invalid", label: "Invalid", disabled: false },
    ]);
  });

  it("creates stable SDK slots from durable item IDs across reorder", () => {
    const firstOrder = normalizeViewContainerItems([
      { id: "details", label: "Details" },
      { id: "intro", label: "Renamed intro" },
    ]);
    const secondOrder = normalizeViewContainerItems([
      { id: "intro", label: "Intro" },
      { id: "details", label: "Details" },
    ]);

    expect(createViewContainerSlots(firstOrder).map((slot) => slot.id)).toEqual([
      "view:details",
      "view:intro",
    ]);
    expect(createViewContainerSlots(secondOrder).map((slot) => slot.id)).toEqual([
      "view:intro",
      "view:details",
    ]);
    expect(createViewContainerSlots(secondOrder)[0]).toMatchObject({
      id: "view:intro",
      label: "Intro",
      acceptsChildren: true,
      childScopeMode: "inherit",
      layoutKind: "grid",
    });
  });

  it("creates authorable items with durable IDs and default labels", () => {
    expect(createViewContainerItem({ idFactory: () => "view-id" })).toEqual({
      id: "view-id",
      label: "New view",
    });
    expect(createViewContainerItem({ label: "  Details  ", idFactory: () => "other-id" })).toEqual({
      id: "other-id",
      label: "Details",
    });
  });

  it("renames, toggles disabled state, and edits hash slugs without changing stable IDs", () => {
    const items = [
      { id: "intro", label: "Intro", hashSlug: "intro" },
      { id: "details", label: "Details", disabled: true },
    ];

    expect(renameViewContainerItem(items, "intro", "  Overview  ")).toEqual([
      { id: "intro", label: "Overview", hashSlug: "intro" },
      { id: "details", label: "Details", disabled: true },
    ]);
    expect(setViewContainerItemDisabled(items, "details", false)).toEqual([
      { id: "intro", label: "Intro", hashSlug: "intro" },
      { id: "details", label: "Details", disabled: false },
    ]);
    expect(setViewContainerItemHashSlug(items, "details", " #Résumé & News! ")).toEqual([
      { id: "intro", label: "Intro", hashSlug: "intro" },
      { id: "details", label: "Details", disabled: true, hashSlug: "resume-news" },
    ]);
    expect(setViewContainerItemHashSlug(items, "intro", "###")).toEqual([
      { id: "intro", label: "Intro" },
      { id: "details", label: "Details", disabled: true },
    ]);
  });

  it("reorders and deletes items by stable ID without rewriting other IDs", () => {
    const items = [
      { id: "intro", label: "Intro" },
      { id: "details", label: "Details" },
      { id: "summary", label: "Summary" },
    ];

    expect(reorderViewContainerItems(items, "summary", 0).map((item) => item.id)).toEqual([
      "summary",
      "intro",
      "details",
    ]);
    expect(reorderViewContainerItems(items, "intro", 99).map((item) => item.id)).toEqual([
      "details",
      "summary",
      "intro",
    ]);
    expect(deleteViewContainerItem(items, "details")).toEqual([
      { id: "intro", label: "Intro" },
      { id: "summary", label: "Summary" },
    ]);
  });

  it("leaves missing item IDs unchanged for edit helpers", () => {
    const items = [
      { id: "intro", label: "Intro" },
      { id: "details", label: "Details" },
    ];

    expect(renameViewContainerItem(items, "missing", "Overview")).toBe(items);
    expect(setViewContainerItemHashSlug(items, "missing", "overview")).toBe(items);
    expect(setViewContainerItemDisabled(items, "missing", true)).toBe(items);
    expect(reorderViewContainerItems(items, "missing", 0)).toBe(items);
    expect(deleteViewContainerItem(items, "missing")).toBe(items);
  });

  it("keeps no-op edit helper results referentially stable", () => {
    const items = [
      { id: "intro", label: "Intro", hashSlug: "intro" },
      { id: "details", label: "Details" },
    ];

    expect(renameViewContainerItem(items, "intro", " Intro ")).toBe(items);
    expect(setViewContainerItemHashSlug(items, "intro", "intro")).toBe(items);
    expect(setViewContainerItemHashSlug(items, "details", "###")).toBe(items);
    expect(setViewContainerItemDisabled(items, "details", false)).toBe(items);
    expect(reorderViewContainerItems(items, "intro", 0)).toBe(items);
  });

  it("validates viewRequested and viewChanged event payload schemas", () => {
    expect(viewRequestedPayloadSchema.parse({ activeViewId: "intro" })).toEqual({
      activeViewId: "intro",
    });
    expect(
      viewChangedPayloadSchema.parse({
        activeViewId: "details",
        previousViewId: "intro",
        hashSlug: "details",
      }),
    ).toEqual({ activeViewId: "details", previousViewId: "intro", hashSlug: "details" });

    expect(viewRequestedPayloadSchema.safeParse({ activeViewId: "" }).success).toBe(false);
    expect(viewChangedPayloadSchema.safeParse({ previousViewId: "intro" }).success).toBe(false);
  });

  it("keeps the package helper free of app-only import boundaries", () => {
    const sourcePath = resolvePackagePath("src/shared/view-container/index.ts");
    const source = readFileSync(sourcePath, "utf8");

    expect(source).not.toMatch(/from\s+["']@\/stores|from\s+["']@\/router|from\s+["']@\/pages/);
    expect(source).not.toMatch(/project\/builder|AppShell|Builder/);
  });
});

import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  param,
  resolveAllowedParamBindSources,
  resolveParamValues,
  type ComponentParams,
  type InputPortDefinition,
} from "../public-sdk";

const inputs = [
  inputPort("data", ["all-data"]),
  inputPort("title", ["primitive.string"]),
  inputPort("count", ["primitive.number"]),
];

const params = {
  title: param(z.string(), {
    label: "Title",
    control: { kind: "input" },
    bindable: true,
    bindFrom: [
      { input: "data", typeId: "primitive.string" },
      { input: "title", typeId: "primitive.string" },
    ],
  }),
  count: param(z.number(), {
    label: "Count",
    control: { kind: "number" },
    bindable: true,
    bindFrom: [{ input: "count", typeId: "primitive.number" }],
  }),
  eyebrow: param(z.string(), { label: "Eyebrow", control: { kind: "input" } }),
} satisfies ComponentParams;

describe("resolveParamValues", () => {
  it("returns defaults unchanged when no persisted state exists", () => {
    const result = resolveParamValues({
      params,
      state: undefined,
      inputValues: {},
      inputPorts: inputs,
      defaults: { title: "Default", eyebrow: "Intro" },
    });

    expect(result).toEqual({ values: { title: "Default", eyebrow: "Intro" }, issues: [] });
  });

  it("passes literal state through over defaults", () => {
    const result = resolveParamValues({
      params,
      state: { title: { mode: "literal", value: "Literal" } },
      inputValues: {},
      inputPorts: inputs,
      defaults: { title: "Default", eyebrow: "Intro" },
    });

    expect(result).toEqual({ values: { title: "Literal", eyebrow: "Intro" }, issues: [] });
  });

  it("resolves bound values from compatible inputs", () => {
    const result = resolveParamValues({
      params,
      state: { title: { mode: "bind", input: "data", path: "$.hero.title" } },
      inputValues: { data: { hero: { title: "Bound" } } },
      inputPorts: inputs,
      defaults: { title: "Default" },
    });

    expect(result.values.title).toBe("Bound");
    expect(result.issues).toEqual([]);
  });

  it("returns missing-value issues and applies configured fallback", () => {
    const result = resolveParamValues({
      params,
      state: {
        title: { mode: "bind", input: "data", path: "$.missing.title", fallback: "Fallback" },
      },
      inputValues: { data: {} },
      inputPorts: inputs,
      defaults: { title: "Default" },
    });

    expect(result.values.title).toBe("Fallback");
    expect(result.issues).toMatchObject([{ key: "title", reason: "missing-value" }]);
    expect(result.issues[0]?.message).toContain("applying configured fallback");
  });

  it("keeps defaults for missing values without fallback and for stale inputs", () => {
    const missingValue = resolveParamValues({
      params,
      state: { title: { mode: "bind", input: "data", path: "$.missing" } },
      inputValues: { data: {} },
      inputPorts: inputs,
      defaults: { title: "Default" },
    });
    const staleInput = resolveParamValues({
      params,
      state: { title: { mode: "bind", input: "removed", path: "$" } },
      inputValues: { removed: "Stale" },
      inputPorts: inputs,
      defaults: { title: "Default" },
    });

    expect(missingValue.values.title).toBe("Default");
    expect(missingValue.issues).toMatchObject([{ reason: "missing-value" }]);
    expect(staleInput.values.title).toBe("Default");
    expect(staleInput.issues).toMatchObject([{ reason: "stale-input" }]);
  });

  it("returns issues instead of throwing for invalid/disallowed/non-bindable persisted bindings", () => {
    const invalidPath = resolveParamValues({
      params,
      state: { title: { mode: "bind", input: "data", path: "$..title" } },
      inputValues: { data: { title: "Bound" } },
      inputPorts: inputs,
      defaults: { title: "Default" },
    });
    const disallowedInput = resolveParamValues({
      params,
      state: { title: { mode: "bind", input: "count", path: "$" } },
      inputValues: { count: 1 },
      inputPorts: inputs,
      defaults: { title: "Default" },
    });
    const nonBindable = resolveParamValues({
      params,
      state: { eyebrow: { mode: "bind", input: "data", path: "$.eyebrow" } },
      inputValues: { data: { eyebrow: "Bound" } },
      inputPorts: inputs,
      defaults: { eyebrow: "Default" },
    });

    expect(invalidPath.values.title).toBe("Default");
    expect(invalidPath.issues).toMatchObject([{ reason: "invalid-path" }]);
    expect(disallowedInput.values.title).toBe("Default");
    expect(disallowedInput.issues).toMatchObject([{ reason: "disallowed-input" }]);
    expect(nonBindable.values.eyebrow).toBe("Default");
    expect(nonBindable.issues).toMatchObject([{ reason: "not-bindable" }]);
  });
});

describe("resolveAllowedParamBindSources", () => {
  it("filters to currently resolved inputs compatible by source type or all-data", () => {
    expect(resolveAllowedParamBindSources(params.title, inputs)).toEqual([
      { input: "data", typeId: "primitive.string" },
      { input: "title", typeId: "primitive.string" },
    ]);
    expect(resolveAllowedParamBindSources(params.count, inputs)).toEqual([
      { input: "count", typeId: "primitive.number" },
    ]);
  });
});

function inputPort(id: string, acceptedTypeIds: string[]): InputPortDefinition {
  return {
    id,
    acceptedTypeIds,
    label: id,
    mode: "full",
    required: false,
    allowMultiple: false,
    allowCycle: false,
  };
}

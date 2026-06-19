import { describe, expect, it } from "vitest";
import { z } from "zod";

import { param as rootParam, paramsToConfigSchema as rootParamsToConfigSchema } from "../../index";
import {
  param,
  paramsToConfigSchema,
  type ComponentDefinition,
  type ComponentParams,
  type ParamControl,
  type ParamMeta,
} from "../public-sdk";

describe("param", () => {
  it("returns a descriptor with the exact schema and meta objects", () => {
    const schema = z.string().min(1);
    const meta: ParamMeta = {
      label: "Title",
      helpText: "Shown above the fold.",
      group: "Content",
      control: { kind: "input", placeholder: "Untitled" },
      bindable: true,
      bindFrom: [{ input: "title", typeId: "primitive.string" }],
    };

    const descriptor = param(schema, meta);

    expect(descriptor.schema).toBe(schema);
    expect(descriptor.meta).toBe(meta);
  });

  it("accepts all initial parameter control variants", () => {
    const controls = [
      { kind: "input", placeholder: "Title", testId: "title" },
      { kind: "textarea", rows: 4, placeholder: "Body", testId: "body" },
      { kind: "number", min: 1, max: 10, step: 1, testId: "count" },
      { kind: "select", options: [{ label: "Primary", value: "primary" }], testId: "variant" },
      { kind: "boolean", testId: "enabled" },
      { kind: "color", testId: "accent" },
      { kind: "code", language: "json", testId: "payload" },
    ] satisfies ParamControl[];

    expect(controls.map((control) => control.kind)).toEqual([
      "input",
      "textarea",
      "number",
      "select",
      "boolean",
      "color",
      "code",
    ]);
  });
});

describe("paramsToConfigSchema", () => {
  it("builds a config schema whose shape preserves each param schema identity", () => {
    const titleSchema = z.string().default("Untitled");
    const countSchema = z.number().int().min(0).default(0);
    const params = {
      title: param(titleSchema, { label: "Title", control: { kind: "input" } }),
      count: param(countSchema, { label: "Count", control: { kind: "number", min: 0 } }),
    } satisfies ComponentParams;

    const configSchema = paramsToConfigSchema(params);

    expect(configSchema.shape.title).toBe(params.title.schema);
    expect(configSchema.shape.count).toBe(params.count.schema);
    expect(configSchema.parse({})).toEqual({ title: "Untitled", count: 0 });
  });

  it("supports optional ComponentDefinition params with config-schema parity", () => {
    const params = {
      label: param(z.string().default("Read more"), {
        label: "Label",
        control: { kind: "input" },
      }),
    } satisfies ComponentParams;
    const configSchema = paramsToConfigSchema(params);

    const definition = {
      id: "content.params-test",
      version: 1,
      displayName: "Params test",
      icon: "lucide:settings-2",
      category: "content",
      renderable: true,
      slots: [],
      configSchema,
      configDefaults: { label: "Read more" },
      builder: {},
      flow: {},
      inputs: [],
      outputs: [],
      params,
      loadFixtureData: async () => undefined,
    } satisfies ComponentDefinition<typeof configSchema>;

    expect(definition.params.label.schema).toBe(definition.configSchema.shape.label);
  });

  it("is exported through the package root without an sdk-internal barrel", () => {
    const schema = z.boolean().default(false);
    const params = {
      enabled: rootParam(schema, { label: "Enabled", control: { kind: "boolean" } }),
    };

    expect(rootParamsToConfigSchema(params).shape.enabled).toBe(schema);
  });
});

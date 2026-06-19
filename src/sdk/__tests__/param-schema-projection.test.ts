import { describe, expect, it } from "vitest";
import { z } from "zod";

import { param, projectComponentParamSchemas } from "../public-sdk";

describe("projectComponentParamSchemas", () => {
  it("projects primitive, enum, object, and array param contract details from source schemas", () => {
    const params = {
      title: param(z.string().trim().default("Hello").meta({ placeholder: "Hero title" }), {
        label: "Title",
        control: { kind: "input", placeholder: "Title" },
      }),
      variant: param(z.enum(["primary", "secondary"]).default("primary"), {
        label: "Variant",
        control: {
          kind: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
          ],
        },
      }),
      cta: param(
        z
          .object({
            label: z.string().default("Get started").meta({ placeholder: "Button label" }),
            href: z.string().optional(),
            style: z.enum(["solid", "ghost"]).default("solid"),
          })
          .default({ label: "Get started", style: "solid" }),
        {
          label: "CTA",
          control: { kind: "code", language: "json" },
        },
      ),
      features: param(
        z
          .array(
            z.object({
              label: z.string().default("Feature").meta({ placeholder: "Feature label" }),
              highlighted: z.boolean().default(false),
            }),
          )
          .default([]),
        {
          label: "Features",
          control: { kind: "textarea", placeholder: '[{"label":"Fast"}]' },
        },
      ),
    };

    expect(projectComponentParamSchemas(params)).toMatchObject({
      title: {
        type: "string",
        defaultValue: "Hello",
        placeholder: "Hero title",
      },
      variant: {
        type: "enum",
        enumValues: ["primary", "secondary"],
        defaultValue: "primary",
      },
      cta: {
        type: "object",
        defaultValue: { label: "Get started", style: "solid" },
        required: ["label", "style"],
        properties: {
          label: {
            type: "string",
            defaultValue: "Get started",
            placeholder: "Button label",
          },
          href: { type: "string" },
          style: {
            type: "enum",
            enumValues: ["solid", "ghost"],
            defaultValue: "solid",
          },
        },
      },
      features: {
        type: "array",
        defaultValue: [],
        placeholder: '[{"label":"Fast"}]',
        items: {
          type: "object",
          required: ["label", "highlighted"],
          properties: {
            label: {
              type: "string",
              defaultValue: "Feature",
              placeholder: "Feature label",
            },
            highlighted: { type: "boolean", defaultValue: false },
          },
        },
      },
    });
  });

  it("preserves manual schemaProjection metadata for canonical object contracts", () => {
    const params = {
      timestamp: param(z.union([z.string(), z.object({ value: z.string() })]), {
        label: "Timestamp object",
        control: { kind: "data-path", placeholder: "timestamp" },
        schemaProjection: {
          type: "object",
          required: ["value", "display"],
          properties: {
            value: { type: "string" },
            display: { type: "string" },
            timezone: { type: "string" },
            freshness: { type: "enum", enumValues: ["neutral", "stale"] },
          },
        },
      }),
    };

    expect(projectComponentParamSchemas(params).timestamp).toEqual({
      type: "object",
      placeholder: "timestamp",
      required: ["value", "display"],
      properties: {
        value: { type: "string" },
        display: { type: "string" },
        timezone: { type: "string" },
        freshness: { type: "enum", enumValues: ["neutral", "stale"] },
      },
    });
  });
});

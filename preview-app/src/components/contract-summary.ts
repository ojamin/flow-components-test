// Module intent: pure summarization helpers for ContractDetailsPane.vue —
// schema-shape labels, params/events row builders. Extracted to keep the .vue
// file under the 600-line hard cap. Not a shared utility; only consumed by
// ContractDetailsPane.vue and its direct tests.

import type { ZodTypeAny } from "zod";
import type {
  ComponentEventDefinition,
  ParamControl,
  ParamDescriptor,
} from "@flow-builder/components/sdk";

export interface ParamRow {
  key: string;
  schemaSummary: string;
  controlKind: ParamControl["kind"];
  bindable: boolean;
  bindFrom: string[];
}

export interface EventRow {
  id: string;
  label: string;
  description?: string;
  payloadSummary: string;
}

/**
 * Compact one-line summary of a Zod schema using the public Zod 4 `.def`
 * shape (`type`, `innerType`, `shape`, `element`, `options`). Display-only —
 * runtime parsing always uses the schema itself.
 */
export function summarizeSchema(schema: ZodTypeAny | undefined): string {
  if (!schema) return "unknown";
  const def = (
    schema as {
      def?: { type?: string; innerType?: ZodTypeAny; options?: readonly ZodTypeAny[] };
    }
  ).def;
  const kind = def?.type ?? "unknown";
  if (kind === "object") {
    const keys = Object.keys((schema as { shape?: Record<string, unknown> }).shape ?? {});
    if (keys.length === 0) return "object {}";
    return `object { ${keys.slice(0, 4).join(", ")}${keys.length > 4 ? ", …" : ""} }`;
  }
  if (kind === "array")
    return `array<${summarizeSchema((schema as { element?: ZodTypeAny }).element)}>`;
  if (kind === "optional") return `${summarizeSchema(def?.innerType)}?`;
  if (kind === "nullable") return `${summarizeSchema(def?.innerType)} | null`;
  if (kind === "union") return (def?.options ?? []).map(summarizeSchema).join(" | ") || "union";
  return kind;
}

export function buildParamRow(key: string, descriptor: ParamDescriptor): ParamRow {
  return {
    key,
    schemaSummary: summarizeSchema(descriptor.schema),
    controlKind: descriptor.meta.control.kind,
    bindable: descriptor.meta.bindable === true,
    bindFrom: (descriptor.meta.bindFrom ?? []).map((s) => `${s.input}:${s.typeId}`),
  };
}

// Prefer payloadTypeId (the canonical event-output binding identifier) when
// declared so the panel surfaces the contract instead of the raw schema shape.
export function buildEventRow(event: ComponentEventDefinition): EventRow {
  return {
    id: event.id,
    label: event.label,
    description: event.description,
    payloadSummary: event.payloadTypeId ?? summarizeSchema(event.payloadSchema),
  };
}

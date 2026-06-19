import { z } from "zod";

import { jsonValueSchema } from "./schema-primitives";
import type { StaticComponentTransformModule } from "./component-definition-types";

// Compatibility facade: keep the historical SDK import path stable while the
// component-definition contracts live in focused, package-owned modules.
export * from "./component-definition-types";
export * from "./component-params";
export * from "./component-definition-factory";
export * from "./component-ports-slots";
export * from "./component-data-types";
export {
  createTransformContext,
  getTransformInput,
  requireTransformInput,
} from "./component-transform-context";

declare module "./component-definition-types" {
  interface StaticComponentTransformModule {
    /**
     * Set to false when the transform never reads fixtureData. Runtime evaluators
     * may then skip expensive fixture-data loads before invoking transform().
     */
    requiresFixtureData?: boolean;
    /**
     * Declares outputs that exactly forward an input port. Hosts may use this
     * metadata to avoid copying large values across internal runtime snapshots.
     */
    passthroughOutputs?: Readonly<Record<string, string>>;
  }
}

export type {
  StaticComponentDiagnostics,
  StaticComponentMapLibreDiagnosticsCounts,
  StaticComponentMapLibreDiagnosticsEvent,
  StaticComponentMapLibreDiagnosticsStatus,
  StaticComponentMapLibreDiagnosticsTimings,
  StaticComponentMapLibreDiagnosticsWebGLSupport,
  StaticComponentRenderDiagnosticsCounts,
  StaticComponentRenderDiagnosticsEvent,
  StaticComponentVirtualizationAuditCounts,
  StaticComponentVirtualizationAuditEvent,
  StaticComponentVirtualizationAuditMode,
  StaticComponentVirtualizationAuditRenderMode,
  StaticComponentVirtualizationAuditStatus,
} from "./component-definition-types";

export function createPassthroughTransform(): Promise<StaticComponentTransformModule> {
  return Promise.resolve({
    requiresFixtureData: false,
    passthroughOutputs: { all: "data" },
    outputSchema: z.object({ all: jsonValueSchema.optional() }),
    transform: ({ inputs }) =>
      Object.prototype.hasOwnProperty.call(inputs, "data") ? { all: inputs.data } : {},
  });
}

import type { StaticComponentTransformModule } from "./component-definition-types.js";
export * from "./component-definition-types.js";
export * from "./component-params.js";
export * from "./component-definition-factory.js";
export * from "./component-ports-slots.js";
export * from "./component-data-types.js";
export { createTransformContext, getTransformInput, requireTransformInput, } from "./component-transform-context.js";
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
export type { StaticComponentDiagnostics, StaticComponentMapLibreDiagnosticsCounts, StaticComponentMapLibreDiagnosticsEvent, StaticComponentMapLibreDiagnosticsStatus, StaticComponentMapLibreDiagnosticsTimings, StaticComponentMapLibreDiagnosticsWebGLSupport, StaticComponentRenderDiagnosticsCounts, StaticComponentRenderDiagnosticsEvent, StaticComponentVirtualizationAuditCounts, StaticComponentVirtualizationAuditEvent, StaticComponentVirtualizationAuditMode, StaticComponentVirtualizationAuditRenderMode, StaticComponentVirtualizationAuditStatus, } from "./component-definition-types.js";
export declare function createPassthroughTransform(): Promise<StaticComponentTransformModule>;

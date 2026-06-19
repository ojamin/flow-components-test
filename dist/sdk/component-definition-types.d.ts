import type { z, ZodTypeAny } from "zod";
import type { DataTypeId } from "./data-types.js";
import type { JsonValue } from "./schema-primitives.js";
import type { ComponentCategory, ComponentGroupId } from "./taxonomy.js";
import type { ComponentThemeContext } from "./theme.js";
import type { ComponentThemeContract } from "./theme-contract.js";
import type { ComponentParams } from "./component-params.js";
import type { DatasetDerivationService } from "./runtime-services/index.js";
export interface ComponentCatalogEntry {
    readonly id: string;
    readonly group: ComponentGroupId;
    readonly title: string;
    readonly description?: string;
    readonly source: "static";
    readonly sourceId: string;
}
export interface ComponentPackageCatalog {
    readonly groups: readonly ComponentGroupId[];
    readonly components: readonly ComponentCatalogEntry[];
    readonly definitions: readonly ComponentDefinition[];
}
export interface SlotDefinition {
    id: string;
    label: string;
    acceptsChildren: boolean;
    childScopeMode: "inherit" | "repeater-item";
    layoutKind: "grid";
}
export interface DynamicSlotMetadata {
    canonicalIdTemplate: string;
    configSource: string;
    configSourceDescription?: string;
    acceptsChildren: boolean;
    childScopeMode: SlotDefinition["childScopeMode"];
    layoutKind: SlotDefinition["layoutKind"];
    exampleConfig?: Record<string, unknown>;
}
export interface BuilderSize {
    w: number;
    h: number;
}
export interface BuilderBehavior {
    /** Set to true for non-renderable components that have no canvas presence. */
    scaffolded?: boolean;
    defaultSize?: BuilderSize;
    minSize?: BuilderSize;
    maxSize?: BuilderSize;
    resizeX?: boolean;
    resizeY?: boolean;
    heightMode?: "fixed" | "content" | "container";
    draggable?: boolean;
    wrapperVariant?: "default" | "card" | "transparent";
}
export interface FlowBehavior {
    defaultNodeSize?: BuilderSize;
    scaffolded?: boolean;
    tint?: "layout" | "content" | "chart" | "data" | "utility";
}
export interface InputPortDefinition {
    id: string;
    label: string;
    description?: string;
    mode: "full" | "named";
    acceptedTypeIds: string[];
    required: boolean;
    allowMultiple: boolean;
    allowCycle: boolean;
    edgeConfigSchema?: ZodTypeAny;
}
export interface OutputPortDefinition {
    id: string;
    label: string;
    typeId: string;
    /**
     * Set to false for host-owned/runtime-synthesized outputs that must remain
     * readable in Flow/runtime but cannot be mutated by `runtime-output.patch`.
     */
    runtimePatchable?: boolean;
}
export interface ComponentEventDefinition<TSchema extends ZodTypeAny = ZodTypeAny> {
    id: string;
    label: string;
    description?: string;
    payloadSchema: TSchema;
    /**
     * Canonical data-type id for identity event-output mappings. When set,
     * payloadSchema must be the exact schema object returned by getDataTypeSchema(payloadTypeId).
     */
    payloadTypeId?: DataTypeId;
}
export interface EventOutputInitialContext<TConfig extends Record<string, unknown> = Record<string, unknown>> {
    config: TConfig;
    inputs: Record<string, unknown>;
    instanceId: string;
    componentId: string;
}
export interface EventOutputBinding<TConfig extends Record<string, unknown> = Record<string, unknown>> {
    eventId: string;
    outputId: string;
    /** Optional initial runtime value before the first event emission. Default/false: unset. */
    initial?: false | ((context: EventOutputInitialContext<TConfig>) => unknown);
    /** Optional projection from event payload to output value. Default: identity. */
    project?: (payload: unknown) => unknown;
}
export interface ResolvedPorts {
    inputs: InputPortDefinition[];
    outputs: OutputPortDefinition[];
}
export interface ResolvePortsContext<TConfig extends Record<string, unknown>> {
    config: TConfig;
    inputs: readonly InputPortDefinition[];
    outputs: readonly OutputPortDefinition[];
}
export interface ResolvedSlots {
    slots: SlotDefinition[];
}
export interface ResolveSlotsContext<TConfig extends Record<string, unknown>> {
    config: TConfig;
    slots: readonly SlotDefinition[];
}
export interface TransformContext<TConfig extends Record<string, unknown> = Record<string, unknown>, TInputs extends Record<string, unknown> = Record<string, unknown>> {
    config: TConfig;
    inputs: TInputs;
}
export interface TransformModule<TConfig extends Record<string, unknown> = Record<string, unknown>, TInputs extends Record<string, unknown> = Record<string, unknown>, TOutputs extends Record<string, unknown> = Record<string, unknown>> {
    transform: (context: TransformContext<TConfig, TInputs>) => TOutputs | Promise<TOutputs>;
}
export interface RuntimeExecutionContext<TConfig extends Record<string, unknown> = Record<string, unknown>, TInputs extends Record<string, unknown> = Record<string, unknown>, TFixtureData = unknown> extends TransformContext<TConfig, TInputs> {
    configValid: boolean;
    fixtureData: TFixtureData;
    instanceId: string;
    previousOutputs?: Record<string, unknown>;
}
export interface RuntimeHttpRequestNodeCachePersistence {
    data: JsonValue;
    fetchedAt: string;
    requestSignature: string;
}
export type ComponentRuntimeEffect = {
    kind: "http-request-cache-write";
    instanceId: string;
    cachePersistence: RuntimeHttpRequestNodeCachePersistence;
};
export interface RuntimeExecutionResult<TOutputs extends Record<string, unknown> = Record<string, unknown>> {
    outputs: TOutputs;
    effects?: ComponentRuntimeEffect[];
}
export interface RuntimeModule<TConfig extends Record<string, unknown> = Record<string, unknown>, TInputs extends Record<string, unknown> = Record<string, unknown>, TFixtureData = unknown, TOutputs extends Record<string, unknown> = Record<string, unknown>> {
    evaluate: (context: RuntimeExecutionContext<TConfig, TInputs, TFixtureData>) => RuntimeExecutionResult<TOutputs> | Promise<RuntimeExecutionResult<TOutputs>>;
}
export type ComponentConfig<TSchema extends ZodTypeAny> = z.output<TSchema> & Record<string, unknown>;
export type ComponentConfigInput<TSchema extends ZodTypeAny> = z.input<TSchema> & Record<string, unknown>;
export type PortOutputMap<TOutputs extends readonly OutputPortDefinition[]> = Partial<Record<TOutputs[number]["id"], unknown>>;
export interface FixtureVariantMeta {
    id: string;
    label: string;
    description?: string;
    /**
     * Preview-app intent for this variant payload. Variants default to fixture data;
     * set to "config" only when the payload is an explicit config preset.
     */
    appliesTo?: "fixture-data" | "config";
}
export type StateApplicability = true | {
    notApplicable: string;
};
export interface StateSupportMeta {
    empty: StateApplicability;
    loading: StateApplicability;
    error: StateApplicability;
    disabled: StateApplicability;
    focus: StateApplicability;
    keyboard: StateApplicability;
    responsive: StateApplicability;
}
export type DataBoundaryDirection = "ingress" | "egress";
export type DataBoundarySourceKind = "root" | "http" | "file" | "dataset" | "download" | "event" | "custom";
export type DataBoundaryMetric = "bytes" | "rows" | "lines" | "objects" | "loadDurationMs" | "cacheAgeMs" | "refreshCadence";
export type DataBoundaryExportBehavior = "live" | "embedded" | "fallback" | "not-applicable" | "custom";
export interface DataBoundaryMetadata {
    readonly directions: readonly DataBoundaryDirection[];
    readonly sourceKind?: DataBoundarySourceKind;
    readonly supportsRefresh?: boolean;
    readonly supportsCache?: boolean;
    readonly supportsOverride?: boolean;
    readonly supportsPayloadPreview?: boolean;
    readonly supportsPromotion?: boolean;
    readonly metrics?: readonly DataBoundaryMetric[];
    readonly exportBehavior?: DataBoundaryExportBehavior;
}
export interface ComponentDefinition<TSchema extends ZodTypeAny = ZodTypeAny> {
    id: string;
    version: number;
    displayName: string;
    description?: string;
    icon: string;
    category: ComponentCategory;
    renderable: boolean;
    slots: SlotDefinition[];
    /**
     * Source-owned description for dynamic slots. Realized slots still come from
     * resolveSlots() and the effective component config; hosts must not persist
     * these templates as concrete project slots.
     */
    dynamicSlots?: readonly DynamicSlotMetadata[];
    configSchema: TSchema;
    configDefaults: ComponentConfig<TSchema>;
    builder: BuilderBehavior;
    flow: FlowBehavior;
    inputs: InputPortDefinition[];
    outputs: OutputPortDefinition[];
    events?: readonly ComponentEventDefinition[];
    eventOutputs?: readonly EventOutputBinding[];
    /**
     * Optional source-owned data ingress/egress metadata used by hosts to build
     * data-operations discovery without scraping renderer or route internals.
     */
    dataBoundary?: DataBoundaryMetadata;
    /**
     * Optional source-owned component-theme contract: which theme roles the
     * renderer/config UI consumes, which output ports publish theme payloads,
     * and which input ports drive theme inheritance for descendants.
     */
    themeContract?: ComponentThemeContract;
    params: ComponentParams;
    resolvePorts?: (context: ResolvePortsContext<ComponentConfig<TSchema>>) => ResolvedPorts;
    resolveSlots?: (context: ResolveSlotsContext<ComponentConfig<TSchema>>) => ResolvedSlots;
    missingDataBehavior?: string;
    renderer?: () => Promise<unknown>;
    configPanel?: () => Promise<unknown>;
    transform?: () => Promise<unknown>;
    runtime?: () => Promise<unknown>;
    fixtureVariants?: readonly FixtureVariantMeta[];
    stateSupport?: StateSupportMeta;
    loadFixtureData: () => Promise<unknown>;
    loadFixtureVariants?: () => Promise<Record<string, unknown>>;
}
export type ComponentDefinitionInput<TSchema extends ZodTypeAny = ZodTypeAny> = Omit<ComponentDefinition<TSchema>, "configDefaults" | "slots"> & {
    slots?: SlotDefinition[];
    configDefaults: ComponentConfigInput<TSchema>;
};
export interface StaticComponentRenderProps<TConfig extends Record<string, unknown> = Record<string, unknown>, TFixtureData = unknown> {
    config?: Partial<TConfig>;
    /** Host-provided component instance label for accessible renderer controls. */
    label?: string;
    fixtureData?: TFixtureData;
    runtimeOutputs?: Record<string, unknown>;
    /** Runtime output ids currently backed by same-name component inputs for this render. */
    runtimeInputIds?: readonly string[];
    updateRuntimeOutputs?: (nextOutputs: Record<string, unknown>) => void | Promise<void>;
    /** Preview device hint passed by the preview runtime. "mobile" forces stacked layout in container components. */
    device?: string;
    /** Host-resolved component theme context. Renderers should consume it through SDK theme helpers. */
    themeContext?: ComponentThemeContext;
    /** Emit a declared event as a synchronous fire-and-forget signal. */
    emitEvent?: (eventId: string, payload: unknown) => void;
    /** Host render intent. Authoring may use bounded/progressive rendering; exact/export must render full output. */
    renderMode?: "authoring" | "exact" | "export";
    /** Optional host diagnostics sink. Renderers may report privacy-safe counts only. */
    diagnostics?: StaticComponentDiagnostics;
    /** Optional package-safe host worker/cache service for expensive dataset derivations. */
    datasetDerivationService?: DatasetDerivationService;
}
export interface StaticComponentRenderDiagnosticsCounts {
    /** Number of root data rows observed by data renderers; never includes row payloads. */
    readonly rootDataRows?: number;
    /** Number of concrete items rendered by a structural renderer such as Repeater. */
    readonly renderedItems?: number;
    /** Repeater-specific input/item count, kept distinct for summary filters. */
    readonly repeaterItems?: number;
    /** Number of child placements fanned out inside the structural renderer. */
    readonly childPlacements?: number;
}
export interface StaticComponentRenderDiagnosticsEvent {
    readonly componentId: string;
    readonly phaseName?: string;
    readonly counts: StaticComponentRenderDiagnosticsCounts;
}
/**
 * MapLibre/vmap1 lifecycle status reported through privacy-safe diagnostics
 * events. Values match the renderer's `RenderStatus` union plus an explicit
 * "loading" entry so hosts can attribute time-to-idle without inferring
 * lifecycle phase from copy strings.
 */
export type StaticComponentMapLibreDiagnosticsStatus = "empty" | "loading" | "ready" | "no-layers" | "style-error" | "source-error" | "map-error" | "unsupported" | "deck-unavailable";
/** WebGL probe outcome reported as a coarse capability label, never a context object. */
export type StaticComponentMapLibreDiagnosticsWebGLSupport = "webgl2" | "webgl" | "experimental-webgl" | "unsupported" | "unknown";
export interface StaticComponentMapLibreDiagnosticsCounts {
    /** Total declared sources reaching MapLibre after registry resolution. */
    readonly sourceCount?: number;
    /** Total declared layers reaching MapLibre, including non-renderable entries. */
    readonly layerCount?: number;
    /** Subset of `layerCount` that produced a valid MapLibre layer spec. */
    readonly renderableLayerCount?: number;
    /** Visible deck.gl overlay descriptors reaching the MapLibre overlay seam. */
    readonly visibleDeckLayerCount?: number;
    /** Layers confirmed registered on the live MapLibre instance after reconciliation. */
    readonly reconciledLayerCount?: number;
    /**
     * Bounded estimate of features the renderer believes the surface is hosting.
     * Omitted (undefined) when the controller seam cannot estimate without
     * dipping into raw feature payloads.
     */
    readonly featureCountEstimate?: number;
    /**
     * Tile network requests attributable to MapLibre during the sample window.
     * Omitted when the runtime cannot observe MapLibre's network seam.
     */
    readonly tileRequestCount?: number;
}
export interface StaticComponentMapLibreDiagnosticsTimings {
    /** Whole-mount time from container attach to the first ready/idle signal. */
    readonly timeToIdleMs?: number;
    /** Latest style load duration measured from setStyle to style.load. */
    readonly styleLoadDurationMs?: number;
    /** Latest source load duration measured from addSource to sourcedata.isSourceLoaded. */
    readonly sourceLoadDurationMs?: number;
    /** Optional last-observed frame cost when the renderer can sample it. */
    readonly lastFrameDurationMs?: number;
}
export interface StaticComponentMapLibreDiagnosticsEvent {
    readonly componentId: string;
    readonly phaseName?: string;
    readonly status: StaticComponentMapLibreDiagnosticsStatus;
    readonly webglSupport?: StaticComponentMapLibreDiagnosticsWebGLSupport;
    readonly counts?: StaticComponentMapLibreDiagnosticsCounts;
    readonly timings?: StaticComponentMapLibreDiagnosticsTimings;
    /**
     * Optional deterministic, content-hashed label for a specific source the
     * event is about (e.g. on per-source load events). Never a raw sourceRef,
     * sourceId, or URL — the package MUST hash before calling this method.
     */
    readonly sourceLabel?: string;
    /**
     * Optional deterministic, content-hashed label for a specific layer. Never
     * a raw layer id or MapLibre spec id — the package MUST hash before calling.
     */
    readonly layerLabel?: string;
}
/**
 * Audit lane the audit event belongs to. Distinguishes Repeater-style list
 * fan-out from Table-style row pagination so host summaries can group/filter
 * without inferring intent from component IDs.
 */
export type StaticComponentVirtualizationAuditMode = "list-items" | "table-rows";
/**
 * Classification of how the renderer is bounding output for this render pass.
 *
 * - "not-needed": source is empty or trivially small; no bounded behavior in
 *   effect.
 * - "exact": every source item is rendered for this pass (e.g. Repeater in
 *   exact/export mode, or a Table page that contains every row).
 * - "bounded-authoring": the renderer is deliberately showing a partial range
 *   in authoring mode and exact/export will render the full source.
 * - "bounded-paginated": the renderer is showing one page of a larger source,
 *   independent of authoring/export mode. Hosts surface this so consumers do
 *   not mistake a paginated preview for acceptable static-export output.
 * - "unknown": the renderer could not classify because the host render mode
 *   was not provided.
 */
export type StaticComponentVirtualizationAuditStatus = "not-needed" | "exact" | "bounded-authoring" | "bounded-paginated" | "unknown";
/**
 * Render mode reported by the host for this pass. Mirrors the
 * `StaticComponentRenderProps.renderMode` union plus an explicit "unknown"
 * entry for renderers that received no host signal.
 */
export type StaticComponentVirtualizationAuditRenderMode = "authoring" | "exact" | "export" | "unknown";
/**
 * Privacy-safe count facts about the current virtualization audit pass. Only
 * integer counts derived from source/render math are allowed — raw row
 * payloads, item labels, IDs, paths, or descriptor config MUST NOT appear in
 * audit events.
 */
export interface StaticComponentVirtualizationAuditCounts {
    /** Items observed from the resolved source (e.g. total repeater items or table rows). */
    readonly sourceItemCount?: number;
    /** Items rendered to the DOM for the current pass. */
    readonly renderedItemCount?: number;
    /** Max items the bounded preview surfaces in one pass (e.g. table page size). */
    readonly previewCap?: number;
    /** Items the exact/export render path would emit for this configuration. */
    readonly exportItemCount?: number;
    /**
     * Bounded privacy-safe estimate of the DOM units an exact/export render
     * would produce. Renderers MUST derive this from already-known structural
     * counts (e.g. item count, column count) and MUST NOT inspect row payloads,
     * item values, descriptor config, or user data to compute it. Hosts use the
     * value to size full-render cost without observing source content.
     */
    readonly estimatedFullDomCost?: number;
}
/**
 * Optional virtualization/bounded-authoring audit. Package list/table
 * renderers may report this so hosts can attribute bounded preview behavior
 * and compare against exact/export expectations without inspecting payloads.
 */
export interface StaticComponentVirtualizationAuditEvent {
    readonly componentId: string;
    readonly phaseName?: string;
    readonly mode: StaticComponentVirtualizationAuditMode;
    readonly status: StaticComponentVirtualizationAuditStatus;
    readonly renderMode: StaticComponentVirtualizationAuditRenderMode;
    /**
     * True only when the renderer truly windows DOM (skips out-of-view items).
     * Bounded-authoring or paginated rendering must report false because the
     * unrendered subset is gated by intent, not by a virtualization seam.
     */
    readonly virtualized: boolean;
    /** True when the bounded-authoring preview is actively hiding source items. */
    readonly boundedAuthoring: boolean;
    readonly counts?: StaticComponentVirtualizationAuditCounts;
}
export interface StaticComponentDiagnostics {
    /**
     * Optional availability signal. Hosts that always provide diagnostics
     * callbacks (so package renderers stay coupled only to the SDK shape)
     * use this to flip consumption on/off at runtime — e.g. the app's
     * performance-diagnostics store starts disabled by default. Package
     * renderers that run side-effecting profiling loops (chained RAF
     * samplers, polling probes, etc.) MUST gate those loops on
     * `isEnabled?.()` so they do not run when the host has not opted in,
     * even though the matching `record*` callbacks remain callable.
     * When `isEnabled` is not provided, callers should fall back to the
     * presence of the relevant `record*` callback for backward compatibility.
     */
    isEnabled?(): boolean;
    recordRenderCount(event: StaticComponentRenderDiagnosticsEvent): void;
    /**
     * Optional MapLibre/vmap1 diagnostics sink. Package components may report
     * lifecycle/cost facts as privacy-safe counts, status labels, coarse webgl
     * capability, and pre-hashed source/layer labels. Raw style URLs, tile URLs,
     * sourceRefs, layer IDs, descriptor config, and feature properties MUST NOT
     * be reported through this method.
     */
    recordMapLibreDiagnostic?(event: StaticComponentMapLibreDiagnosticsEvent): void;
    /**
     * Optional virtualization/bounded-authoring audit sink. Renderers that
     * deliberately bound output (e.g. Repeater authoring window, Table page
     * window) report source/rendered counts, preview caps, and the host render
     * mode so consumers can flag bounded preview behavior — particularly when
     * it would otherwise be mistaken for acceptable static-export output. Raw
     * row payloads, item labels, IDs, and paths MUST NOT be reported through
     * this method.
     */
    recordVirtualizationAudit?(event: StaticComponentVirtualizationAuditEvent): void;
}
export interface StaticComponentTransformContext<TConfig extends Record<string, unknown> = Record<string, unknown>, TInputs extends Record<string, unknown> = Record<string, unknown>, TFixtureData = unknown> {
    config: TConfig;
    inputs: TInputs;
    fixtureData: TFixtureData;
}
export interface StaticComponentTransformModule<TConfig extends Record<string, unknown> = Record<string, unknown>, TInputs extends Record<string, unknown> = Record<string, unknown>, TFixtureData = unknown, TOutputs extends Record<string, unknown> = Record<string, unknown>> {
    outputSchema: ZodTypeAny;
    transform: (context: StaticComponentTransformContext<TConfig, TInputs, TFixtureData>) => TOutputs | Promise<TOutputs>;
}

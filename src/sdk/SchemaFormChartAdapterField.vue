<script setup lang="ts">
// Chart adapter control implementation for SchemaForm (Phase 2.3 / Task 44.8).
//
// One descriptor edits multiple chart-mapping config keys at once: a rows
// path key plus a list of role-tagged field keys (e.g. xField/yField for
// bar/line, labelField/valueField for donut). Reads option suggestions from
// the package-owned chart-data-helpers so panels do not duplicate adapter
// logic. Emits a multi-key `update:configPatch` payload because changing
// the rows path also resuggests dependent field paths.

import { computed, onUnmounted, ref, watch } from "vue";

import {
  deriveChartFieldOptions,
  deriveChartRowsPathOptions,
  filterChartFieldOptions,
  formatChartFieldOptionSummary,
  formatChartRowsPathOptionSummary,
  resolveChartRows,
  resolveServiceChartRows,
  suggestChartFieldPath,
  validateChartFieldSelection,
  type ChartFieldOption,
  type ChartFieldRole,
} from "./chart-data-helpers";
import { ConfigSelector } from "./component-ui-primitives";
import {
  clearBrowserTimeout,
  setBrowserTimeout,
  type BrowserTimeoutHandle,
} from "./helpers/browser";
import type { JsonValue, ParamChartAdapterFieldDescriptor, ParamDescriptor } from "./public-sdk";
import type {
  DatasetChartFieldOption,
  DatasetDerivationRequest,
  DatasetDerivationResponse,
  DatasetDerivationService,
} from "./runtime-services";

const AUTHORING_FIELD_OPTIONS_ROW_LIMIT = 500;

const props = withDefaults(
  defineProps<{
    fieldKey: string;
    descriptor: ParamDescriptor;
    config: Record<string, unknown>;
    data: JsonValue | undefined;
    datasetDerivationService?: DatasetDerivationService;
    /**
     * Resolved disabled state from a sibling `disabledWhen` predicate. When
     * true the rows selector and every per-role field selector are switched to
     * a non-interactive state, and every emit helper defensively no-ops so a
     * pending service response or deferred field patch cannot mutate config
     * after the field has been disabled.
     */
    disabled?: boolean;
    /** Explanation paired with field-level disabled state. */
    disabledHelpText?: string;
  }>(),
  { datasetDerivationService: undefined, disabled: false, disabledHelpText: undefined },
);

const emit = defineEmits<{
  (e: "update:configPatch", patch: Record<string, unknown>): void;
}>();

interface ResolvedControl {
  kind: "chart-adapter";
  rowsKey: string;
  fields: readonly ParamChartAdapterFieldDescriptor[];
  rowsLabel?: string;
  rowsHint?: string;
  rowsPlaceholder?: string;
  testId?: string;
}

const control = computed<ResolvedControl>(() => {
  const candidate = props.descriptor.meta.control;
  if (candidate.kind !== "chart-adapter") {
    // SchemaForm only routes chart-adapter descriptors here; this guard keeps
    // the component honest if it is ever mounted directly in a test.
    return { kind: "chart-adapter", rowsKey: props.fieldKey, fields: [] };
  }
  return candidate;
});

const disabledExplanation = computed<string | null>(() => {
  if (!props.disabled) return null;
  return (
    props.disabledHelpText ?? props.descriptor.meta.helpText ?? "Controlled by another setting."
  );
});

function readStringConfig(key: string): string {
  const value = props.config[key];
  return typeof value === "string" ? value : "";
}

const rowsPathValue = computed(() => readStringConfig(control.value.rowsKey));
const rowsPathOptions = computed(() =>
  deriveChartRowsPathOptions(props.data, {
    includeFieldCount: props.datasetDerivationService === undefined,
  }),
);
const rowsLookup = computed(() => {
  if (props.datasetDerivationService) {
    return resolveServiceChartRows(props.data, rowsPathValue.value);
  }
  return resolveChartRows(props.data, rowsPathValue.value);
});
const serviceFieldOptions = ref<ChartFieldOption[]>([]);
const serviceStatus = ref<"idle" | "pending" | "failed">("idle");
const latestServiceRequestId = ref<string | null>(null);
const pendingRowsResuggestionPath = ref<string | null>(null);
const pendingFieldPatches = new Map<string, string>();
let pendingFieldPatchTimer: BrowserTimeoutHandle | null = null;
const fieldOptions = computed<ChartFieldOption[]>(() => {
  if (props.datasetDerivationService) return serviceFieldOptions.value;
  const lookup = rowsLookup.value as ReturnType<typeof resolveChartRows>;
  return lookup.ok ? deriveChartFieldOptions(lookup.rows) : [];
});

function formatUnavailableLabel(currentValue: string, fallback: string) {
  return `${currentValue || fallback} · unavailable in current data`;
}

const rowsSelectorOptions = computed(() => {
  const options = rowsPathOptions.value.map((option) => ({
    value: option.path,
    label: formatChartRowsPathOptionSummary(option),
  }));
  const current = rowsPathValue.value.trim();
  if (current.length === 0 || options.some((option) => option.value === current)) {
    return options;
  }
  return [{ value: current, label: formatUnavailableLabel(current, "(root)") }, ...options];
});

interface ResolvedField {
  key: string;
  role: ChartFieldRole;
  label: string;
  hint?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  disabled: boolean;
  validationError: string | null;
}

const resolvedFields = computed<readonly ResolvedField[]>(() =>
  control.value.fields.map((field) => {
    const value = readStringConfig(field.key);
    const filtered = filterChartFieldOptions(fieldOptions.value, field.role);
    const options = filtered.map((option) => ({
      value: option.path,
      label: formatChartFieldOptionSummary(option),
    }));
    const trimmed = value.trim();
    const includeCurrent =
      trimmed.length > 0 && !options.some((option) => option.value === trimmed);
    const finalOptions = includeCurrent
      ? [{ value: trimmed, label: formatUnavailableLabel(trimmed, "(none)") }, ...options]
      : options;

    let validationError: string | null = null;
    if (rowsLookup.value.ok && trimmed.length > 0) {
      const validation = validateChartFieldSelection(fieldOptions.value, field.role, trimmed);
      if (!validation.ok) {
        validationError = validation.error;
      }
    }

    return {
      key: field.key,
      role: field.role,
      label: field.label ?? defaultFieldLabel(field.role),
      hint: field.hint,
      value,
      options: finalOptions,
      disabled: props.disabled || !rowsLookup.value.ok,
      validationError,
    } satisfies ResolvedField;
  }),
);

function defaultFieldLabel(role: ChartFieldRole): string {
  switch (role) {
    case "x":
      return "X field";
    case "y":
      return "Y field";
    case "label":
      return "Label field";
    default:
      return "Value field";
  }
}

const noData = computed(() => props.data === undefined || rowsPathOptions.value.length === 0);
// Field-level disabled (from `disabledWhen`) wins over data-derived availability
// so the rows selector and every per-role field selector are switched off even
// when the underlying data would otherwise allow editing.
const rowsDisabled = computed(() => props.disabled || rowsSelectorOptions.value.length === 0);
const sourceRevisionIds = new WeakMap<readonly JsonValue[], number>();
let nextSourceRevisionId = 1;

const rowsHelperMessage = computed(() => {
  if (props.data === undefined) {
    return "Connect data to unlock guided chart field suggestions.";
  }
  if (rowsPathOptions.value.length === 0) {
    return "No arrays of objects detected in the connected data yet.";
  }
  if (!rowsLookup.value.ok) {
    return (
      rowsLookup.value.state.description ??
      rowsLookup.value.state.title ??
      "Pick a rows path to enable field suggestions."
    );
  }
  if (serviceStatus.value === "failed") {
    return "Field suggestions unavailable. Keep the current field or choose another rows path.";
  }
  if (serviceStatus.value === "pending") {
    return "Updating field suggestions…";
  }
  return (
    control.value.rowsHint ??
    `Pick an array of objects to chart. ${fieldOptions.value.length} fields detected across ${rowsLookup.value.rows.length} rows.`
  );
});

const asyncRowsHelperStatus = computed(() => {
  if (!props.datasetDerivationService || !rowsLookup.value.ok) return null;
  if (serviceStatus.value !== "pending" && serviceStatus.value !== "failed") return null;
  return rowsHelperMessage.value;
});

watch(
  () =>
    [props.datasetDerivationService, props.data, rowsPathValue.value, rowsLookup.value] as const,
  () => {
    void requestServiceFieldOptionsForCurrentRows();
  },
  { immediate: true },
);

type ChartFieldOptionsDerivationRequest = DatasetDerivationRequest & {
  dataset?: JsonValue;
  chartFieldOptions?: Record<string, never>;
};

async function requestServiceFieldOptionsForCurrentRows(): Promise<void> {
  const service = props.datasetDerivationService;
  if (!service) {
    resetServiceState();
    return;
  }

  if (!rowsLookup.value.ok) {
    serviceFieldOptions.value = [];
    serviceStatus.value = "idle";
    latestServiceRequestId.value = null;
    return;
  }

  const rowsPath = rowsPathValue.value;
  const requestMetadata = createChartFieldOptionsRequestMetadata(rowsPath, rowsLookup.value.rows);
  if (
    latestServiceRequestId.value === requestMetadata.requestId &&
    serviceStatus.value !== "failed"
  ) {
    return;
  }

  serviceStatus.value = "pending";
  latestServiceRequestId.value = requestMetadata.requestId;

  const request = createChartFieldOptionsRequest(requestMetadata, rowsLookup.value.rows);
  const response = await service.derive(request);
  applyServiceFieldOptionsResponse(response, rowsPath);
}

function resetServiceState(): void {
  serviceFieldOptions.value = [];
  serviceStatus.value = "idle";
  latestServiceRequestId.value = null;
  pendingRowsResuggestionPath.value = null;
}

function applyServiceFieldOptionsResponse(
  response: DatasetDerivationResponse,
  responseRowsPath: string,
): void {
  if (latestServiceRequestId.value !== response.requestId) return;

  if (response.status === "success" && response.kind === "chart-field-options") {
    const options = (response.result.chartFieldOptions ?? []).map(mapServiceFieldOption);
    serviceFieldOptions.value = options;
    serviceStatus.value = "idle";
    applyPendingRowsResuggestion(responseRowsPath, options);
    return;
  }

  serviceFieldOptions.value = [];
  serviceStatus.value = "failed";
}

function applyPendingRowsResuggestion(
  responseRowsPath: string,
  options: readonly ChartFieldOption[],
): void {
  if (pendingRowsResuggestionPath.value !== responseRowsPath) return;
  pendingRowsResuggestionPath.value = null;

  // Guard against a late service response landing after `disabled` flipped
  // true — the in-flight resuggest would otherwise commit a multi-key config
  // patch that the field's `disabledWhen` predicate explicitly blocks.
  if (emitGuard()) return;

  const patch = createRowsFieldSuggestionPatch(responseRowsPath, options, true);
  if (Object.keys(patch).length > 1) {
    emit("update:configPatch", patch);
  }
}

function emitGuard(): boolean {
  return props.disabled === true;
}

function mapServiceFieldOption(option: DatasetChartFieldOption): ChartFieldOption {
  return {
    path: option.path,
    label: option.label,
    sampleValue: option.sampleValue,
    availableRowCount: option.availableRowCount,
    numericRowCount: option.numericRowCount,
    categoricalRowCount: option.categoricalRowCount,
    supportedRoles: option.supportedRoles,
  };
}

interface ChartFieldOptionsRequestMetadata {
  requestId: string;
  datasetPath: string;
  sourceHash: `sha256:${string}`;
  configSignature: `sha256:${string}`;
  materializationSignature: `sha256:${string}`;
}

function createChartFieldOptionsRequestMetadata(
  rowsPath: string,
  rows: readonly JsonValue[],
): ChartFieldOptionsRequestMetadata {
  const datasetPath = rowsPath.trim() || "__root__";
  const sourceHash = createChartFieldSourceSignature(datasetPath, rows);
  const configSignature = createStableSignature({
    fields: control.value.fields.map((field) => field.role),
    maxSampleRows: AUTHORING_FIELD_OPTIONS_ROW_LIMIT,
  });
  const materializationSignature = createStableSignature({
    componentId: "schema-form.chart-adapter",
    configContract: "dataset-derivation-service-v1",
  });

  return {
    requestId: [
      "schema-form.chart-adapter",
      sourceHash,
      datasetPath,
      configSignature,
      materializationSignature,
    ].join(":"),
    datasetPath,
    sourceHash,
    configSignature,
    materializationSignature,
  };
}

function createChartFieldOptionsRequest(
  metadata: ChartFieldOptionsRequestMetadata,
  rows: readonly JsonValue[],
): ChartFieldOptionsDerivationRequest {
  const requestRows = rows.slice(0, AUTHORING_FIELD_OPTIONS_ROW_LIMIT);

  return {
    requestId: metadata.requestId,
    kind: "chart-field-options",
    rootSource: {
      id: `config-panel:${metadata.datasetPath}`,
      contentHash: metadata.sourceHash,
    },
    datasetPath: metadata.datasetPath,
    target: { componentId: "schema-form.chart-adapter" },
    materialization: { definitionHash: metadata.materializationSignature },
    configSignature: metadata.configSignature,
    dataset: requestRows,
    chartFieldOptions: {},
  };
}

function createChartFieldSourceSignature(
  datasetPath: string,
  rows: readonly JsonValue[],
): `sha256:${string}` {
  return createStableSignature({
    datasetPath,
    rowCount: rows.length,
    sourceRevision: getRowsSourceRevision(rows),
  });
}

function getRowsSourceRevision(rows: readonly JsonValue[]): number {
  const existing = sourceRevisionIds.get(rows);
  if (existing !== undefined) return existing;
  const next = nextSourceRevisionId;
  nextSourceRevisionId += 1;
  sourceRevisionIds.set(rows, next);
  return next;
}

function createStableSignature(value: unknown): `sha256:${string}` {
  const json = stableStringify(value);
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;

  for (let index = 0; index < json.length; index += 1) {
    hash ^= BigInt(json.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * prime);
  }

  const segment = hash.toString(16).padStart(16, "0");
  return `sha256:${segment}${segment}${segment}${segment}`;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function rootTestId(): string {
  return control.value.testId ?? `${props.fieldKey}-chart-adapter`;
}

function rowsSelectorTestId(): string {
  return `${rootTestId()}-rows`;
}

function fieldSelectorTestId(field: ResolvedField): string {
  return `${rootTestId()}-field-${field.key}`;
}

function fieldHintTestId(field: ResolvedField): string {
  return `${rootTestId()}-field-${field.key}-validation`;
}

function rowsHelperTestId(): string {
  return `${rootTestId()}-rows-helper`;
}

function rowsHelperStatusTestId(): string {
  return `${rootTestId()}-rows-helper-status`;
}

function noDataTestId(): string {
  return `${rootTestId()}-no-data`;
}

function onRowsChange(nextRowsPath: string) {
  if (emitGuard()) return;
  if (props.datasetDerivationService) {
    const rowsState = resolveServiceChartRows(props.data, nextRowsPath);
    if (!rowsState.ok) {
      emit("update:configPatch", createRowsFieldSuggestionPatch(nextRowsPath, [], false));
      pendingRowsResuggestionPath.value = null;
      return;
    }

    pendingRowsResuggestionPath.value = nextRowsPath;
    emit("update:configPatch", { [control.value.rowsKey]: nextRowsPath });
    return;
  }

  const rowsState = resolveChartRows(props.data, nextRowsPath);
  const nextFieldOptions = rowsState.ok ? deriveChartFieldOptions(rowsState.rows) : [];
  const patch = createRowsFieldSuggestionPatch(nextRowsPath, nextFieldOptions, rowsState.ok);

  emit("update:configPatch", patch);
}

function createRowsFieldSuggestionPatch(
  nextRowsPath: string,
  nextFieldOptions: readonly ChartFieldOption[],
  keepValidCurrent: boolean,
): Record<string, unknown> {
  const patch: Record<string, unknown> = { [control.value.rowsKey]: nextRowsPath };

  for (const field of control.value.fields) {
    const currentValue = readStringConfig(field.key);
    // Preserve the current selection only when it is still valid for the
    // newly resolved rows; otherwise fall back to a role-appropriate
    // suggestion (or empty string if no candidate exists).
    const suggested = suggestChartFieldPath(
      nextFieldOptions,
      field.role,
      keepValidCurrent ? currentValue : "",
    );
    if (suggested !== currentValue) {
      patch[field.key] = suggested;
    }
  }

  return patch;
}

function onFieldChange(field: ResolvedField, nextValue: string) {
  if (emitGuard()) return;
  if (nextValue === field.value) {
    pendingFieldPatches.delete(field.key);
    clearPendingFieldPatchTimerIfIdle();
    return;
  }

  pendingFieldPatches.set(field.key, nextValue);
  scheduleFieldPatchFlush();
}

function scheduleFieldPatchFlush(): void {
  if (pendingFieldPatchTimer !== null) return;

  pendingFieldPatchTimer = setBrowserTimeout(flushPendingFieldPatches, 0);
  if (pendingFieldPatchTimer === null) {
    flushPendingFieldPatches();
  }
}

function flushPendingFieldPatches(): void {
  pendingFieldPatchTimer = null;
  if (pendingFieldPatches.size === 0) return;
  // Guard against a deferred flush firing after `disabled` flipped true while
  // the timer was queued — drop the pending patches instead of emitting them.
  if (emitGuard()) {
    pendingFieldPatches.clear();
    return;
  }

  const patch = Object.fromEntries(pendingFieldPatches.entries());
  pendingFieldPatches.clear();
  emit("update:configPatch", patch);
}

function clearPendingFieldPatchTimerIfIdle(): void {
  if (pendingFieldPatches.size > 0) return;
  clearBrowserTimeout(pendingFieldPatchTimer);
  pendingFieldPatchTimer = null;
}

onUnmounted(() => {
  clearBrowserTimeout(pendingFieldPatchTimer);
  pendingFieldPatchTimer = null;
  pendingFieldPatches.clear();
});
</script>

<template>
  <fieldset
    class="flex flex-col gap-3"
    :data-field="fieldKey"
    :data-testid="rootTestId()"
    :data-no-data="noData ? 'true' : 'false'"
  >
    <div :data-field="`${fieldKey}-${control.rowsKey}`" :data-testid="rowsSelectorTestId()">
      <ConfigSelector
        :model-value="rowsPathValue"
        :options="rowsSelectorOptions"
        :disabled="rowsDisabled"
        :label="control.rowsLabel ?? descriptor.meta.label"
        :placeholder="control.rowsPlaceholder ?? 'Choose rows'"
        :hint="rowsHelperMessage"
        @update:model-value="(value: string) => onRowsChange(value)"
      />
      <p
        v-if="asyncRowsHelperStatus"
        class="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        :data-testid="rowsHelperStatusTestId()"
      >
        {{ asyncRowsHelperStatus }}
      </p>
      <p
        v-if="disabledExplanation"
        class="mt-1.5 text-xs text-muted-foreground/80"
        :data-testid="`${fieldKey}-disabled-help`"
      >
        {{ disabledExplanation }}
      </p>
    </div>

    <p
      v-if="noData"
      class="rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground/70"
      :data-testid="noDataTestId()"
    >
      Connect data with at least one array of objects to unlock guided chart field suggestions.
    </p>

    <p
      v-else-if="!rowsLookup.ok"
      class="text-xs text-muted-foreground/70"
      :data-testid="rowsHelperTestId()"
    >
      {{ rowsHelperMessage }}
    </p>

    <div v-if="resolvedFields.length > 0" class="flex flex-col gap-3">
      <div
        v-for="field in resolvedFields"
        :key="field.key"
        :data-field="`${fieldKey}-${field.key}`"
        :data-testid="fieldSelectorTestId(field)"
      >
        <ConfigSelector
          :model-value="field.value"
          :options="field.options"
          :disabled="field.disabled || field.options.length === 0"
          :label="field.label"
          :placeholder="`Choose ${field.label.toLowerCase()}`"
          :hint="field.hint"
          @update:model-value="(value: string) => onFieldChange(field, value)"
        />
        <p
          v-if="field.validationError"
          class="mt-1 text-xs text-destructive"
          role="alert"
          :data-testid="fieldHintTestId(field)"
        >
          {{ field.validationError }}
        </p>
      </div>
    </div>
  </fieldset>
</template>

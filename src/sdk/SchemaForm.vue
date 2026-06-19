<script setup lang="ts">
// Schema-driven config form (Phase 2.3 / Task 44).
//
// Renders literal controls described by `ParamControl` descriptors and the
// shared `Literal | From data` binding UI through a per-field child component
// (`./SchemaFormField.vue`). This module owns top-level dispatching:
//
//   - filtering hidden params (`meta.visible: false`),
//   - grouping fields by `meta.group` into flat disclosure sections (Task 44.4),
//   - patching parent state when individual fields emit value/bind updates.
//
// SchemaForm is re-exported by `./component-ui.ts`, so it MUST NOT import the
// barrel — primitives and the field renderer come through sibling modules to
// keep the facade cycle-free.

import { computed, inject, nextTick, reactive, ref, watch } from "vue";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Icon,
} from "./component-ui-primitives";
import SchemaFormChartAdapterField from "./SchemaFormChartAdapterField.vue";
import SchemaFormField from "./SchemaFormField.vue";
import type {
  ComponentParams,
  ComponentThemeContext,
  InputPortDefinition,
  JsonValue,
  ParamDescriptor,
  ParamValueState,
  ParamValuesState,
} from "./public-sdk";
import {
  evaluateParamInteractivity,
  type ParamInteractivityDiagnostic,
  type ParamInteractivityState,
} from "./schema-form-interactivity";
import type { DatasetDerivationService } from "./runtime-services";
import {
  schemaFormPerformanceDiagnosticsKey,
  type SchemaFormPerformancePhaseRecorder,
} from "./schema-form-performance-diagnostics";

const props = defineProps<{
  params: ComponentParams;
  config: Record<string, unknown>;
  /** Bind state, optional. If absent, every param is treated as literal. */
  paramValues?: ParamValuesState;
  /** Available inputs (for the bind picker). Resolved after `resolveComponentPorts(...)`. */
  inputs?: readonly InputPortDefinition[];
  instanceId?: string;
  /**
   * Adapter context value, optional. Currently consumed by the
   * `kind: "chart-adapter"` control to derive rows path / field options.
   * Single-key controls (input, textarea, number, select, …) do not read
   * this prop, so it is safe to omit for non-chart panels.
   */
  data?: JsonValue;
  /** Optional host metadata service for async chart-adapter field suggestions. */
  datasetDerivationService?: DatasetDerivationService;
  /**
   * Optional resolved component theme context for the surrounding placement.
   * Forwarded to `kind: "theme-role"` controls so color-role swatches can
   * paint from the host theme bridge; other control kinds ignore it.
   */
  themeContext?: ComponentThemeContext;
}>();

const recordSchemaFormPerformancePhase = inject<SchemaFormPerformancePhaseRecorder>(
  schemaFormPerformanceDiagnosticsKey,
  (_phaseName, operation) => operation(),
);

const emit = defineEmits<{
  (e: "update:config", config: Record<string, unknown>): void;
  (e: "update:paramValues", values: ParamValuesState): void;
}>();

interface VisibleField {
  key: string;
  descriptor: ParamDescriptor;
}

// Render plan: ungrouped fields render flat in declaration order. Grouped
// fields are collected per-group at the position of the group's first
// occurrence; subsequent fields with the same group append into that block.
// This preserves authoring order while ensuring each group renders under one
// disclosure header rather than one header per appearance.
type RenderBlock =
  | { kind: "field"; field: VisibleField }
  | { kind: "group"; name: string; fields: VisibleField[] };

const inputsList = computed<readonly InputPortDefinition[]>(() => props.inputs ?? []);

// Per-field showWhen/disabledWhen evaluation against the live config snapshot.
// Helper fails open on throwing predicates; diagnostics are surfaced inline so
// authors can tell the difference between "intentionally hidden" and "broken".
const fieldEvaluations = computed<Map<string, ParamInteractivityState>>(() => {
  const result = new Map<string, ParamInteractivityState>();
  for (const [key, descriptor] of Object.entries(props.params)) {
    result.set(key, evaluateParamInteractivity(key, descriptor, props.config));
  }
  return result;
});

const interactivityDiagnostics = computed<ParamInteractivityDiagnostic[]>(() => {
  const diagnostics: ParamInteractivityDiagnostic[] = [];
  for (const state of fieldEvaluations.value.values()) {
    diagnostics.push(...state.diagnostics);
  }
  return diagnostics;
});

function fieldStateFor(key: string): ParamInteractivityState {
  return fieldEvaluations.value.get(key) ?? { hidden: false, disabled: false, diagnostics: [] };
}

const visibleFields = computed<VisibleField[]>(() => {
  let fieldCount = 0;

  return recordSchemaFormPerformancePhase(
    "schemaForm.fieldPlan",
    () => {
      const fields = Object.entries(props.params)
        .filter(([key]) => fieldEvaluations.value.get(key)?.hidden !== true)
        .map(([key, descriptor]) => ({ key, descriptor }));
      fieldCount = fields.length;
      return fields;
    },
    () => ({
      counts: {
        schemaFormFields: fieldCount,
        dataPathPickerInputs: inputsList.value.length,
      },
    }),
  );
});

const renderBlocks = computed<RenderBlock[]>(() => {
  let groupCount = 0;
  let blockCount = 0;

  return recordSchemaFormPerformancePhase(
    "schemaForm.renderPlan",
    () => {
      const blocks: RenderBlock[] = [];
      const groupBlocks = new Map<string, Extract<RenderBlock, { kind: "group" }>>();
      for (const field of visibleFields.value) {
        const groupName = field.descriptor.meta.group;
        if (!groupName) {
          blocks.push({ kind: "field", field });
          continue;
        }
        const existing = groupBlocks.get(groupName);
        if (existing) {
          existing.fields.push(field);
          continue;
        }
        const block: Extract<RenderBlock, { kind: "group" }> = {
          kind: "group",
          name: groupName,
          fields: [field],
        };
        groupBlocks.set(groupName, block);
        blocks.push(block);
      }
      groupCount = groupBlocks.size;
      blockCount = blocks.length;
      return blocks;
    },
    () => ({
      counts: {
        schemaFormBlocks: blockCount,
        schemaFormFields: visibleFields.value.length,
        schemaFormGroups: groupCount,
      },
    }),
  );
});

function blockKey(block: RenderBlock, index: number): string {
  return block.kind === "group" ? `group:${block.name}` : `field:${block.field.key}:${index}`;
}

function groupTestId(name: string): string {
  return `schema-form-group-${name}`;
}

function groupHeaderTestId(name: string): string {
  return `schema-form-group-${name}-header`;
}

function paramValueState(key: string): ParamValueState | undefined {
  return props.paramValues?.[key];
}

function isFieldDisabled(key: string): boolean {
  return fieldEvaluations.value.get(key)?.disabled === true;
}

function onFieldValueUpdate(key: string, value: unknown) {
  if (isFieldDisabled(key)) return;
  emit("update:config", { ...props.config, [key]: value });
}

function onFieldParamValueUpdate(key: string, state: ParamValueState) {
  if (isFieldDisabled(key)) return;
  const previous = props.paramValues ?? {};
  emit("update:paramValues", { ...previous, [key]: state });
}

// Multi-key patches (currently emitted by the chart-adapter control when a
// rows path change resuggests dependent field paths). Merge atomically so
// the parent observes one update with all dependent keys in sync. Guarded
// against disabled state on the chart-adapter field key so condition-driven
// disabling never lets a dependent suggest commit through.
function onFieldConfigPatch(chartAdapterKey: string, patch: Record<string, unknown>) {
  if (isFieldDisabled(chartAdapterKey)) return;
  emit("update:config", { ...props.config, ...patch });
}

function isChartAdapterField(field: VisibleField): boolean {
  return field.descriptor.meta.control.kind === "chart-adapter";
}

// Track per-group open state locally so a user-collapsed group survives
// re-renders triggered by config edits inside the same inspector mount.
// Missing keys default to open; entries are written only on user toggle.
const groupOpenState = reactive<Record<string, boolean>>({});

function isGroupOpen(name: string): boolean {
  return groupOpenState[name] ?? true;
}

function setGroupOpen(name: string, open: boolean): void {
  groupOpenState[name] = open;
}

// Form root landing zone (tabindex=-1). If a focused control disappears or
// goes disabled, focus is relocated to the next eligible field or this root
// so it never falls back to <body>.
const formRoot = ref<HTMLElement | null>(null);

function focusableElementsIn(root: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    'input:not([disabled]):not([type="hidden"])',
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(", ");
  return Array.from(root.querySelectorAll<HTMLElement>(selector));
}

function relocateFocus(root: HTMLElement, previousFieldKey: string) {
  const states = fieldEvaluations.value;
  const orderedKeys = Object.keys(props.params);
  const startIdx = orderedKeys.indexOf(previousFieldKey);
  const focusables = focusableElementsIn(root);

  const isEligible = (el: HTMLElement, key: string | null): boolean => {
    if (!key) return true;
    const state = states.get(key);
    return state?.hidden !== true && state?.disabled !== true;
  };

  // Prefer the first focusable belonging to a later (visible/enabled) field.
  if (startIdx >= 0) {
    for (let i = startIdx + 1; i < orderedKeys.length; i++) {
      const candidateKey = orderedKeys[i]!;
      const state = states.get(candidateKey);
      if (state?.hidden === true || state?.disabled === true) continue;
      const candidate = focusables.find((el) => {
        const container = el.closest<HTMLElement>("[data-field]");
        return container?.getAttribute("data-field") === candidateKey;
      });
      if (candidate) {
        candidate.focus();
        return;
      }
    }
  }

  // Then try any remaining eligible focusable in the form (e.g. earlier fields).
  const fallback = focusables.find((el) => {
    const container = el.closest<HTMLElement>("[data-field]");
    return isEligible(el, container?.getAttribute("data-field") ?? null);
  });
  if (fallback) {
    fallback.focus();
    return;
  }

  // Final fallback: park focus on the form root landing zone.
  root.focus();
}

// `flush: 'pre'` runs before the DOM update so the still-focused element is
// inspectable. The actual refocus is queued for after the update so the field
// is gone/disabled before we pick a new target.
watch(
  fieldEvaluations,
  (current, previous) => {
    if (typeof document === "undefined" || !previous) return;
    const root = formRoot.value;
    if (!root) return;
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;
    if (!root.contains(active)) return;
    const fieldContainer = active.closest<HTMLElement>("[data-field]");
    const fieldKey = fieldContainer?.getAttribute("data-field");
    if (!fieldKey) return;
    const prevState = previous.get(fieldKey);
    const nextState = current.get(fieldKey);
    const becameHidden = nextState?.hidden === true && prevState?.hidden !== true;
    const becameDisabled = nextState?.disabled === true && prevState?.disabled !== true;
    if (!becameHidden && !becameDisabled) return;
    void nextTick().then(() => {
      if (formRoot.value) relocateFocus(formRoot.value, fieldKey);
    });
  },
  { flush: "pre" },
);
</script>

<template>
  <div ref="formRoot" class="grid gap-4 outline-none" data-testid="schema-form" tabindex="-1">
    <ul
      v-if="interactivityDiagnostics.length > 0"
      class="grid gap-1 rounded-sm border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive"
      data-testid="schema-form-interactivity-diagnostics"
      role="status"
      aria-live="polite"
    >
      <li
        v-for="diag in interactivityDiagnostics"
        :key="`${diag.paramKey}:${diag.conditionKind}`"
        :data-testid="`schema-form-interactivity-diagnostic-${diag.paramKey}-${diag.conditionKind}`"
      >
        <span class="font-code">{{ diag.paramKey }}</span>
        ({{ diag.conditionKind }}): {{ diag.message }}
      </li>
    </ul>
    <p
      v-if="renderBlocks.length === 0"
      class="py-2 text-center text-sm text-muted-foreground"
      data-testid="schema-form-empty"
    >
      No configurable fields.
    </p>
    <template v-for="(block, blockIndex) in renderBlocks" :key="blockKey(block, blockIndex)">
      <template v-if="block.kind === 'field'">
        <SchemaFormChartAdapterField
          v-if="isChartAdapterField(block.field)"
          :field-key="block.field.key"
          :descriptor="block.field.descriptor"
          :config="props.config"
          :data="props.data"
          :dataset-derivation-service="props.datasetDerivationService"
          :disabled="fieldStateFor(block.field.key).disabled"
          :disabled-help-text="fieldStateFor(block.field.key).disabledHelpText"
          @update:config-patch="(patch) => onFieldConfigPatch(block.field.key, patch)"
        />
        <SchemaFormField
          v-else
          :field-key="block.field.key"
          :descriptor="block.field.descriptor"
          :value="props.config[block.field.key]"
          :config="props.config"
          :param-value-state="paramValueState(block.field.key)"
          :inputs="inputsList"
          :instance-id="props.instanceId"
          :theme-context="props.themeContext"
          :disabled="fieldStateFor(block.field.key).disabled"
          :disabled-help-text="fieldStateFor(block.field.key).disabledHelpText"
          @update:value="(value) => onFieldValueUpdate(block.field.key, value)"
          @update:param-value-state="(state) => onFieldParamValueUpdate(block.field.key, state)"
        />
      </template>
      <Collapsible
        v-else
        :open="isGroupOpen(block.name)"
        class="flex flex-col gap-3"
        :data-group="block.name"
        :data-testid="groupTestId(block.name)"
        @update:open="(open: boolean) => setGroupOpen(block.name, open)"
      >
        <CollapsibleTrigger
          class="flex w-full cursor-pointer select-none items-center gap-1.5 rounded-sm text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-1 focus-visible:ring-ring"
          :data-testid="groupHeaderTestId(block.name)"
        >
          <Icon
            aria-hidden="true"
            class="size-3.5 shrink-0 transition-transform"
            icon="lucide:chevron-right"
            :class="{ 'rotate-90': isGroupOpen(block.name) }"
          />
          <span>{{ block.name }}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="grid gap-4 pl-3">
            <template v-for="field in block.fields" :key="field.key">
              <SchemaFormChartAdapterField
                v-if="isChartAdapterField(field)"
                :field-key="field.key"
                :descriptor="field.descriptor"
                :config="props.config"
                :data="props.data"
                :dataset-derivation-service="props.datasetDerivationService"
                :disabled="fieldStateFor(field.key).disabled"
                :disabled-help-text="fieldStateFor(field.key).disabledHelpText"
                @update:config-patch="(patch) => onFieldConfigPatch(field.key, patch)"
              />
              <SchemaFormField
                v-else
                :field-key="field.key"
                :descriptor="field.descriptor"
                :value="props.config[field.key]"
                :config="props.config"
                :param-value-state="paramValueState(field.key)"
                :inputs="inputsList"
                :instance-id="props.instanceId"
                :theme-context="props.themeContext"
                :disabled="fieldStateFor(field.key).disabled"
                :disabled-help-text="fieldStateFor(field.key).disabledHelpText"
                @update:value="(value) => onFieldValueUpdate(field.key, value)"
                @update:param-value-state="(state) => onFieldParamValueUpdate(field.key, state)"
              />
            </template>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </template>
  </div>
</template>

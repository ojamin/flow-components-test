<script setup lang="ts">
// View-id selector populated from a sibling view-list config field.
//
// Renders a shadcn-vue Select whose options are derived from
// `config[viewsParamKey]` plus an explicit "Auto (first enabled view)" clear
// option. Stored value is `string | undefined`:
//   * a chosen view id → emit that id
//   * the auto/clear option → emit `undefined`
//   * an unknown stored id (legacy / orphaned) → trigger shows the raw id so
//     authors can see why playback falls back to the auto resolution, mirroring
//     the theme-role control's "unknown value stays verbatim" pattern.
//
// Disabled views remain selectable because the runtime falls back to the next
// enabled view at evaluation time; we just render a muted "(disabled)" hint
// next to the label so authors can tell which entries are currently off.
//
// Imports come from `./component-ui-primitives` (not the `./component-ui`
// barrel) so the SchemaForm facade can re-export through the barrel without
// introducing a self-cycle.

import { computed } from "vue";

import {
  Icon,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./component-ui-primitives";
import type { ParamDescriptor } from "./public-sdk";

const AUTO_SENTINEL = "__auto__" as const;
const DEFAULT_AUTO_LABEL = "Auto (first enabled view)";

interface ViewOption {
  id: string;
  label: string;
  disabled: boolean;
}

const props = withDefaults(
  defineProps<{
    fieldKey: string;
    descriptor: ParamDescriptor;
    value: unknown;
    /** Sibling config snapshot; the control reads `viewsParamKey` from here. */
    config?: Record<string, unknown>;
    /** Stable HTML id forwarded to the trigger so a parent `<Label :for>` works. */
    inputId?: string;
    /** When true the parent renders its own label. */
    hideLabel?: boolean;
    /**
     * Resolved disabled state from a sibling `disabledWhen` predicate on the
     * owning SchemaForm field. The trigger keeps the current label visible so
     * authors can still see which view is stored, but the Select root and
     * trigger go HTML-disabled and the select-change handler defensively
     * no-ops so a stray reka-ui `update:modelValue` cannot mutate config.
     */
    disabled?: boolean;
  }>(),
  { config: undefined, inputId: undefined, hideLabel: false, disabled: false },
);

const emit = defineEmits<{
  (e: "update:value", value: string | undefined): void;
}>();

interface ResolvedControl {
  viewsParamKey: string;
  autoLabel: string;
  invalidLabel: string;
  placeholder?: string;
  testId?: string;
}

const resolved = computed<ResolvedControl>(() => {
  const control = props.descriptor.meta.control;
  if (control.kind !== "view-select") {
    // Defensive: literal-control dispatch should only mount this for the
    // view-select kind. Falling back to an inert state keeps the control safe
    // rather than crashing if a future refactor mis-routes it.
    return { viewsParamKey: "", autoLabel: DEFAULT_AUTO_LABEL, invalidLabel: "View not found" };
  }
  return {
    viewsParamKey: control.viewsParamKey,
    autoLabel: control.autoLabel ?? DEFAULT_AUTO_LABEL,
    invalidLabel: control.invalidLabel ?? "View not found",
    ...(control.placeholder ? { placeholder: control.placeholder } : {}),
    ...(control.testId ? { testId: control.testId } : {}),
  };
});

// Defensively coerce sibling views so a partially-typed legacy config can't
// crash the inspector on first render. Mirrors the shape coercion that
// SchemaFormLiteralControl applies for the view-list kind.
const viewOptions = computed<readonly ViewOption[]>(() => {
  if (!resolved.value.viewsParamKey) return [];
  const raw = props.config?.[resolved.value.viewsParamKey];
  if (!Array.isArray(raw)) return [];
  const seenIds = new Set<string>();
  const options: ViewOption[] = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id.trim() : "";
    const label = typeof record.label === "string" ? record.label.trim() : "";
    if (!id || !label) continue;
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    options.push({
      id,
      label,
      disabled: record.disabled === true,
    });
  }
  return options;
});

const storedValue = computed<string>(() => {
  const value = props.value;
  return typeof value === "string" ? value.trim() : "";
});

const isAuto = computed(() => storedValue.value === "");

const matchedOption = computed<ViewOption | undefined>(() =>
  isAuto.value ? undefined : viewOptions.value.find((option) => option.id === storedValue.value),
);

const isUnknownValue = computed(() => !isAuto.value && matchedOption.value === undefined);

// Reka-ui's Select rejects empty-string item values, so the dropdown uses
// `__auto__` as the sentinel for the cleared state while the descriptor and
// parent always see `string | undefined`.
const selectModelValue = computed<string>(() => {
  if (isAuto.value) return AUTO_SENTINEL;
  return storedValue.value;
});

function onSelectChange(next: unknown): void {
  if (props.disabled === true) return;
  const raw = typeof next === "string" ? next : "";
  if (raw === AUTO_SENTINEL) {
    if (!isAuto.value) emit("update:value", undefined);
    return;
  }
  if (raw === "") return;
  if (raw !== storedValue.value) emit("update:value", raw);
}

const triggerLabel = computed(() => {
  if (isAuto.value) return resolved.value.autoLabel;
  if (matchedOption.value) return matchedOption.value.label;
  return storedValue.value;
});

const triggerStateAttr = computed(() => {
  if (isAuto.value) return "auto";
  if (isUnknownValue.value) return "unknown";
  return "view";
});

const validationHintTestId = computed(() => `${props.fieldKey}-view-select-validation-hint`);
const helpTextTestId = computed(() => `${props.fieldKey}-view-select-help-text`);

function optionTestId(viewId: string): string {
  return `${props.fieldKey}-view-select-option-${viewId}`;
}

const showHelpText = computed(
  () => Boolean(props.descriptor.meta.helpText) && !isUnknownValue.value,
);
</script>

<template>
  <div class="flex flex-col gap-1.5" :data-field="fieldKey">
    <Label
      v-if="!hideLabel"
      :for="inputId"
      class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      {{ descriptor.meta.label }}
    </Label>
    <Select
      :model-value="selectModelValue"
      :disabled="disabled"
      @update:model-value="(value: unknown) => onSelectChange(value)"
    >
      <SelectTrigger
        :id="inputId"
        class="h-8 w-full min-w-0 max-w-full text-sm"
        :aria-label="descriptor.meta.label"
        :aria-invalid="isUnknownValue || undefined"
        :data-testid="resolved.testId"
        :data-view-select-state="triggerStateAttr"
        :disabled="disabled"
      >
        <span class="flex min-w-0 items-center gap-2">
          <Icon
            v-if="isAuto"
            aria-hidden="true"
            class="size-3.5 shrink-0 text-muted-foreground"
            icon="lucide:circle-dashed"
          />
          <SelectValue :placeholder="resolved.placeholder">
            <span class="truncate" :class="{ 'italic text-muted-foreground': isAuto }">
              {{ triggerLabel }}
            </span>
          </SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem :value="AUTO_SENTINEL" :data-testid="`${fieldKey}-view-select-option-auto`">
            <span class="flex min-w-0 items-center gap-2">
              <Icon
                aria-hidden="true"
                class="size-3.5 shrink-0 text-muted-foreground"
                icon="lucide:circle-dashed"
              />
              <span class="italic text-muted-foreground">{{ resolved.autoLabel }}</span>
            </span>
          </SelectItem>
        </SelectGroup>
        <template v-if="viewOptions.length > 0">
          <SelectSeparator />
          <SelectGroup>
            <SelectItem
              v-for="option in viewOptions"
              :key="option.id"
              :value="option.id"
              :data-testid="optionTestId(option.id)"
              :data-view-select-disabled="option.disabled ? 'true' : 'false'"
            >
              <span class="flex min-w-0 items-center gap-2">
                <span class="truncate" :class="{ 'text-muted-foreground': option.disabled }">
                  {{ option.label }}
                </span>
                <span
                  v-if="option.disabled"
                  class="ml-auto shrink-0 text-xs uppercase tracking-wider text-muted-foreground/80"
                >
                  Disabled
                </span>
              </span>
            </SelectItem>
          </SelectGroup>
        </template>
      </SelectContent>
    </Select>
    <p
      v-if="isUnknownValue"
      class="text-xs text-destructive"
      role="alert"
      :data-testid="validationHintTestId"
    >
      {{ resolved.invalidLabel }} — select another option or choose Auto. Stored value:
      {{ storedValue }}.
    </p>
    <p
      v-else-if="showHelpText"
      class="text-xs text-muted-foreground/80"
      :data-testid="helpTextTestId"
    >
      {{ descriptor.meta.helpText }}
    </p>
  </div>
</template>

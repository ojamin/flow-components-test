<script setup lang="ts">
// Shared SchemaForm theme-role/property selector (Task 6.7).
//
// Outside the Theme component the only way to author themed paint is to pick
// a declared component-theme role: a `ThemePropertyKey` like `"color.accent"`
// or `""` for the inherited/default state. This control renders a shadcn
// Select grouped by property group, with humanised labels and an optional
// color swatch backed by static `bg-ct-*` Tailwind aliases.
//
// Contract:
//   * stored value is always a string (`ThemePropertyKey | ""`)
//   * unset / inherit is the empty string; the dropdown surfaces it through
//     a sentinel option so reka-ui's "no empty string values" rule still
//     holds while users can pick either a role or "inherit" by keyboard
//   * unknown saved values are not silently coerced — the trigger shows the
//     raw value and the parent receives `update:invalid`, matching the
//     number/code draft pattern in `SchemaFormLiteralControl.vue`
//   * raw color/font/etc. authoring is intentionally absent: callers that
//     genuinely need that surface live inside the Theme component
//
// Imports come from `./component-ui-primitives` (not the `./component-ui`
// barrel) so the SchemaForm facade can re-export through the barrel without
// introducing a self-cycle.

import { computed, watch } from "vue";

import {
  Icon,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./component-ui-primitives";
import {
  colorRoleSwatchClass,
  componentThemePropertyGroupLabels,
  deriveThemePropertyGroupsFromKeys,
  describeThemePropertyKey,
  listThemePropertyKeysForGroups,
} from "./theme-role-labels";
import type {
  ComponentThemeContext,
  ComponentThemePropertyGroup,
  ParamDescriptor,
  ThemePropertyKey,
} from "./public-sdk";

const INHERIT_SENTINEL = "__inherit__" as const;
const DEFAULT_GROUPS: readonly ComponentThemePropertyGroup[] = ["color"] as const;

const props = withDefaults(
  defineProps<{
    fieldKey: string;
    descriptor: ParamDescriptor;
    value: unknown;
    /**
     * Optional resolved theme context. When supplied, color-role options
     * render a swatch derived from the host theme bridge's `--ct-color-*`
     * scope; when omitted (e.g. preview-app harness without a theme scope),
     * options render label-only without a broken transparent swatch.
     */
    themeContext?: ComponentThemeContext;
    /** Stable HTML id forwarded to the trigger so a parent `<Label :for>` works. */
    inputId?: string;
    /** When true the parent renders its own label. */
    hideLabel?: boolean;
    /**
     * Resolved disabled state from a sibling `disabledWhen` predicate. Combines
     * with the descriptor's own `control.disabled` flag — either source flips
     * the trigger into a non-interactive state and the change handler defends
     * against stray emits so the stored role value cannot mutate.
     */
    disabled?: boolean;
  }>(),
  { themeContext: undefined, inputId: undefined, hideLabel: false, disabled: false },
);

const emit = defineEmits<{
  (e: "update:value", value: string): void;
  (e: "update:invalid", invalid: boolean): void;
}>();

interface ResolvedControl {
  groups: readonly ComponentThemePropertyGroup[];
  allowedKeys: readonly ThemePropertyKey[];
  allowUnset: boolean;
  unsetLabel: string;
  disabled: boolean;
  testId?: string;
}

const resolved = computed<ResolvedControl>(() => {
  const control = props.descriptor.meta.control;
  if (control.kind !== "theme-role") {
    // Defensive: literal-control dispatch should only mount this for the
    // theme-role kind. Falling back to defaults keeps the control inert
    // rather than crashing if a future refactor mis-routes it.
    return {
      groups: DEFAULT_GROUPS,
      allowedKeys: listThemePropertyKeysForGroups(DEFAULT_GROUPS),
      allowUnset: true,
      unsetLabel: "Inherit from theme",
      disabled: false,
    };
  }
  // Per `component-definition.ts`: when `allowedKeys` is provided the dropdown
  // only offers those keys and ignores `groups`. The visible group set is
  // therefore inferred from the allowlist (first-appearance order) so an
  // author can write `allowedKeys: ["font.body"]` and see the Font option
  // without also having to set `groups: ["font"]`.
  //
  // An explicitly empty `allowedKeys: []` is a valid "no roles" allowlist —
  // it must NOT silently fall back to the default color groups. Distinguish
  // "provided but empty" from "omitted/undefined" by presence, not length.
  const explicitGroups =
    control.groups && control.groups.length > 0 ? control.groups : DEFAULT_GROUPS;
  const hasAllowedKeys = control.allowedKeys !== undefined;
  const allowedKeys = hasAllowedKeys
    ? [...control.allowedKeys!]
    : listThemePropertyKeysForGroups(explicitGroups);
  const groups = hasAllowedKeys ? deriveThemePropertyGroupsFromKeys(allowedKeys) : explicitGroups;
  return {
    groups,
    allowedKeys,
    allowUnset: control.allowUnset !== false,
    unsetLabel: control.unsetLabel ?? "Inherit from theme",
    disabled: control.disabled === true,
    ...(control.testId ? { testId: control.testId } : {}),
  };
});

// Combine field-level `disabledWhen` (passed via `props.disabled`) with the
// descriptor-level `control.disabled` flag so either source can switch the
// trigger off. Used for both the Select `disabled` binding and the emit guard.
const isDisabled = computed(() => props.disabled || resolved.value.disabled);

const storedValue = computed<string>(() => (typeof props.value === "string" ? props.value : ""));

const isUnset = computed(() => storedValue.value === "");

const isUnknownValue = computed(
  () =>
    !isUnset.value && !resolved.value.allowedKeys.includes(storedValue.value as ThemePropertyKey),
);

// Invalid combinations:
//   * a stored role that is not in the allowed set (legacy / orphaned config)
//   * an empty value while `allowUnset === false`
const isInvalid = computed(() => {
  if (isUnknownValue.value) return true;
  if (isUnset.value && !resolved.value.allowUnset) return true;
  return false;
});

// Mirror invalid state to the parent so help text can be suppressed in
// favour of the inline alert (matches number/code field behaviour).
watch(
  isInvalid,
  (next) => {
    emit("update:invalid", next);
  },
  { immediate: true },
);

interface OptionGroup {
  group: ComponentThemePropertyGroup;
  label: string;
  options: readonly OptionEntry[];
}

interface OptionEntry {
  key: ThemePropertyKey;
  label: string;
  swatchClass?: string;
}

const optionGroups = computed<OptionGroup[]>(() =>
  resolved.value.groups
    .map((group) => {
      const options = resolved.value.allowedKeys
        .filter((key) => key.startsWith(`${group}.`))
        .map((key) => {
          const { roleLabel } = describeThemePropertyKey(key);
          const swatchClass = props.themeContext ? colorRoleSwatchClass(key) : undefined;
          const entry: OptionEntry = { key, label: roleLabel };
          if (swatchClass) entry.swatchClass = swatchClass;
          return entry;
        });
      return {
        group,
        label: componentThemePropertyGroupLabels[group],
        options,
      };
    })
    .filter((entry) => entry.options.length > 0),
);

// Internal sentinel ↔ stored-value plumbing. Reka-ui's Select rejects empty
// strings as item values, so the dropdown uses `__inherit__` for the unset
// option while the descriptor and parent always see `""`.
const selectModelValue = computed<string>(() => {
  if (isUnset.value) return INHERIT_SENTINEL;
  // Unknown values stay verbatim so the trigger shows what is stored —
  // makes legacy data observable to the user instead of silently rewritten.
  return storedValue.value;
});

function onSelectChange(next: unknown): void {
  if (isDisabled.value) return;
  const raw = typeof next === "string" ? next : "";
  if (raw === INHERIT_SENTINEL) {
    if (storedValue.value !== "") emit("update:value", "");
    return;
  }
  if (raw === "") return;
  if (raw !== storedValue.value) emit("update:value", raw);
}

const triggerLabel = computed(() => {
  if (isUnset.value) return resolved.value.unsetLabel;
  if (isUnknownValue.value) return storedValue.value;
  const { roleLabel } = describeThemePropertyKey(storedValue.value as ThemePropertyKey);
  return roleLabel;
});

const triggerSwatchClass = computed(() => {
  if (isUnset.value || isUnknownValue.value) return undefined;
  if (!props.themeContext) return undefined;
  return colorRoleSwatchClass(storedValue.value as ThemePropertyKey);
});

const triggerTestId = computed(() => resolved.value.testId);

const validationHintTestId = computed(() => `${props.fieldKey}-theme-role-validation-hint`);
const helpTextTestId = computed(() => `${props.fieldKey}-theme-role-help-text`);
const triggerStateAttr = computed(() => {
  if (isUnset.value) return "inherit";
  if (isUnknownValue.value) return "unknown";
  return "role";
});

// Help text explains the abstract-role contract (e.g. "the active theme
// controls the actual color"). It is suppressed while an inline alert is
// showing so the validation message remains the primary signal, matching
// the literal-control help/alert ordering in `SchemaFormField.vue`.
const showHelpText = computed(() => Boolean(props.descriptor.meta.helpText) && !isInvalid.value);
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
      :disabled="isDisabled"
      @update:model-value="(value: unknown) => onSelectChange(value)"
    >
      <SelectTrigger
        :id="inputId"
        class="h-8 w-full min-w-0 max-w-full text-sm"
        :aria-label="descriptor.meta.label"
        :aria-invalid="isInvalid || undefined"
        :data-testid="triggerTestId"
        :data-theme-role-state="triggerStateAttr"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span
            v-if="triggerSwatchClass"
            aria-hidden="true"
            class="size-3.5 shrink-0 rounded-sm border border-border/60"
            :class="triggerSwatchClass"
          />
          <Icon
            v-else-if="isUnset"
            aria-hidden="true"
            class="size-3.5 shrink-0 text-muted-foreground"
            icon="lucide:circle-dashed"
          />
          <SelectValue>
            <span class="truncate" :class="{ 'italic text-muted-foreground': isUnset }">
              {{ triggerLabel }}
            </span>
          </SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent>
        <template v-if="resolved.allowUnset">
          <SelectGroup>
            <SelectItem
              :value="INHERIT_SENTINEL"
              :data-testid="`${fieldKey}-theme-role-option-inherit`"
            >
              <span class="flex min-w-0 items-center gap-2">
                <Icon
                  aria-hidden="true"
                  class="size-3.5 shrink-0 text-muted-foreground"
                  icon="lucide:circle-dashed"
                />
                <span class="italic text-muted-foreground">{{ resolved.unsetLabel }}</span>
              </span>
            </SelectItem>
          </SelectGroup>
          <SelectSeparator v-if="optionGroups.length > 0" />
        </template>
        <SelectGroup
          v-for="group in optionGroups"
          :key="group.group"
          :data-testid="`${fieldKey}-theme-role-group-${group.group}`"
        >
          <SelectLabel v-if="optionGroups.length > 1">{{ group.label }}</SelectLabel>
          <SelectItem
            v-for="option in group.options"
            :key="option.key"
            :value="option.key"
            :data-testid="`${fieldKey}-theme-role-option-${option.key}`"
          >
            <span class="flex min-w-0 items-center gap-2">
              <span
                v-if="option.swatchClass"
                aria-hidden="true"
                class="size-3.5 shrink-0 rounded-sm border border-border/60"
                :class="option.swatchClass"
              />
              <span class="truncate">{{ option.label }}</span>
            </span>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <p
      v-if="isUnknownValue"
      class="text-xs text-destructive"
      role="alert"
      :data-testid="validationHintTestId"
    >
      {{ "Unknown theme role: " + storedValue }}
    </p>
    <p
      v-else-if="isUnset && !resolved.allowUnset"
      class="text-xs text-destructive"
      role="alert"
      :data-testid="validationHintTestId"
    >
      Pick a theme role to apply.
    </p>
    <p
      v-else-if="showHelpText"
      class="text-xs leading-relaxed text-muted-foreground/80"
      :data-testid="helpTextTestId"
    >
      {{ descriptor.meta.helpText }}
    </p>
  </div>
</template>

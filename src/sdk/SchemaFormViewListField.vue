<script setup lang="ts">
// View-list control implementation for SchemaForm (Task 62.6).
//
// Renders the inspector authoring UI for a `ViewContainerItem[]` config field
// owned by view-container components (`layout.view-stack`, future Tabs/etc.).
// Edits flow through the shared pure helpers in
// `../shared/view-container` so add/rename/reorder/hashSlug/disabled/delete
// semantics stay aligned with runtime normalization and slot generation.
//
// Layout patterns mirror `SchemaFormHeadersField.vue` (per-row container,
// outline add button, validation surface) so the inspector reads as one
// cohesive SchemaForm idiom rather than a one-off custom panel.
//
// Host responsibilities (NOT owned here):
//   - Blocking deletion of populated views with a Sonner toast.
//   - Undo/redo history wiring through the project store.
// The control always emits the reduced list on delete; the host applies the
// guard before committing.

import { computed, reactive } from "vue";

import { Badge, Button, Icon, Input, Label, Switch } from "./component-ui-primitives";
import {
  createViewContainerItem,
  deleteViewContainerItem,
  renameViewContainerItem,
  reorderViewContainerItems,
  setViewContainerItemDisabled,
  setViewContainerItemHashSlug,
  type ViewContainerItem,
} from "../shared/view-container";

const props = withDefaults(
  defineProps<{
    fieldKey: string;
    label: string;
    helpText?: string;
    modelValue: readonly ViewContainerItem[];
    addLabel?: string;
    hashSlugPlaceholder?: string;
    testId?: string;
    /**
     * When true, the field-level label/badge header row is hidden. Mirrors
     * SchemaFormHeadersField so a bindable wrapper (future) can provide the
     * outer label without duplication.
     */
    hideLabel?: boolean;
    /**
     * Resolved disabled state from a sibling `disabledWhen` predicate. Persisted
     * views stay visible/readable but every row input, toggle, reorder/delete/
     * add button is non-interactive, and every commit helper no-ops so a
     * stray child event cannot mutate config. Per-view `item.disabled` flags
     * (whether a specific view is itself disabled) are not affected.
     */
    disabled?: boolean;
  }>(),
  {
    addLabel: "Add view",
    hashSlugPlaceholder: "url-slug",
    hideLabel: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: ViewContainerItem[]): void;
}>();

// Per-row expand state is intentionally local: it is pure UI affordance and
// must not bleed into persisted config or undo history.
const expandedRowIds = reactive<Record<string, boolean>>({});

const items = computed<readonly ViewContainerItem[]>(() => props.modelValue ?? []);

function isExpanded(id: string): boolean {
  return Boolean(expandedRowIds[id]);
}

function toggleExpanded(id: string): void {
  if (props.disabled) return;
  expandedRowIds[id] = !expandedRowIds[id];
}

function emitItems(next: readonly ViewContainerItem[]): void {
  if (props.disabled) return;
  // Helpers return reference-equal arrays for no-op edits; skip the emit so
  // we don't generate spurious undo/history churn upstream.
  if (next === items.value) return;
  emit("update:modelValue", [...next]);
}

function addView(): void {
  if (props.disabled) return;
  // PRD requires stable IDs that are NOT label/index-derived; the helper
  // delegates to createUuid() so this stays trustworthy across import/export.
  const created = createViewContainerItem({ label: `View ${items.value.length + 1}` });
  emit("update:modelValue", [...items.value, created]);
}

function moveUp(id: string): void {
  if (props.disabled) return;
  const currentIndex = items.value.findIndex((item) => item.id === id);
  if (currentIndex <= 0) return;
  emitItems(reorderViewContainerItems(items.value, id, currentIndex - 1));
}

function moveDown(id: string): void {
  if (props.disabled) return;
  const currentIndex = items.value.findIndex((item) => item.id === id);
  if (currentIndex < 0 || currentIndex >= items.value.length - 1) return;
  emitItems(reorderViewContainerItems(items.value, id, currentIndex + 1));
}

function renameView(id: string, label: string): void {
  if (props.disabled) return;
  emitItems(renameViewContainerItem(items.value, id, label));
}

function setHashSlug(id: string, value: string): void {
  if (props.disabled) return;
  emitItems(setViewContainerItemHashSlug(items.value, id, value));
}

function setDisabled(id: string, disabled: boolean): void {
  if (props.disabled) return;
  emitItems(setViewContainerItemDisabled(items.value, id, disabled));
}

function deleteView(id: string): void {
  if (props.disabled) return;
  // The control always emits the reduced list. The host inspector layer
  // applies the populated-view deletion guard + toast before committing.
  emitItems(deleteViewContainerItem(items.value, id));
}

function rootTestId(): string | undefined {
  return props.testId ?? `${props.fieldKey}-view-list`;
}

function rowTestId(id: string, suffix: string): string {
  return `${props.fieldKey}-view-list-row-${id}-${suffix}`;
}

function emptyTestId(): string {
  return `${props.fieldKey}-view-list-empty`;
}

function addTestId(): string {
  return `${props.fieldKey}-view-list-add`;
}
</script>

<template>
  <fieldset class="flex flex-col gap-2" :data-field="fieldKey" :data-testid="rootTestId()">
    <div v-if="!hideLabel" class="flex items-center justify-between gap-2">
      <Label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{
        label
      }}</Label>
      <Badge variant="outline" class="text-[10px]">
        {{ items.length }} {{ items.length === 1 ? "view" : "views" }}
      </Badge>
    </div>

    <p v-if="helpText" class="text-xs text-muted-foreground/70">{{ helpText }}</p>

    <p
      v-if="items.length === 0"
      class="rounded-md border border-dashed border-border/60 px-3 py-3 text-center text-xs text-muted-foreground/70"
      :data-testid="emptyTestId()"
    >
      No views. Add one.
    </p>

    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="flex flex-col gap-2 rounded-md border border-border/40 bg-muted/20 p-2"
      :class="{ 'opacity-60': item.disabled }"
      :data-testid="rowTestId(item.id, 'row')"
      :data-row-id="item.id"
      :data-row-disabled="item.disabled ? 'true' : 'false'"
    >
      <div class="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon-xs"
          type="button"
          :disabled="disabled || index === 0"
          :aria-label="`Move ${item.label} up`"
          :data-testid="rowTestId(item.id, 'move-up')"
          @click="moveUp(item.id)"
        >
          <Icon icon="lucide:chevron-up" class="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          type="button"
          :disabled="disabled || index === items.length - 1"
          :aria-label="`Move ${item.label} down`"
          :data-testid="rowTestId(item.id, 'move-down')"
          @click="moveDown(item.id)"
        >
          <Icon icon="lucide:chevron-down" class="size-3" />
        </Button>
        <Input
          :model-value="item.label"
          :aria-label="`View label for ${item.label}`"
          class="h-8 flex-1 text-xs"
          :data-testid="rowTestId(item.id, 'label')"
          :disabled="disabled"
          @update:model-value="(value: string | number) => renameView(item.id, String(value))"
        />
        <Button
          variant="ghost"
          size="icon-xs"
          type="button"
          :aria-label="`${isExpanded(item.id) ? 'Close' : 'Edit'} ${item.label} details`"
          :aria-expanded="isExpanded(item.id)"
          :data-testid="rowTestId(item.id, 'toggle-details')"
          :disabled="disabled"
          @click="toggleExpanded(item.id)"
        >
          <Icon
            :icon="isExpanded(item.id) ? 'lucide:chevron-up' : 'lucide:settings-2'"
            class="size-3"
          />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          type="button"
          :aria-label="`Delete view ${item.label}`"
          :data-testid="rowTestId(item.id, 'delete')"
          :disabled="disabled"
          @click="deleteView(item.id)"
        >
          <Icon icon="lucide:trash-2" class="size-3" />
        </Button>
      </div>

      <div
        v-if="isExpanded(item.id)"
        class="flex flex-col gap-2 border-t border-border/40 pt-2"
        :data-testid="rowTestId(item.id, 'details')"
      >
        <div class="flex flex-col gap-1">
          <Label
            class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            :for="`${fieldKey}-view-list-${item.id}-hash`"
          >
            Hash slug
          </Label>
          <Input
            :id="`${fieldKey}-view-list-${item.id}-hash`"
            :model-value="item.hashSlug ?? ''"
            :placeholder="hashSlugPlaceholder"
            :aria-label="`Hash slug for ${item.label}`"
            class="h-8 font-code text-xs"
            :data-testid="rowTestId(item.id, 'hash-slug')"
            :disabled="disabled"
            @update:model-value="(value: string | number) => setHashSlug(item.id, String(value))"
          />
        </div>
        <div class="flex items-center justify-between gap-2">
          <Label
            class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            :for="`${fieldKey}-view-list-${item.id}-disabled`"
          >
            Disabled
          </Label>
          <Switch
            :id="`${fieldKey}-view-list-${item.id}-disabled`"
            :model-value="Boolean(item.disabled)"
            :aria-label="`Disable view ${item.label}`"
            :data-testid="rowTestId(item.id, 'disabled')"
            :disabled="disabled"
            @update:model-value="(value: boolean) => setDisabled(item.id, value)"
          />
        </div>
      </div>
    </div>

    <Button
      variant="outline"
      size="sm"
      type="button"
      class="w-full"
      :data-testid="addTestId()"
      :disabled="disabled"
      @click="addView"
    >
      <Icon icon="lucide:plus" class="size-3.5" data-icon="inline-start" />
      {{ addLabel }}
    </Button>
  </fieldset>
</template>

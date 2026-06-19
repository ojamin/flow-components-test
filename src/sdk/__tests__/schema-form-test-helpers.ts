import { mount } from "@vue/test-utils";

import SchemaForm from "../SchemaForm.vue";
import type { ComponentParams, InputPortDefinition, ParamHeaderRow } from "../public-sdk";

export function mountForm(params: ComponentParams, config: Record<string, unknown>) {
  return mount(SchemaForm, {
    props: { params, config },
  });
}

export function inputPort(
  id: string,
  acceptedTypeIds: string[],
  overrides: Partial<InputPortDefinition> = {},
): InputPortDefinition {
  return {
    id,
    label: id,
    mode: "full",
    acceptedTypeIds,
    required: false,
    allowMultiple: false,
    allowCycle: false,
    ...overrides,
  };
}

export function headerRow(overrides: Partial<ParamHeaderRow> & { id: string }): ParamHeaderRow {
  return {
    key: "",
    value: "",
    enabled: true,
    ...overrides,
  };
}

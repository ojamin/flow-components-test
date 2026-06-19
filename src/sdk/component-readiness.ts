export const COMPONENT_READINESS_EVENT = "flow-builder:component-readiness";

export type ComponentReadinessSignal = "pending" | "ready" | "settled" | "resize-settled";

export interface ComponentReadinessEventDetail {
  readonly signal: ComponentReadinessSignal;
  readonly placementId?: string;
  readonly componentId?: string;
  readonly surface?: string;
}

export function dispatchComponentReadinessEvent(
  target: Element,
  detail: ComponentReadinessEventDetail,
): void {
  target.dispatchEvent(new CustomEvent(COMPONENT_READINESS_EVENT, { bubbles: true, detail }));
}

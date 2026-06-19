// Module intent: package-local managed style bridge for the renderer preview
// frame. Mirrors the host scoped-style contract documented in
// `packages/components/docs/component-theme-contract.md` (`data-ct-scope` plus
// a `<style data-component-theme-style-bridge="<scopeId>">` block in the
// owning document head) using the canonical SDK constants — never a parallel
// or ad hoc `--ct-*` mapping. The package preview-app cannot import the host
// bridge implementation, but it must produce the same scoped-bridge shape so
// renderers consume `--ct-*` slots from descendant Tailwind utilities without
// inline style mutations on the renderer-loaded wrapper.

import {
  componentThemeCssVariableByPropertyKey,
  componentThemePropertyKeys,
  componentThemeScopeAttribute,
  themeRoleKeyToCssVariableSuffix,
} from "@flow-builder/components/sdk";

const bridgeState = new WeakMap<HTMLElement, PreviewThemeStyleBridgeHandle>();

export type PreviewThemeStyleBridgeInput = {
  readonly scopeId: string;
  readonly cssVariables: Readonly<Record<string, string>>;
};

type PreviewThemeStyleBridgeHandle = {
  styleElement: HTMLStyleElement;
  scopeId: string;
};

function escapeAttributeValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n|\r|\f/g, "");
}

function normalizeCssVariableValue(value: string): string {
  return value.replace(/[;{}]/g, "").replace(/\s+/g, " ").trim();
}

function createScopedStyleText(
  scopeId: string,
  cssVariables: Readonly<Record<string, string>>,
): string {
  const selector = `[${componentThemeScopeAttribute}="${escapeAttributeValue(scopeId)}"]`;
  const rawDeclarations = componentThemePropertyKeys.map((propertyKey) => {
    const variableName = componentThemeCssVariableByPropertyKey[propertyKey];
    return `  ${variableName}: ${normalizeCssVariableValue(cssVariables[variableName] ?? "")};`;
  });
  const aliasDeclarations = componentThemePropertyKeys.flatMap((propertyKey) => {
    if (!propertyKey.startsWith("color.")) return [];

    const [, role] = propertyKey.split(".") as ["color", string];
    const variableName = `--color-ct-${themeRoleKeyToCssVariableSuffix(role)}`;
    if (!Object.prototype.hasOwnProperty.call(cssVariables, variableName)) return [];
    return [`  ${variableName}: ${normalizeCssVariableValue(cssVariables[variableName] ?? "")};`];
  });
  const declarations = [...rawDeclarations, ...aliasDeclarations];
  return `${selector} {\n${declarations.join("\n")}\n}`;
}

/**
 * Apply (or refresh) the scoped style bridge on `host`. Owns:
 *   - the `data-ct-scope` attribute on the host element
 *   - a single `<style data-component-theme-style-bridge="<scopeId>">` element
 *     appended to the host's owning document head
 * Replaces any prior bridge on the same host before installing the new one.
 */
export function applyPreviewThemeStyleBridge(
  host: HTMLElement,
  input: PreviewThemeStyleBridgeInput,
): void {
  bridgeState.get(host)?.styleElement.remove();

  const scopeId = input.scopeId.trim();
  if (scopeId.length === 0) {
    throw new Error("Preview theme style bridge requires a non-empty scope id.");
  }

  const ownerDocument = host.ownerDocument;
  const styleElement = ownerDocument.createElement("style");
  styleElement.dataset.componentThemeStyleBridge = scopeId;
  styleElement.textContent = createScopedStyleText(scopeId, input.cssVariables);
  ownerDocument.head.append(styleElement);

  host.setAttribute(componentThemeScopeAttribute, scopeId);
  bridgeState.set(host, { styleElement, scopeId });
}

/**
 * Remove the managed style block and `data-ct-scope` attribute installed by
 * `applyPreviewThemeStyleBridge` on `host`. Safe to call when no bridge is
 * currently installed.
 */
export function cleanupPreviewThemeStyleBridge(host: HTMLElement): void {
  const handle = bridgeState.get(host);
  if (!handle) return;

  handle.styleElement.remove();
  if (host.getAttribute(componentThemeScopeAttribute) === handle.scopeId) {
    host.removeAttribute(componentThemeScopeAttribute);
  }
  bridgeState.delete(host);
}

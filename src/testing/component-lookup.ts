/// <reference types="vite/client" />

import { staticComponentSourceManifest } from "../generated/source-manifest";
import type { ComponentDefinition } from "../sdk/public-sdk";

const componentModules = import.meta.glob<{ componentDefinition: ComponentDefinition }>(
  "../groups/**/component.ts",
);

// Test-only lookup for Vite/Vitest environments. Runtime consumers should use
// the synchronous catalog helpers exported from @flow-builder/components/catalog.

function resolveComponentModulePath(componentId: string) {
  const manifestEntry = staticComponentSourceManifest.components.find(
    (component) => component.id === componentId,
  );
  if (!manifestEntry) return undefined;

  return manifestEntry.sourcePath.replace("packages/components/src/", "../") + "/component.ts";
}

export async function loadBuiltInComponentDefinition(componentId: string) {
  const modulePath = resolveComponentModulePath(componentId);
  const loadModule = modulePath ? componentModules[modulePath] : undefined;
  if (!loadModule) return undefined;

  const module = await loadModule();
  return module.componentDefinition;
}

export async function loadRequiredBuiltInComponentDefinition(componentId: string) {
  const definition = await loadBuiltInComponentDefinition(componentId);
  if (!definition) {
    throw new Error(`Unknown built-in component definition "${componentId}".`);
  }
  return definition;
}

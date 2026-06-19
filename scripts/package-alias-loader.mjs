import { pathToFileURL } from "node:url";

const aliasTargets = new Map([
  ["@flow-builder/components", "src/index.ts"],
  ["@flow-builder/components/catalog", "src/generated/catalog.ts"],
  ["@flow-builder/components/source-manifest", "src/generated/source-manifest.ts"],
  ["@flow-builder/components/source-files", "src/generated/source-files.ts"],
  ["@flow-builder/components/manifest", "src/manifest.ts"],
  ["@flow-builder/components/sdk", "src/sdk/public-sdk.ts"],
  ["@flow-builder/components/sdk/browser", "src/sdk/helpers/browser/index.ts"],
  ["@flow-builder/components/sdk/rendering", "src/sdk/helpers/rendering/index.ts"],
  ["@flow-builder/components/sdk/capabilities", "src/sdk/helpers/capabilities/index.ts"],
  ["@flow-builder/components/sdk/three-d", "src/sdk/helpers/three-d/index.ts"],
  ["@flow-builder/components/sdk/interactions", "src/sdk/helpers/interactions/index.ts"],
  ["@flow-builder/components/sdk/data", "src/sdk/helpers/data/index.ts"],
  ["@flow-builder/components/sdk/config", "src/sdk/helpers/config/index.ts"],
  ["@flow-builder/components/sdk/theme", "src/sdk/theme.ts"],
  ["@flow-builder/components/sdk/sanitization", "src/sdk/helpers/sanitization/index.ts"],
  ["@flow-builder/components/sdk/markdown", "src/sdk/helpers/markdown/index.ts"],
  ["@flow-builder/components/component-ui", "src/sdk/component-ui.ts"],
  ["@flow-builder/components/testing", "src/testing/index.ts"],
  ["@flow-builder/components/runtime-services", "src/sdk/runtime-services/index.ts"],
  ["@flow-builder/components/shared/view-container", "src/shared/view-container/index.ts"],
  ["@flow-builder/components/shared/nav", "src/shared/nav/index.ts"],
]);

export async function resolve(specifier, context, nextResolve) {
  const target = aliasTargets.get(specifier);
  if (target) {
    return {
      url: pathToFileURL(new URL(`../${target}`, import.meta.url).pathname).href,
      shortCircuit: true,
    };
  }

  return nextResolve(specifier, context);
}

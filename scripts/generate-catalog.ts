import { pathToFileURL } from "node:url";

import {
  ComponentCatalogGenerationError,
  discoverComponentManifests,
  discoverPackageComponentFolders,
  type ComponentFolder,
  type DiscoverComponentOptions,
  type DiscoveredComponentManifest,
} from "./catalog-discovery.ts";
import {
  generateComponentLibraryOutputs,
  type GeneratedComponentLibraryOutputs,
} from "./catalog-generator.ts";
import {
  collectGeneratedOutputIssues,
  writeGeneratedComponentLibraryOutputs,
} from "./catalog-output-writer.ts";

export {
  ComponentCatalogGenerationError,
  collectGeneratedOutputIssues,
  discoverComponentManifests,
  discoverPackageComponentFolders,
  writeGeneratedComponentLibraryOutputs,
  generateComponentLibraryOutputs,
  type ComponentFolder,
  type DiscoverComponentOptions,
  type DiscoveredComponentManifest,
  type GeneratedComponentLibraryOutputs,
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  (async () => {
    if (process.argv.includes("--write")) {
      await writeGeneratedComponentLibraryOutputs();
      console.log("Generated component catalog, source manifest, and source files.");
    } else {
      const discovered = discoverComponentManifests();
      console.log(`Discovered ${discovered.length} package components.`);
    }
  })().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

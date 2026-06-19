import { readFileSync } from "node:fs";
import path from "node:path";

import {
  discoverComponentManifests,
  resolvePackageRoot,
  type DiscoverComponentOptions,
} from "./catalog-discovery.ts";
import { renderCatalogSource } from "./catalog-render-definitions.ts";
import { renderSourceFilesSource } from "./catalog-render-source-files.ts";
import {
  createSourceManifest,
  renderSourceManifestJson,
  renderSourceManifestSource,
} from "./catalog-render-source-manifest.ts";
import { hashFiles, listComponentFiles } from "./catalog-source-snapshot.ts";

export type GeneratedComponentLibraryOutputs = {
  catalogSource: string;
  sourceManifestJson: string;
  sourceManifestSource: string;
  sourceFilesSource: string;
  componentHashes: ReadonlyMap<string, string>;
  manifestHash: string;
  filesHash: string;
};

export function generateComponentLibraryOutputs(
  options: DiscoverComponentOptions = {},
): GeneratedComponentLibraryOutputs {
  const packageRoot = resolvePackageRoot(options);
  const packageMetadata = readPackageMetadata(packageRoot);
  const discovered = discoverComponentManifests({ packageRoot });
  const componentHashes = new Map(
    discovered.map((component) => [
      component.manifest.id,
      hashFiles(listComponentFiles(component), packageRoot),
    ]),
  );
  const manifestHash = hashFiles(
    discovered.map((component) => path.join(component.absolutePath, "component.manifest.json")),
    packageRoot,
  );
  const filesHash = hashFiles(
    discovered.flatMap((component) => listComponentFiles(component)),
    packageRoot,
  );
  const sourceManifest = createSourceManifest({
    discovered,
    componentHashes,
    manifestHash,
    filesHash,
    packageVersion: packageMetadata.version,
  });

  return {
    catalogSource: renderCatalogSource(discovered),
    sourceManifestJson: renderSourceManifestJson(sourceManifest),
    sourceManifestSource: renderSourceManifestSource(sourceManifest),
    sourceFilesSource: renderSourceFilesSource({ discovered, packageRoot }),
    componentHashes,
    manifestHash,
    filesHash,
  };
}

function readPackageMetadata(packageRoot: string) {
  return JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8")) as {
    version: string;
  };
}

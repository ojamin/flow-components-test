#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(resolve(packageDir, "package.json"), "utf8"));
const requireFromPackage = createRequire(resolve(packageDir, "package.json"));
const viteBin = resolve(dirname(requireFromPackage.resolve("vite")), "../../bin/vite.js");
const tailwindVitePluginUrl = pathToFileURL(requireFromPackage.resolve("@tailwindcss/vite")).href;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    stdio: options.stdio ?? "inherit",
    encoding: options.encoding,
    shell: process.platform === "win32",
    env: {
      ...process.env,
      npm_config_fund: "false",
      npm_config_audit: "false",
      npm_config_ignore_scripts: "true",
      ...options.env,
    },
  });
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(" ")} failed with status ${result.status ?? 1}`);
  return result;
}

function findTarball(packJson, destinationDir) {
  const start = packJson.indexOf("[");
  const end = packJson.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start)
    throw new Error(`npm pack did not produce JSON output: ${packJson}`);
  const parsed = JSON.parse(packJson.slice(start, end + 1))[0];
  return resolve(destinationDir, parsed.filename);
}

function walkFiles(root) {
  const files = [];
  function visit(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) visit(path);
      if (entry.isFile()) files.push(path);
    }
  }
  visit(root);
  return files;
}

function assertConsumerCss(consumerDir) {
  const distDir = join(consumerDir, "dist");
  const cssFiles = walkFiles(distDir).filter((file) => file.endsWith(".css"));
  const cssSource = cssFiles.map((file) => readFileSync(file, "utf8")).join("\n");

  const probes = {
    themeSlot: cssSource.includes("var(--ct-color-surface)"),
    maplibre: cssSource.includes(".maplibregl-map"),
    themeUtility: cssSource.includes(".bg-ct-surface"),
  };
  if (!probes.themeSlot || !probes.maplibre || !probes.themeUtility) {
    throw new Error(
      `Packed consumer build did not retain component runtime CSS content: ${JSON.stringify(probes)}`,
    );
  }
}

const tempRoot = await mkdtemp(join(tmpdir(), "flow-builder-components-packed-smoke-"));

try {
  const pack = run("npm", ["pack", "--json", "--pack-destination", tempRoot], {
    cwd: packageDir,
    stdio: "pipe",
    encoding: "utf8",
  });
  const packedTarball = findTarball(pack.stdout, tempRoot);

  const consumerDir = join(tempRoot, "consumer");
  await mkdir(join(consumerDir, "src"), { recursive: true });
  await writeFile(
    join(consumerDir, "package.json"),
    JSON.stringify(
      {
        name: "flow-builder-components-packed-consumer-smoke",
        private: true,
        type: "module",
        dependencies: {
          [packageJson.name]: `file:${packedTarball}`,
          vue: packageJson.peerDependencies.vue,
        },
      },
      null,
      2,
    ),
  );
  await writeFile(
    join(consumerDir, "index.html"),
    '<div id="app"></div><script type="module" src="/src/main.js"></script>\n',
  );
  await writeFile(
    join(consumerDir, "vite.config.mjs"),
    `import tailwindcss from ${JSON.stringify(tailwindVitePluginUrl)};

export default {
  plugins: [tailwindcss()],
  build: {
    chunkSizeWarningLimit: 2000,
  },
};
`,
  );
  await writeFile(
    join(consumerDir, "src/component-runtime.css"),
    `@import "tailwindcss";
@import "@flow-builder/components/styles/component-runtime.css";
@source "./main.js";
`,
  );
  await writeFile(
    join(consumerDir, "src/main.js"),
    `import { staticComponentDefinitions as rootDefinitions } from "@flow-builder/components";
import { staticComponentDefinitions } from "@flow-builder/components/catalog";
import { staticComponentSourceManifest } from "@flow-builder/components/source-manifest";
import { getBuiltInComponentSourceFiles } from "@flow-builder/components/source-files";
import { defineComponent, resolveFixtureData } from "@flow-builder/components/sdk";
import { SchemaForm } from "@flow-builder/components/component-ui";
import "./component-runtime.css";

const fail = (message) => { throw new Error(message); };
if (rootDefinitions.length !== staticComponentDefinitions.length) fail("root/catalog surfaces diverged");
if (!staticComponentSourceManifest.components?.length) fail("source manifest did not load");
const buttonSourceFiles = getBuiltInComponentSourceFiles("demo.demo-button");
if (!buttonSourceFiles?.["component.manifest.json"] || !buttonSourceFiles["sdk/public-sdk.ts"]) fail("source-files surface did not load required payloads");
if (typeof defineComponent !== "function") fail("SDK surface did not load");
if (!SchemaForm) fail("component-ui surface did not load");

const button = staticComponentDefinitions.find((definition) => definition.id === "demo.demo-button") ?? staticComponentDefinitions.find((definition) => definition.renderable);
if (!button?.renderer || !button.configPanel || !button.loadFixtureData) fail("no smoke candidate with renderer/config/fixture loaders");

const Renderer = await button.renderer();
const ConfigPanel = await button.configPanel();
const fixture = await button.loadFixtureData();
if (!Renderer || !ConfigPanel || fixture == null) fail("lazy renderer/config/fixture did not resolve");
const resolvedFixture = await resolveFixtureData(button);
if (resolvedFixture === undefined) fail("SDK fixture resolver did not resolve package fixture data");

document.getElementById("app").innerHTML = \`<section data-ct-scope class="bg-ct-surface text-ct-foreground rounded-ct-md p-ct-md"><h1>Packed package smoke</h1><pre>\${JSON.stringify({ id: button.id, resolved: resolvedFixture !== undefined })}</pre></section>\`;
`,
  );

  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false"], {
    cwd: consumerDir,
  });
  run(process.execPath, [viteBin, "build", "--logLevel", "warn"], { cwd: consumerDir });
  assertConsumerCss(consumerDir);

  if (
    !existsSync(
      join(
        consumerDir,
        "node_modules",
        "@flow-builder",
        "components",
        "dist",
        "styles",
        "component-runtime.css",
      ),
    )
  ) {
    throw new Error("Packed install is missing dist/styles/component-runtime.css.");
  }

  console.log(
    "Packed consumer smoke verified catalog, SDK, component-ui, runtime CSS, and lazy renderer/config/fixture imports.",
  );
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

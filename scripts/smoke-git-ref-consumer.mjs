#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJsonPath = resolve(packageDir, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const requireFromPackage = createRequire(packageJsonPath);
const viteBin = resolve(dirname(requireFromPackage.resolve("vite")), "../../bin/vite.js");
const tailwindVitePluginUrl = pathToFileURL(requireFromPackage.resolve("@tailwindcss/vite")).href;

const lifecycleScriptsBlockedForGitConsumption = new Set([
  "preinstall",
  "install",
  "postinstall",
  "prepublish",
  "prepublishOnly",
  "prepare",
  "prepack",
  "postpack",
]);

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
      ...options.env,
    },
  });
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(" ")} failed with status ${result.status ?? 1}`);
  return result;
}

function assertNoInstallTimeLifecycleScripts() {
  const blocked = Object.keys(packageJson.scripts ?? {}).filter((script) =>
    lifecycleScriptsBlockedForGitConsumption.has(script),
  );
  if (blocked.length > 0) {
    throw new Error(
      `Git-ref consumption must not rely on install-time lifecycle scripts. Remove or explicitly review: ${blocked.join(", ")}`,
    );
  }
}

function assertBuiltArtifactsPresent() {
  const required = [
    "dist/index.js",
    "dist/index.d.ts",
    "dist/generated/catalog.js",
    "dist/generated/catalog.d.ts",
    "dist/generated/source-manifest.js",
    "dist/generated/source-manifest.d.ts",
    "dist/styles/component-runtime.css",
  ];
  for (const [exportKey, target] of Object.entries(packageJson.exports ?? {})) {
    if (typeof target !== "string")
      throw new Error(`Export ${exportKey} must use a direct string target for git-ref smoke.`);
    required.push(target.replace(/^\.\//, ""));
    if (target.endsWith(".js"))
      required.push(target.replace(/^\.\//, "").replace(/\.js$/, ".d.ts"));
  }
  const missing = [...new Set(required)].filter(
    (artifact) => !existsSync(resolve(packageDir, artifact)),
  );
  if (missing.length > 0)
    throw new Error(`Build dist before git-ref smoke; missing artifacts: ${missing.join(", ")}`);

  const lazyArtifacts = walkFiles(resolve(packageDir, "dist/groups"));
  if (!lazyArtifacts.some((file) => file.endsWith("/Renderer.js")))
    throw new Error("Missing built lazy Renderer.js artifacts.");
  if (!lazyArtifacts.some((file) => file.endsWith("/ConfigPanel.js")))
    throw new Error("Missing built lazy ConfigPanel.js artifacts.");
  if (!lazyArtifacts.some((file) => /\/fixtures\/.+\.js$/.test(file)))
    throw new Error("Missing built lazy fixture artifacts.");
}

function walkFiles(root) {
  if (!existsSync(root)) return [];
  const files = [];
  function visit(current) {
    const stat = statSync(current);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current)) visit(join(current, entry));
      return;
    }
    if (stat.isFile()) files.push(current);
  }
  visit(root);
  return files;
}

async function copyGitPayload(gitRepoDir) {
  await cp(resolve(packageDir, "dist"), join(gitRepoDir, "dist"), { recursive: true });
  for (const file of ["package.json", "README.md", "CHANGELOG.md"]) {
    if (existsSync(resolve(packageDir, file)))
      await cp(resolve(packageDir, file), join(gitRepoDir, file));
  }
  if (existsSync(resolve(packageDir, "docs")))
    await cp(resolve(packageDir, "docs"), join(gitRepoDir, "docs"), { recursive: true });
}

function assertInstalledDist(consumerDir) {
  const installedPackageDir = join(consumerDir, "node_modules", "@flow-builder", "components");
  for (const artifact of [
    "dist/index.js",
    "dist/generated/catalog.js",
    "dist/styles/component-runtime.css",
  ]) {
    if (!existsSync(join(installedPackageDir, artifact)))
      throw new Error(`Git-ref install is missing ${artifact}.`);
  }
  const installedPackageJson = JSON.parse(
    readFileSync(join(installedPackageDir, "package.json"), "utf8"),
  );
  const blocked = Object.keys(installedPackageJson.scripts ?? {}).filter((script) =>
    lifecycleScriptsBlockedForGitConsumption.has(script),
  );
  if (blocked.length > 0)
    throw new Error(`Installed package retained blocked lifecycle scripts: ${blocked.join(", ")}`);
}

function assertConsumerCss(consumerDir) {
  const cssSource = walkFiles(join(consumerDir, "dist"))
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  const probes = {
    themeSlot: cssSource.includes("var(--ct-color-surface)"),
    maplibre: cssSource.includes(".maplibregl-map"),
    themeUtility: cssSource.includes(".bg-ct-surface"),
  };
  if (!probes.themeSlot || !probes.maplibre || !probes.themeUtility) {
    throw new Error(
      `Git-ref consumer build did not retain component runtime CSS: ${JSON.stringify(probes)}`,
    );
  }
}

async function writeConsumer(consumerDir, dependencySpec) {
  await mkdir(join(consumerDir, "src"), { recursive: true });
  await writeFile(
    join(consumerDir, "package.json"),
    JSON.stringify(
      {
        name: "flow-builder-components-git-ref-consumer-smoke",
        private: true,
        type: "module",
        dependencies: {
          [packageJson.name]: dependencySpec,
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
    `import tailwindcss from ${JSON.stringify(tailwindVitePluginUrl)};\n\nexport default { plugins: [tailwindcss()], build: { chunkSizeWarningLimit: 2000 } };\n`,
  );
  await writeFile(
    join(consumerDir, "src/component-runtime.css"),
    `@import "tailwindcss";\n@import "@flow-builder/components/styles/component-runtime.css";\n@source "./main.js";\n`,
  );
  await writeFile(
    join(consumerDir, "src/main.js"),
    `import { staticComponentDefinitions as rootDefinitions } from "@flow-builder/components";\nimport { staticComponentDefinitions } from "@flow-builder/components/catalog";\nimport { staticComponentSourceManifest } from "@flow-builder/components/source-manifest";\nimport { getBuiltInComponentSourceFiles } from "@flow-builder/components/source-files";\nimport { defineComponent, resolveFixtureData } from "@flow-builder/components/sdk";\nimport { SchemaForm } from "@flow-builder/components/component-ui";\nimport "./component-runtime.css";\n\nconst fail = (message) => { throw new Error(message); };\nif (rootDefinitions.length !== staticComponentDefinitions.length) fail("root/catalog surfaces diverged");\nif (!staticComponentSourceManifest.components?.length) fail("source manifest did not load");\nconst buttonSourceFiles = getBuiltInComponentSourceFiles("demo.demo-button");\nif (!buttonSourceFiles?.["component.manifest.json"] || !buttonSourceFiles["sdk/public-sdk.ts"]) fail("source-files surface did not load required payloads");\nif (typeof defineComponent !== "function") fail("SDK surface did not load");\nif (!SchemaForm) fail("component-ui surface did not load");\n\nconst button = staticComponentDefinitions.find((definition) => definition.id === "demo.demo-button") ?? staticComponentDefinitions.find((definition) => definition.renderable);\nif (!button?.renderer || !button.configPanel || !button.loadFixtureData) fail("no smoke candidate with renderer/config/fixture loaders");\nconst Renderer = await button.renderer();\nconst ConfigPanel = await button.configPanel();\nconst fixture = await button.loadFixtureData();\nconst resolvedFixture = await resolveFixtureData(button);\nif (!Renderer || !ConfigPanel || fixture == null || resolvedFixture === undefined) fail("lazy renderer/config/fixture did not resolve");\n\ndocument.getElementById("app").innerHTML = \`<section data-ct-scope class="bg-ct-surface text-ct-foreground rounded-ct-md p-ct-md"><h1>Git ref package smoke</h1><pre>\${JSON.stringify({ id: button.id, resolved: true })}</pre></section>\`;\n`,
  );
}

assertNoInstallTimeLifecycleScripts();
assertBuiltArtifactsPresent();

const tempRoot = await mkdtemp(join(tmpdir(), "flow-builder-components-git-ref-smoke-"));

try {
  const gitRepoDir = join(tempRoot, "components-git-repo");
  const consumerDir = join(tempRoot, "consumer");
  await mkdir(gitRepoDir, { recursive: true });
  await copyGitPayload(gitRepoDir);

  run("git", ["init", "--initial-branch=protected-rehearsal"], { cwd: gitRepoDir });
  run("git", ["add", "."], { cwd: gitRepoDir });
  run(
    "git",
    [
      "-c",
      "user.name=Flow Builder Package Smoke",
      "-c",
      "user.email=components-smoke@example.invalid",
      "commit",
      "-m",
      "commit built package dist",
    ],
    { cwd: gitRepoDir },
  );

  const committedDist = run("git", ["ls-tree", "-r", "--name-only", "HEAD", "dist"], {
    cwd: gitRepoDir,
    stdio: "pipe",
    encoding: "utf8",
  }).stdout;
  for (const artifact of [
    "dist/index.js",
    "dist/generated/catalog.js",
    "dist/styles/component-runtime.css",
  ]) {
    if (!committedDist.split(/\r?\n/).includes(artifact))
      throw new Error(`Temporary protected ref did not commit ${artifact}.`);
  }

  const dependencySpec = `git+${pathToFileURL(gitRepoDir).href}#protected-rehearsal`;
  await writeConsumer(consumerDir, dependencySpec);
  run(
    "npm",
    ["install", "--foreground-scripts", "--no-audit", "--no-fund", "--package-lock=false"],
    { cwd: consumerDir },
  );
  assertInstalledDist(consumerDir);
  run(process.execPath, [viteBin, "build", "--logLevel", "warn"], { cwd: consumerDir });
  assertConsumerCss(consumerDir);

  const relativeRepo = relative(tempRoot, gitRepoDir);
  console.log(
    `Git-ref consumer smoke installed ${packageJson.name} from ${relativeRepo}#protected-rehearsal using committed dist artifacts.`,
  );
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

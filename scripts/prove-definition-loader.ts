import path from "node:path";
import { pathToFileURL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { createServer, type ViteDevServer } from "vite";

import { createComponentPackageAliases } from "../tooling/vite-package-aliases.js";

const packageRoot = path.resolve(import.meta.dirname, "..");
const proofModulePath = "/src/groups/content/text/component.ts";
const lazyRendererProofModulePath = "/src/groups/content/key-value/component.ts";

type ComponentDefinition = {
  id?: unknown;
  displayName?: unknown;
  renderer?: unknown;
  configPanel?: unknown;
  params?: unknown;
};

type CapturedOutput = {
  stdout: string[];
  stderr: string[];
};

async function main() {
  const server = await createProofServer();
  try {
    const result = await captureProcessOutput(() =>
      withDomAccessGuards(() => loadProofModule(server)),
    );

    assertNoVueSfcExecution(server);

    const lazyRendererResult = await captureProcessOutput(() =>
      loadLazyRendererProofModule(server),
    );

    const combinedOutput = {
      stdout: [...result.output.stdout, ...lazyRendererResult.output.stdout],
      stderr: [...result.output.stderr, ...lazyRendererResult.output.stderr],
    };

    if (combinedOutput.stdout.length > 0 || combinedOutput.stderr.length > 0) {
      throw new Error(
        [
          "Component definition import produced unexpected process output.",
          formatCapturedOutput("stdout", combinedOutput.stdout),
          formatCapturedOutput("stderr", combinedOutput.stderr),
        ].join("\n"),
      );
    }

    console.log(
      [
        "Definition loader proof passed.",
        `strategy=Vite SSR loader`,
        `module=${proofModulePath}`,
        `component=${result.value.id}`,
        `lazyRendererModule=${lazyRendererProofModulePath}`,
        `lazyRendererComponent=${lazyRendererResult.value.id}`,
        "domAccess=none",
        "importOutput=none",
        "vueSfcExecution=none",
      ].join("\n"),
    );
  } finally {
    await server.close();
  }
}

async function createProofServer() {
  return createServer({
    root: packageRoot,
    configFile: false,
    plugins: [vue()],
    logLevel: "silent",
    server: { middlewareMode: true },
    resolve: { alias: createComponentPackageAliases() },
  });
}

async function loadLazyRendererProofModule(server: ViteDevServer) {
  const moduleUrl = pathToFileURL(path.join(packageRoot, lazyRendererProofModulePath)).href;
  const module = (await server.ssrLoadModule(moduleUrl)) as {
    componentDefinition?: ComponentDefinition;
    default?: ComponentDefinition;
  };

  const definition = module.componentDefinition ?? module.default;
  if (!definition || typeof definition !== "object") {
    throw new Error(`${lazyRendererProofModulePath} did not export a component definition object`);
  }
  if (definition.id !== "content.key-value") {
    throw new Error(
      `${lazyRendererProofModulePath} loaded unexpected component id ${String(definition.id)}`,
    );
  }
  if (typeof definition.renderer !== "function") {
    throw new Error(`${lazyRendererProofModulePath} loaded without a lazy renderer function`);
  }

  const renderer = await definition.renderer();
  if (!(typeof renderer === "function" || isPlainObject(renderer))) {
    throw new Error(
      `${lazyRendererProofModulePath} lazy renderer did not resolve to a Vue component`,
    );
  }

  return definition;
}

async function loadProofModule(server: ViteDevServer) {
  const moduleUrl = pathToFileURL(path.join(packageRoot, proofModulePath)).href;
  const module = (await server.ssrLoadModule(moduleUrl)) as {
    componentDefinition?: ComponentDefinition;
    default?: ComponentDefinition;
  };

  const definition = module.componentDefinition ?? module.default;
  if (!definition || typeof definition !== "object") {
    throw new Error(`${proofModulePath} did not export a component definition object`);
  }
  if (definition.id !== "demo.demo-text") {
    throw new Error(`${proofModulePath} loaded unexpected component id ${String(definition.id)}`);
  }
  if (typeof definition.displayName !== "string" || definition.displayName.length === 0) {
    throw new Error(`${proofModulePath} loaded without a displayName`);
  }
  if (typeof definition.renderer !== "function" || typeof definition.configPanel !== "function") {
    throw new Error(`${proofModulePath} loaded without lazy renderer/configPanel functions`);
  }
  if (
    !Object.prototype.hasOwnProperty.call(definition, "params") ||
    !isPlainObject(definition.params)
  ) {
    throw new Error(`${proofModulePath} loaded without declared params`);
  }

  return definition;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function captureProcessOutput<T>(operation: () => Promise<T>) {
  const output: CapturedOutput = { stdout: [], stderr: [] };
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);

  process.stdout.write = ((chunk: unknown, ...args: unknown[]) => {
    output.stdout.push(String(chunk));
    const callback = args.find(
      (arg): arg is (error?: Error | null) => void => typeof arg === "function",
    );
    callback?.();
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: unknown, ...args: unknown[]) => {
    output.stderr.push(String(chunk));
    const callback = args.find(
      (arg): arg is (error?: Error | null) => void => typeof arg === "function",
    );
    callback?.();
    return true;
  }) as typeof process.stderr.write;

  try {
    return { value: await operation(), output };
  } finally {
    process.stdout.write = originalStdoutWrite as typeof process.stdout.write;
    process.stderr.write = originalStderrWrite as typeof process.stderr.write;
  }
}

async function withDomAccessGuards<T>(operation: () => Promise<T>) {
  const guardedProperties = ["window", "document", "HTMLElement", "customElements"] as const;
  const originals = guardedProperties.map((property) => ({
    property,
    descriptor: Object.getOwnPropertyDescriptor(globalThis, property),
  }));

  for (const property of guardedProperties) {
    Object.defineProperty(globalThis, property, {
      configurable: true,
      get() {
        throw new Error(
          `${proofModulePath} touched globalThis.${property} during definition import`,
        );
      },
    });
  }

  try {
    return await operation();
  } finally {
    for (const { property, descriptor } of originals) {
      if (descriptor) Object.defineProperty(globalThis, property, descriptor);
      else Reflect.deleteProperty(globalThis, property);
    }
  }
}

function assertNoVueSfcExecution(server: ViteDevServer) {
  const executedVueModules = [...server.moduleGraph.urlToModuleMap.entries()]
    .filter(([url, moduleNode]) => url.endsWith(".vue") && moduleNode.ssrModule)
    .map(([url]) => url);

  if (executedVueModules.length > 0) {
    throw new Error(
      [
        `${proofModulePath} executed Vue SFC modules during definition import.`,
        "Definition imports must leave renderer/configPanel modules lazy before generator wiring.",
        ...executedVueModules.map((url) => `- ${url}`),
      ].join("\n"),
    );
  }
}

function formatCapturedOutput(label: "stdout" | "stderr", chunks: string[]) {
  if (chunks.length === 0) return `${label}: <empty>`;
  return `${label}:\n${chunks.join("")}`;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

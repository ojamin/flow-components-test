import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const PACKAGE_ROOT = resolve(import.meta.dirname, "../../..");

const packageJsonPath = join(PACKAGE_ROOT, "package.json");
const packageMetadata = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { name?: string };

if (packageMetadata.name !== "@flow-builder/components") {
  throw new Error(`Package test path helper resolved unexpected package root: ${PACKAGE_ROOT}`);
}

export function resolvePackagePath(...segments: string[]) {
  const packageLocalPath = join(PACKAGE_ROOT, ...segments);
  if (existsSync(packageLocalPath)) return packageLocalPath;

  throw new Error(`Package path does not exist: ${packageLocalPath}`);
}

export const PACKAGE_SRC = resolvePackagePath("src");

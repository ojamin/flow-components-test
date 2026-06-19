export const defaultPackageRoot: URL;
export const defaultPackageJsonPath: URL;
export const groupNames: string[];
export const groupLaneScriptNames: string[];
export const laneScriptNames: string[];

export function resolvePackageRootPath(startCwd?: string): string;
export function normalizeTestFilePath(filePath: string, packageRootPath?: string): string;
export function tokenizeScript(script: string): string[];
export function extractVitestFilters(script: string): string[];
export function resolveScriptFilters(
  scripts: Record<string, string>,
  scriptName: string,
  seen?: Set<string>,
): string[];
export function loadPackageScripts(packageJsonPath?: URL | string): Promise<Record<string, string>>;
export function parseVitestListOutput(output: string, packageRootPath?: string): string[];
export function listVitestFiles(
  filters: string[],
  options?: { packageRoot?: URL; packageJsonPath?: URL | string },
): Promise<string[]>;
export function compareLaneCoverage(
  broadFiles: string[],
  splitFiles: string[],
): { broadOnly: string[]; splitOnly: string[] };
export function runAudit(options?: { packageRoot?: URL; packageJsonPath?: URL | string }): Promise<{
  broadFilters: string[];
  splitLaneFilters: Record<string, string[]>;
  broadFiles: string[];
  splitLaneFiles: Record<string, string[]>;
  splitFiles: string[];
  broadOnly: string[];
  splitOnly: string[];
}>;
export function printAuditResult(result: Awaited<ReturnType<typeof runAudit>>): void;

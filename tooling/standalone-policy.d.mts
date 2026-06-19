export type StandalonePolicyIssue = {
  code: string;
  file: string;
  message: string;
};

export type PackageJsonLike = {
  scripts?: Record<string, string>;
  exports?: Record<string, unknown>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: unknown;
};

export const APPROVED_PUBLIC_EXPORTS: string[];

export function readPackageJson(): PackageJsonLike;
export function validateLifecycleScripts(packageJson: PackageJsonLike): StandalonePolicyIssue[];
export function validateExportMap(
  packageJson: PackageJsonLike,
  options?: { packageDir?: string },
): StandalonePolicyIssue[];
export function validateDependencyDeclarations(options?: {
  packageJson?: PackageJsonLike;
  packageDir?: string;
}): StandalonePolicyIssue[];
export function validateImportBoundaries(options?: {
  packageDir?: string;
}): StandalonePolicyIssue[];
export function validateAuditPath(packageJson: PackageJsonLike): StandalonePolicyIssue[];
export function validatePackagingMetadata(packageJson: PackageJsonLike): StandalonePolicyIssue[];
export function validatePrivacy(options?: { packageDir?: string }): StandalonePolicyIssue[];
export function validateStaticExportHooks(options?: {
  packageDir?: string;
}): StandalonePolicyIssue[];
export function validatePreviewVisualLaneStandaloneSafety(options?: {
  packageDir?: string;
  rootDir?: string;
}): StandalonePolicyIssue[];
export function validateStaticExportAppIntegrationHooks(options?: {
  rootDir?: string;
}): StandalonePolicyIssue[];
export function runGate(gate: string): StandalonePolicyIssue[];

const requiredStateSupportMetadataFields = [
  "empty",
  "loading",
  "error",
  "disabled",
  "focus",
  "keyboard",
  "responsive",
] as const;

type RequiredStateSupportMetadataField = (typeof requiredStateSupportMetadataFields)[number];

export type ManifestMetadataValidationInput = {
  id: string;
  renderable?: boolean;
  fixtureVariants?: readonly unknown[];
  stateSupport?: Partial<Record<RequiredStateSupportMetadataField, unknown>>;
};

export function collectManifestMetadataIssues(
  manifests: readonly ManifestMetadataValidationInput[],
) {
  const issues: string[] = [];

  for (const manifest of manifests) {
    if (!manifest.renderable) continue;

    if (!manifest.fixtureVariants || manifest.fixtureVariants.length === 0) {
      issues.push(
        `${manifest.id} manifest is missing fixtureVariants metadata for package preview matrix coverage.`,
      );
    }
    if (!manifest.stateSupport) {
      issues.push(
        `${manifest.id} manifest is missing StateSupport metadata for package preview matrix coverage.`,
      );
      continue;
    }

    for (const field of requiredStateSupportMetadataFields) {
      if (!manifest.stateSupport[field]) {
        issues.push(
          `${manifest.id} manifest is missing StateSupport.${field} metadata for package preview matrix coverage.`,
        );
      }
    }
  }

  return issues;
}

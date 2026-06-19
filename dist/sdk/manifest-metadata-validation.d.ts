declare const requiredStateSupportMetadataFields: readonly ["empty", "loading", "error", "disabled", "focus", "keyboard", "responsive"];
type RequiredStateSupportMetadataField = (typeof requiredStateSupportMetadataFields)[number];
export type ManifestMetadataValidationInput = {
    id: string;
    renderable?: boolean;
    fixtureVariants?: readonly unknown[];
    stateSupport?: Partial<Record<RequiredStateSupportMetadataField, unknown>>;
};
export declare function collectManifestMetadataIssues(manifests: readonly ManifestMetadataValidationInput[]): string[];
export {};

export type ComponentSourceFileMap = Readonly<Record<string, string>>;
export declare const staticComponentSharedSourceFiles: ComponentSourceFileMap;
export declare const staticComponentSharedSourceFilePathsByComponentId: Readonly<Record<string, readonly string[]>>;
export declare const staticComponentSourceFilesByComponentId: Readonly<Record<string, ComponentSourceFileMap>>;
export declare function getBuiltInComponentSourceFiles(componentId: string): ComponentSourceFileMap | undefined;

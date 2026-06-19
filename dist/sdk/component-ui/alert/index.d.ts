import type { VariantProps } from "class-variance-authority";
export { default as Alert } from "./Alert.js";
export { default as AlertDescription } from "./AlertDescription.js";
export declare const alertVariants: (props?: ({
    variant?: "default" | "destructive" | "warning" | "info" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type AlertVariants = VariantProps<typeof alertVariants>;

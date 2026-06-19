import type { VariantProps } from "class-variance-authority";
export { default as Avatar } from "./Avatar.js";
export { default as AvatarFallback } from "./AvatarFallback.js";
export { default as AvatarImage } from "./AvatarImage.js";
export declare const avatarVariants: (props?: ({
    size?: "default" | "sm" | "lg" | "xl" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type AvatarVariants = VariantProps<typeof avatarVariants>;

import type { VariantProps } from "class-variance-authority";
export { default as Button } from "./Button.js";
export declare const buttonVariants: (props?: ({
    variant?: "default" | "link" | "secondary" | "destructive" | "outline" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | "xs" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
type StyledButtonVariants = VariantProps<typeof buttonVariants>;
export type ButtonVariants = Omit<StyledButtonVariants, "variant"> & {
    variant?: StyledButtonVariants["variant"] | "unstyled";
};

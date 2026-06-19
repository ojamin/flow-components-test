import type { VariantProps } from "class-variance-authority";
export { default as Badge } from "./Badge.js";
export declare const badgeVariants: (props?: ({
    variant?: "default" | "link" | "secondary" | "destructive" | "outline" | "ghost" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
type StyledBadgeVariants = VariantProps<typeof badgeVariants>;
export type BadgeVariants = Omit<StyledBadgeVariants, "variant"> & {
    variant?: StyledBadgeVariants["variant"] | "unstyled";
};

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Avatar } from "./Avatar.vue";
export { default as AvatarFallback } from "./AvatarFallback.vue";
export { default as AvatarImage } from "./AvatarImage.vue";

export const avatarVariants = cva(
  "group/avatar relative flex shrink-0 select-none overflow-hidden border border-ct-border bg-ct-surface-muted text-ct-foreground-muted ring-1 ring-ct-border",
  {
    variants: {
      size: {
        sm: "size-8",
        default: "size-12",
        lg: "size-16",
        xl: "size-24",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type AvatarVariants = VariantProps<typeof avatarVariants>;

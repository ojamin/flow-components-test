import "./Avatar.js";
import "./AvatarFallback.js";
import "./AvatarImage.js";
import { cva as e } from "class-variance-authority";
//#region src/sdk/component-ui/avatar/index.ts
var t = e("group/avatar relative flex shrink-0 select-none overflow-hidden border border-ct-border bg-ct-surface-muted text-ct-foreground-muted ring-1 ring-ct-border", {
	variants: { size: {
		sm: "size-8",
		default: "size-12",
		lg: "size-16",
		xl: "size-24"
	} },
	defaultVariants: { size: "default" }
});
//#endregion
export { t as avatarVariants };

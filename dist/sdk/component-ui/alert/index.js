import "./Alert.js";
import "./AlertDescription.js";
import { cva as e } from "class-variance-authority";
//#region src/sdk/component-ui/alert/index.ts
var t = e("grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*=size-])]:size-4 group/alert relative w-full", {
	variants: { variant: {
		default: "bg-card text-card-foreground",
		destructive: "text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
		warning: "text-warning bg-card *:data-[slot=alert-description]:text-warning/90 *:[svg]:text-current",
		info: "text-info bg-card *:data-[slot=alert-description]:text-info/90 *:[svg]:text-current"
	} },
	defaultVariants: { variant: "default" }
});
//#endregion
export { t as alertVariants };

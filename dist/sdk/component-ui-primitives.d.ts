/**
 * Lower-level shared UI primitive exports for the package component-ui facade.
 *
 * `component-ui.ts` is the public barrel re-exported through
 * `@flow-builder/components/component-ui`. Vue SFCs that the barrel itself
 * re-exports (for example `SchemaForm.vue`) must not import the barrel — that
 * would create a self-cycle. They import from this primitives module instead.
 *
 * Concrete shadcn-vue wrappers and config controls are package-owned and live
 * under `./component-ui/` so package surfaces no longer depend on host
 * application paths for primitives.
 */
export { Badge } from "./component-ui/badge/index.js";
export { Avatar, AvatarFallback, AvatarImage } from "./component-ui/avatar/index.js";
export { Button } from "./component-ui/button/index.js";
export { Checkbox } from "./component-ui/checkbox/index.js";
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./component-ui/collapsible/index.js";
export { Input } from "./component-ui/input/index.js";
export { RadioGroup, RadioGroupItem } from "./component-ui/radio-group/index.js";
export { Skeleton } from "./component-ui/skeleton/index.js";
export { Slider } from "./component-ui/slider/index.js";
export { Switch } from "./component-ui/switch/index.js";
export { Textarea } from "./component-ui/textarea/index.js";
export { Label } from "./component-ui/label/index.js";
export { Alert, AlertDescription } from "./component-ui/alert/index.js";
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue, } from "./component-ui/select/index.js";
export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, } from "./component-ui/dropdown-menu/index.js";
export { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuSub, NavigationMenuTrigger, NavigationMenuViewport, } from "./component-ui/navigation-menu/index.js";
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogOverlay, DialogTitle, DialogTrigger, } from "./component-ui/dialog/index.js";
export { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow, } from "./component-ui/table/index.js";
export { Card, CardDescription, CardTitle } from "./component-ui/card/index.js";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./component-ui/tabs/index.js";
export { ToggleGroup, ToggleGroupItem } from "./component-ui/toggle-group/index.js";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./component-ui/tooltip/index.js";
export { Popover, PopoverContent, PopoverTrigger } from "./component-ui/popover/index.js";
export { Icon } from "@iconify/vue";
export { ConfigSelector, ConfigToggle, ConfigInspectorSection, ConfigValidationFeedback, } from "./component-ui/config/index.js";
export type { ConfigSelectorOption, ConfigValidationMessage, ConfigValidationSeverity, ConfigInspectorSectionProps, } from "./component-ui/config/index.js";
export type { NavigationMenuContentProps, NavigationMenuEmits, NavigationMenuIndicatorProps, NavigationMenuItemProps, NavigationMenuLinkProps, NavigationMenuListProps, NavigationMenuProps, NavigationMenuSubEmits, NavigationMenuSubProps, NavigationMenuTriggerProps, NavigationMenuViewportProps, } from "./component-ui/navigation-menu/index.js";
export type { DialogContentEmits, DialogContentProps, DialogDescriptionProps, DialogEmits, DialogOverlayProps, DialogProps, DialogTitleProps, DialogTriggerProps, } from "./component-ui/dialog/index.js";

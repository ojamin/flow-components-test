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

// ---------------------------------------------------------------------------
// Package-owned shadcn-vue UI primitives
// ---------------------------------------------------------------------------

export { Badge } from "./component-ui/badge";
export { Avatar, AvatarFallback, AvatarImage } from "./component-ui/avatar";
export { Button } from "./component-ui/button";
export { Checkbox } from "./component-ui/checkbox";
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./component-ui/collapsible";
export { Input } from "./component-ui/input";
export { RadioGroup, RadioGroupItem } from "./component-ui/radio-group";
export { Skeleton } from "./component-ui/skeleton";
export { Slider } from "./component-ui/slider";
export { Switch } from "./component-ui/switch";
export { Textarea } from "./component-ui/textarea";
export { Label } from "./component-ui/label";
export { Alert, AlertDescription } from "./component-ui/alert";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./component-ui/select";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./component-ui/dropdown-menu";
export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSub,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./component-ui/navigation-menu";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "./component-ui/dialog";
export {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "./component-ui/table";
export { Card, CardDescription, CardTitle } from "./component-ui/card";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./component-ui/tabs";
export { ToggleGroup, ToggleGroupItem } from "./component-ui/toggle-group";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./component-ui/tooltip";
export { Popover, PopoverContent, PopoverTrigger } from "./component-ui/popover";
// ---------------------------------------------------------------------------
// Third-party UI primitives re-exported for component renderers/config panels
// ---------------------------------------------------------------------------

export { Icon } from "@iconify/vue";

// ---------------------------------------------------------------------------
// Package-owned config controls
// ---------------------------------------------------------------------------

export {
  ConfigSelector,
  ConfigToggle,
  ConfigInspectorSection,
  ConfigValidationFeedback,
} from "./component-ui/config";

// ---------------------------------------------------------------------------
// Types used by the above controls
// ---------------------------------------------------------------------------

export type {
  ConfigSelectorOption,
  ConfigValidationMessage,
  ConfigValidationSeverity,
  ConfigInspectorSectionProps,
} from "./component-ui/config";
export type {
  NavigationMenuContentProps,
  NavigationMenuEmits,
  NavigationMenuIndicatorProps,
  NavigationMenuItemProps,
  NavigationMenuLinkProps,
  NavigationMenuListProps,
  NavigationMenuProps,
  NavigationMenuSubEmits,
  NavigationMenuSubProps,
  NavigationMenuTriggerProps,
  NavigationMenuViewportProps,
} from "./component-ui/navigation-menu";
export type {
  DialogContentEmits,
  DialogContentProps,
  DialogDescriptionProps,
  DialogEmits,
  DialogOverlayProps,
  DialogProps,
  DialogTitleProps,
  DialogTriggerProps,
} from "./component-ui/dialog";

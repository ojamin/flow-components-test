import { describeStaticComponentRenderer } from "../../../../testing";

import { componentDefinition } from "../component";
import { renderCases } from "./cases";

describeStaticComponentRenderer(componentDefinition, renderCases);

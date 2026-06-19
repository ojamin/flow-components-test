import { describeStaticComponentTransform } from "../../../../testing";

import { componentDefinition } from "../component";
import { transformCases } from "./cases";

describeStaticComponentTransform(componentDefinition, transformCases);

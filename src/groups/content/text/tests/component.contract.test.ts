import { describeStaticComponentContract } from "../../../../testing";

import { componentDefinition } from "../component";
import { contractCases } from "./cases";

describeStaticComponentContract(componentDefinition, contractCases);

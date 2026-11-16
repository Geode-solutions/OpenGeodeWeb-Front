// The model suites, by their path in tests/browser/tests (see ../index.ts)

// Local imports
import { registerTests as blocks } from "./blocks";
import { registerTests as collections } from "./collections";
import { registerTests as corners } from "./corners";
import { registerTests as display } from "./display";
import { registerTests as edges } from "./edges";
import { registerTests as lines } from "./lines";
import { registerTests as points } from "./points";
import { registerTests as structuralModel } from "./structural_model";
import { registerTests as surfaces } from "./surfaces";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

const suites: Record<string, (runtime: SuiteRuntime) => void> = {
  "model/blocks": blocks,
  "model/collections": collections,
  "model/corners": corners,
  "model/display": display,
  "model/edges": edges,
  "model/lines": lines,
  "model/points": points,
  "model/structural_model": structuralModel,
  "model/surfaces": surfaces,
};

export { suites };

// Every shared suite, by its path in tests/browser/tests without .test.ts: the apps built on this layer run them
// From one test file, each suite in its own describe

// Local imports
import { registerTests as gridScale } from "./grid_scale";
import { suites as meshSuites } from "./mesh/index";
import { suites as modelSuites } from "./model/index";
import { suites as objectTreeSuites } from "./object_tree/index";
import { registerTests as timeSeries } from "./time_series";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

const suites: Record<string, (runtime: SuiteRuntime) => void> = {
  ...meshSuites,
  ...modelSuites,
  ...objectTreeSuites,
  grid_scale: gridScale,
  time_series: timeSeries,
};

export { suites };

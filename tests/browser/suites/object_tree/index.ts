// The object_tree suites, by their path in tests/browser/tests (see ../index.ts)

// Local imports
import { registerTests as controls } from "./controls";
import { registerTests as groupContextMenu } from "./group_context_menu";
import { registerTests as multiTypeImport } from "./multi_type_import";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

const suites: Record<string, (runtime: SuiteRuntime) => void> = {
  "object_tree/controls": controls,
  "object_tree/group_context_menu": groupContextMenu,
  "object_tree/multi_type_import": multiTypeImport,
};

export { suites };

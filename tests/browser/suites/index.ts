// Every shared suite, by its path in tests/browser/suites without .ts (e.g. "mesh/edged_curve"): the apps built on this
// Layer run them all from one test file, each suite in its own describe. Collected from the folder, a new suite file is
// Run by these apps without any change on their side

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

interface SuiteModule {
  registerTests: (runtime: SuiteRuntime) => void;
}

const SUITE_PATH_REGEX = /^\.\/(?<name>.+)\.ts$/u;

const suiteModules = import.meta.glob<SuiteModule>(["./**/*.ts", "!./index.ts"], { eager: true });

const suites: Record<string, SuiteModule["registerTests"]> = Object.fromEntries(
  Object.entries(suiteModules).map(([file, { registerTests }]) => [
    SUITE_PATH_REGEX.exec(file)?.groups?.name ?? file,
    registerTests,
  ]),
);

export { suites };

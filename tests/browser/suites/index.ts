// Every shared suite, by its path in tests/browser/suites without .ts (e.g. "mesh/edged_curve"): the apps built on this
// Layer run them all from one test file, each suite in its own describe. Collected from the folder, a new suite file is
// Run by these apps without any change on their side

import type { test as AppTest } from "#browser_helpers/app_test";
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

// Runs every suite from the test file of an app (its test extends ../helpers/app_test.ts): each suite is a describe
// Named by its path, which opens the app, runs its tests and closes the app
function runSuites(test: typeof AppTest, loadTestDatas: SuiteRuntime["loadTestDatas"]): void {
  // oxlint-disable-next-line vitest/prefer-each -- Playwright's test has no each for describes
  for (const [name, registerTests] of Object.entries(suites)) {
    test.describe(name, () => {
      test.beforeAll(async ({ app }) => {
        await app.open();
      });
      test.afterAll(async ({ app }) => {
        await app.close();
      });
      registerTests({ test, loadTestDatas });
    });
  }
}

export { runSuites, suites };

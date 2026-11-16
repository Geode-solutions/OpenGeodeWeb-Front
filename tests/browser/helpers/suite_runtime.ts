// What the shared suites need from the app running them: its test fixture (Playwright's in the apps, the Vitest
// Shim of ../shim in this layer) and its data loader

// Third party imports
import type { Locator, Page } from "@playwright/test";

interface SuiteFixtures {
  window: Page;
  screenshotMask: { locators: Locator[] };
}

interface SuiteTest {
  (title: string, body: (fixtures: SuiteFixtures) => Promise<void>): void;
  describe: { configure: (options: { mode: "serial" }) => void };
  slow: () => void;
}

interface SuiteRuntime {
  test: SuiteTest;
  // Loads files of tests/browser/data
  loadTestDatas: (
    window: Page,
    inputDataFilenames: string[],
    options?: { loadTimeout?: number },
  ) => Promise<void>;
}

export type { SuiteFixtures, SuiteRuntime, SuiteTest };

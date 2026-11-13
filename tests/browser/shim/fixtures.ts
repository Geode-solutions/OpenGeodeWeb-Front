// Browser mode version of Vease's e2e fixture (tests/e2e/utils/fixtures.ts): same `test` signature, one app per test file
// (Vitest runs each file in its own page) and the same screenshot taken at the end of each passing test

// Third party imports
import type { Locator as PlaywrightLocator, Page as PlaywrightPage } from "@playwright/test";
import { afterAll, beforeAll, expect, test as vitestTest } from "vitest";
import { page as vitestPage } from "vitest/browser";

// Local imports
import { APP_TEST_ID, startViewerApp, stopViewerApp } from "@ogw_tests/browser/utils/app";
import { type Locator, Page } from "./playwright";
import { waitForActionSettled } from "@ogw_tests/browser/helpers/wait_for_action_settled";

const START_TIMEOUT = 180_000;
const TEST_TIMEOUT = 60_000;
// Playwright's test.slow() triples the timeout
const SLOW_FACTOR = 3;
// The comparison tolerances are in the Vitest config, where the platform is known

// The tests and helpers are typed with the Playwright API, which the shim implements at runtime (the Vitest
// Config aliases @playwright/test to it): they get the shim typed as Playwright's Page and Locators
interface ScreenshotMask {
  locators: PlaywrightLocator[];
}

interface Fixtures {
  window: PlaywrightPage;
  screenshotMask: ScreenshotMask;
}

const shimPage = new Page();
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the shim implements the Playwright API the helpers use
const window = shimPage as unknown as PlaywrightPage;

function shimLocator(locator: PlaywrightLocator): Locator {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- at runtime, every locator is a shim one
  return locator as unknown as Locator;
}

// The app is started once per test file (Vitest runs each file in its own page), when its first test is declared
let appHooksRegistered = false;

function registerAppHooks(): void {
  if (appHooksRegistered) {
    return;
  }
  appHooksRegistered = true;
  beforeAll(startViewerApp, START_TIMEOUT);

  afterAll(stopViewerApp);
}

// Like Playwright's {testName} in the snapshot path
function screenshotName(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
}

function test(title: string, body: (fixtures: Fixtures) => Promise<void>): void {
  registerAppHooks();
  // Test.slow() is called inside the body, once the timeout already runs: it is read from the source
  const timeout = body.toString().includes("test.slow(")
    ? TEST_TIMEOUT * SLOW_FACTOR
    : TEST_TIMEOUT;

  vitestTest(
    // The title of the Vease test
    // oxlint-disable-next-line vitest/valid-title
    title,
    async () => {
      const screenshotMask: ScreenshotMask = { locators: [] };
      await body({ window, screenshotMask });
      // Never capture while the microservices are still busy
      await waitForActionSettled(window);
      await expect
        .element(vitestPage.getByTestId(APP_TEST_ID))
        .toMatchScreenshot(screenshotName(title), {
          screenshotOptions: {
            mask: screenshotMask.locators.flatMap((locator) =>
              shimLocator(locator)
                .elements()
                .map((element) => vitestPage.elementLocator(element)),
            ),
          },
        });
    },
    timeout,
  );
}

// Playwright options with no equivalent: the tests of a file already run in order, in their own page
test.use = (_options: Record<string, unknown>): void => undefined;
test.describe = { configure: (_options: Record<string, unknown>): void => undefined };
// The timeout is applied when the test is declared, see above
test.slow = (): void => undefined;

export { test };

// Browser mode version of Vease's e2e fixture (tests/e2e/utils/fixtures.ts): same `test` signature, one app per test file
// (Vitest runs each file in its own page) and the same screenshot taken at the end of each passing test

// Third party imports
import { afterAll, beforeAll, it, expect as vitestExpect } from "vitest";
import { page as vitestPage } from "vitest/browser";

// Local imports
import { APP_TEST_ID, startViewerApp, stopViewerApp } from "../utils/app";
import { type Locator, Page } from "./playwright";
import { waitForActionSettled } from "@ogw_tests/browser/helpers/wait_for_action_settled";

const START_TIMEOUT = 180_000;
const TEST_TIMEOUT = 60_000;
// Playwright's test.slow() triples the timeout
const SLOW_FACTOR = 3;
// The comparison tolerances are in the Vitest config, where the platform is known

interface ScreenshotMask {
  locators: Locator[];
}

interface Fixtures {
  window: Page;
  screenshotMask: ScreenshotMask;
}

const window = new Page();

beforeAll(startViewerApp, START_TIMEOUT);
afterAll(stopViewerApp);

// Like Playwright's {testName} in the snapshot path
function screenshotName(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
}

function test(title: string, body: (fixtures: Fixtures) => Promise<void>): void {
  // test.slow() is called inside the body, once the timeout already runs: it is read from the source
  const timeout = body.toString().includes("test.slow(")
    ? TEST_TIMEOUT * SLOW_FACTOR
    : TEST_TIMEOUT;
  it(
    title,
    async () => {
      const screenshotMask: ScreenshotMask = { locators: [] };
      await body({ window, screenshotMask });
      // Never capture while the microservices are still busy
      await waitForActionSettled(window);
      await vitestExpect
        .element(vitestPage.getByTestId(APP_TEST_ID))
        .toMatchScreenshot(screenshotName(title), {
          screenshotOptions: {
            mask: screenshotMask.locators.flatMap((locator) =>
              locator.elements().map((element) => vitestPage.elementLocator(element)),
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

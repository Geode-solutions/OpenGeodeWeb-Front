// Where the apps built on this layer store the screenshot taken at the end of each test (see ./app_test.ts):
// Screenshots/<test file path>/<test name>.png, relative to the pathTemplate of their Playwright config

// Node imports
import path from "node:path";

// Third party imports
import type { TestInfo } from "@playwright/test";

const SUITE_TEST_FILE_EXTENSION = ".test.ts";
// Built suite files of this layer, where the tests of its suites are located
const SUITE_FILE_REGEX = /tests[/\\]browser[/\\]suites[/\\](?<suite>.+)\.js$/u;

// Same as Playwright's {testName}: every ASCII character except letters, digits and "-" becomes "-"
function sanitizeForFilePath(name: string): string {
  return name.replaceAll(/[^\dA-Za-z\u0080-￿-]+/gu, "-");
}

// The shared suites (one describe each, see ../suites/index.ts) keep the folders of their test files here,
// Tests/browser/tests/<suite>.test.ts; the other tests keep their path in the test folder of the app
function screenshotPath(testInfo: TestInfo): string[] {
  const titles = testInfo.titlePath.slice(1);
  const suite = SUITE_FILE_REGEX.exec(testInfo.file)?.groups?.suite;
  if (suite !== undefined) {
    return [
      ...`${suite.replaceAll("\\", "/")}${SUITE_TEST_FILE_EXTENSION}`.split("/"),
      `${sanitizeForFilePath(titles.slice(1).join(" "))}.png`,
    ];
  }
  return [
    ...path.relative(testInfo.project.testDir, testInfo.file).split(path.sep),
    `${sanitizeForFilePath(titles.join(" "))}.png`,
  ];
}

export { screenshotPath };

// Node imports
import fs from "node:fs";
import path from "node:path";

// Third party imports
import { type Browser, type Page, expect } from "@playwright/test";
import { consola } from "consola";
import kill from "kill-port";

import { runBrowser } from "@geode/opengeodeweb-front/server/utils/scripts.js";

const MILLISECONDS = 1000;
const APP_READY_SECONDS = 60;
const APP_READY_TIMEOUT = APP_READY_SECONDS * MILLISECONDS;
const PAGE_WIDTH = 1200;
const PAGE_HEIGHT = 800;
const DEFAULT_DATA_PATH = path.join(import.meta.dirname, "..", "..", "integration", "data", "uploads");

interface FileToLoad {
  filename: string;
  geode_object_type: string;
}

interface RunningApp {
  window: Page;
  cleanup: () => Promise<void>;
}

// Starts the e2e app (see ../app) and opens it once its microservices are connected: the viewer is only rendered then
async function startApp(browser: Browser): Promise<RunningApp> {
  const context = await browser.newContext({
    viewport: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
    locale: "en-US",
    timezoneId: "UTC",
  });
  const window = await context.newPage();
  window.on("console", (msg) => {
    consola.info(`Browser console [${msg.type()}]: ${msg.text()}`);
  });
  const port = await runBrowser("preview:browser");
  await window.goto(`http://localhost:${port}`);
  await expect(window.getByTestId("hybridViewer")).toBeVisible({ timeout: APP_READY_TIMEOUT });
  await window.waitForFunction(() => globalThis.ogwE2e !== undefined);
  return {
    window,
    cleanup: async () => {
      await context.close();
      await kill(port);
    },
  };
}

// The files are copied in the folder the back reads its uploads from, then imported like the import UI does after its upload step
async function loadTestDatas(
  window: Page,
  files: FileToLoad[],
  inputDataPath: string = DEFAULT_DATA_PATH,
): Promise<string[]> {
  const uploadFolderPath = await window.evaluate(() => {
    if (globalThis.ogwE2e === undefined) {
      throw new Error("The e2e hook is not installed");
    }
    return globalThis.ogwE2e.uploadFolderPath();
  });
  fs.mkdirSync(uploadFolderPath, { recursive: true });
  for (const { filename } of files) {
    fs.copyFileSync(path.join(inputDataPath, filename), path.join(uploadFolderPath, filename));
  }
  consola.info(`Loading datas: ${files.map(({ filename }) => filename).join(", ")}`);
  const dataIds = await window.evaluate(async (filesToLoad) => {
    if (globalThis.ogwE2e === undefined) {
      throw new Error("The e2e hook is not installed");
    }
    const ids = await globalThis.ogwE2e.loadFiles(filesToLoad);
    return ids;
  }, files);
  return dataIds;
}

export { loadTestDatas, startApp };
export type { FileToLoad, RunningApp };

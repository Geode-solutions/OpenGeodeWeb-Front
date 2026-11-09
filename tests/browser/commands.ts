// Node imports
import fs from "node:fs/promises";
import path from "node:path";

// Third party imports
import type { BrowserCommand, BrowserCommandContext } from "vitest/node";
import type { Page } from "playwright";

// Browser commands: run in Node, called from the tests through `commands` of "vitest/browser"

const COMMAND_BACK = "opengeodeweb-back";
const COMMAND_VIEWER = "opengeodeweb-viewer";
const PROJECT = "ogw-vitest-browser";
const rootPath = path.resolve(import.meta.dirname, "..", "..");
// The back reads the test data straight from the fixtures folder
const uploadFolderPath = path.resolve(import.meta.dirname, "data");

interface Microservices {
  backPort: number;
  viewerPort: number;
  projectFolderPath: string;
}

type MicroservicesModule = typeof import("../../server/utils/microservices");
type PathModule = typeof import("../../server/utils/path");
type CleanupModule = typeof import("../../server/utils/cleanup");

// Each test file gets its own back and viewer, like each Vease e2e file gets its own app
const startMicroservices: BrowserCommand<[]> = async (context): Promise<Microservices> => {
  const serverUtils = path.join(rootPath, "server", "utils");
  const { addMicroserviceMetadatas, runBack, runViewer } =
    await context.project.import<MicroservicesModule>(path.join(serverUtils, "microservices.ts"));
  const { createPath, generateProjectFolderPath } = await context.project.import<PathModule>(
    path.join(serverUtils, "path.ts"),
  );
  const projectFolderPath = generateProjectFolderPath(PROJECT);
  createPath(projectFolderPath);
  const [backPort, viewerPort] = await Promise.all([
    runBack(COMMAND_BACK, rootPath, { projectFolderPath, uploadFolderPath }),
    runViewer(COMMAND_VIEWER, rootPath, { projectFolderPath }),
  ]);
  addMicroserviceMetadatas(projectFolderPath, { type: "back", name: COMMAND_BACK, port: backPort });
  addMicroserviceMetadatas(projectFolderPath, {
    type: "viewer",
    name: COMMAND_VIEWER,
    port: viewerPort,
  });
  return { backPort, viewerPort, projectFolderPath };
};

const stopMicroservices: BrowserCommand<[projectFolderPath: string]> = async (
  context,
  projectFolderPath,
): Promise<void> => {
  const { cleanupBackend } = await context.project.import<CleanupModule>(
    path.join(rootPath, "server", "utils", "cleanup.ts"),
  );
  await cleanupBackend(projectFolderPath);
};

function playwrightPage(context: BrowserCommandContext): Page {
  if (context.provider.name !== "playwright") {
    throw new Error(`The mouse command needs the playwright provider, not ${context.provider.name}`);
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the playwright provider adds `page` to the context
  return (context as unknown as { page: Page }).page;
}

type MouseAction = "move" | "down" | "up" | "wheel";

interface MouseOptions {
  steps?: number;
  button?: "left" | "right" | "middle";
  // Width of the test page, to scale the coordinates when the iframe is scaled down
  viewportWidth?: number;
}

// Playwright's page.mouse takes coordinates of the top page: the test page is an iframe in it
const mouse: BrowserCommand<[action: MouseAction, x: number, y: number, options?: MouseOptions]> =
  async (context, action, x, y, options = {}): Promise<void> => {
    const page = playwrightPage(context);
    if (action === "down") {
      await page.mouse.down({ button: options.button });
      return;
    }
    if (action === "up") {
      await page.mouse.up({ button: options.button });
      return;
    }
    if (action === "wheel") {
      await page.mouse.wheel(x, y);
      return;
    }
    const box = await page.locator('[data-vitest="true"]').boundingBox();
    if (!box) {
      throw new Error("The test iframe has no bounding box");
    }
    const scale = options.viewportWidth ? box.width / options.viewportWidth : 1;
    await page.mouse.move(box.x + x * scale, box.y + y * scale, { steps: options.steps });
  };

const readFileBase64: BrowserCommand<[filePath: string]> = async (
  _context,
  filePath,
): Promise<string> => {
  const content = await fs.readFile(filePath);
  return content.toString("base64");
};

const browserCommands = { mouse, readFileBase64, startMicroservices, stopMicroservices };

declare module "vitest/browser" {
  interface BrowserCommands {
    mouse: (action: MouseAction, x: number, y: number, options?: MouseOptions) => Promise<void>;
    readFileBase64: (filePath: string) => Promise<string>;
    startMicroservices: () => Promise<Microservices>;
    stopMicroservices: (projectFolderPath: string) => Promise<void>;
  }
}

export { browserCommands };

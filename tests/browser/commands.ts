// Node imports
import fs from "node:fs/promises";
import path from "node:path";

// Third party imports
import type { BrowserCommandContext } from "vitest/node";
import type { Page } from "playwright";

// Local imports
import type { addMicroserviceMetadatas, runBack, runViewer } from "@ogw_server/utils/microservices";
import type { createPath, generateProjectFolderPath } from "@ogw_server/utils/path";
import type { cleanupBackend } from "@ogw_server/utils/cleanup";

// Browser commands: run in Node, called from the tests through `commands` of "vitest/browser"

const COMMAND_BACK = "opengeodeweb-back";
const COMMAND_VIEWER = "opengeodeweb-viewer";
const PROJECT = "ogw-vitest-browser";
const rootPath = path.resolve(import.meta.dirname, "..", "..");
const serverUtilsPath = path.join(rootPath, "server", "utils");
// The back reads the test data straight from the fixtures folder
const uploadFolderPath = path.resolve(import.meta.dirname, "data");

interface Microservices {
  backPort: number;
  viewerPort: number;
  projectFolderPath: string;
}

// The server utils the commands load (see importServerUtils)
interface MicroservicesUtils {
  addMicroserviceMetadatas: typeof addMicroserviceMetadatas;
  runBack: typeof runBack;
  runViewer: typeof runViewer;
}

interface PathUtils {
  createPath: typeof createPath;
  generateProjectFolderPath: typeof generateProjectFolderPath;
}

interface CleanupUtils {
  cleanupBackend: typeof cleanupBackend;
}

type MouseAction = "move" | "down" | "up" | "wheel";

interface MouseOptions {
  steps?: number;
  button?: "left" | "right" | "middle";
  // Width of the test page, to scale the coordinates when the iframe is scaled down
  viewportWidth?: number;
}

// The server utils are loaded through Vite, like the tests: they use its aliases
async function importServerUtils<Module>(
  context: BrowserCommandContext,
  fileName: string,
): Promise<Module> {
  const serverUtils = await context.project.import<Module>(path.join(serverUtilsPath, fileName));
  return serverUtils;
}

// Each test file gets its own back and viewer, like each Vease e2e file gets its own app
async function startMicroservices(context: BrowserCommandContext): Promise<Microservices> {
  const microservices = await importServerUtils<MicroservicesUtils>(context, "microservices.ts");
  const paths = await importServerUtils<PathUtils>(context, "path.ts");
  const projectFolderPath = paths.generateProjectFolderPath(PROJECT);
  paths.createPath(projectFolderPath);
  const [backPort, viewerPort] = await Promise.all([
    microservices.runBack(COMMAND_BACK, rootPath, { projectFolderPath, uploadFolderPath }),
    microservices.runViewer(COMMAND_VIEWER, rootPath, { projectFolderPath }),
  ]);
  microservices.addMicroserviceMetadatas(projectFolderPath, {
    type: "back",
    name: COMMAND_BACK,
    port: backPort,
  });
  microservices.addMicroserviceMetadatas(projectFolderPath, {
    type: "viewer",
    name: COMMAND_VIEWER,
    port: viewerPort,
  });
  return { backPort, viewerPort, projectFolderPath };
}

async function stopMicroservices(
  context: BrowserCommandContext,
  projectFolderPath: string,
): Promise<void> {
  const cleanup = await importServerUtils<CleanupUtils>(context, "cleanup.ts");
  await cleanup.cleanupBackend(projectFolderPath);
}

function playwrightPage(context: BrowserCommandContext): Page {
  if (context.provider.name !== "playwright") {
    throw new Error(
      `The mouse command needs the playwright provider, not ${context.provider.name}`,
    );
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the playwright provider adds `page` to the context
  return (context as unknown as { page: Page }).page;
}

// Playwright's page.mouse takes coordinates of the top page: the test page is an iframe in it
async function mouse(
  context: BrowserCommandContext,
  action: MouseAction,
  x: number,
  y: number,
  options: MouseOptions = {},
): Promise<void> {
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
  let scale = 1;
  if (options.viewportWidth !== undefined && options.viewportWidth > 0) {
    scale = box.width / options.viewportWidth;
  }
  await page.mouse.move(box.x + x * scale, box.y + y * scale, { steps: options.steps });
}

async function readFileBase64(_context: BrowserCommandContext, filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return content.toString("base64");
}

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

// Node imports
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

// Third party imports
import { v4 as uuidv4 } from "uuid";

// Local imports
import { appMode } from "./app_mode.js";

function executablePath(execPath, execName) {
  const resourcesPath = process.env.RESOURCES_PATH;
  const mode = process.env.MODE;
  const nodeEnv = process.env.NODE_ENV;
  console.log("[executablePath]", { execPath, execName, mode, nodeEnv, resourcesPath });
  if (mode === appMode.DESKTOP && nodeEnv === "production") {
    const execPathInResources = path.join(resourcesPath, executableName(execName));
    if (fs.existsSync(execPathInResources)) {
      console.log(`[executablePath] Found executable in resources path: ${execPathInResources}`);
      return execPathInResources;
    }
  }
  const localExecPath = path.join(execPath, executableName(execName));
  if (fs.existsSync(localExecPath)) {
    console.log(`[executablePath] Found executable in local path: ${localExecPath}`);
    return localExecPath;
  }
  throw new Error(`Executable not found: ${execName}`);
}

function executableName(execName) {
  if (process.platform === "win32") {
    return `${execName}.exe`;
  }
  return execName;
}

function createPath(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`${dirPath} directory created successfully!`);
  }
  return dirPath;
}

function generateProjectFolderPath(projectName) {
  return path.join(os.tmpdir(), projectName.replaceAll("/", "_"), uuidv4());
}

async function lookForLocalExtensionDistPath(rootPath, extentionRepoName, frontendFile) {
  const localExtensionPath = path.join(rootPath, "..", extentionRepoName);
  const localExtensionDistPath = path.join(localExtensionPath, "dist");

  if (!fs.existsSync(localExtensionDistPath)) {
    return;
  }
  console.log(`[extensionFrontendPath] Found existing folder: ${localExtensionDistPath}, deleting it...`);
  fs.rmSync(localExtensionDistPath, { recursive: true, force: true });
  const now = new Date();
  fs.utimesSync(path.join(localExtensionPath, "package.json"), now, now);

  const rebuiltFilePath = path.join(localExtensionDistPath, frontendFile);
  const MAX_DELETE_FOLDER_RETRIES = 10;
  const MILLISECONDS_PER_RETRY = 1000;

  for (let i = 0; i <= MAX_DELETE_FOLDER_RETRIES; i += 1) {
    if (fs.existsSync(rebuiltFilePath)) {
      console.log(`Found rebuilt file: ${rebuiltFilePath}`);
      return rebuiltFilePath;
    }
    console.log(`Waiting for rebuild... attempt ${i}/${MAX_DELETE_FOLDER_RETRIES}`);
    // oxlint-disable-next-line no-await-in-loop
    await setTimeout(MILLISECONDS_PER_RETRY);
  }

  throw new Error(`Failed to find local extension dist path: ${rebuiltFilePath}`);
}
async function extensionFrontendPath(unzippedExtensionPath, frontendFile, rootPath, extensionId) {
  console.log("[extensionFrontendPath]", { unzippedExtensionPath, frontendFile, rootPath, extensionId });
  const extentionRepoName = extensionId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");

  const localFilePath = await lookForLocalExtensionDistPath(rootPath, extentionRepoName, frontendFile);
  if (localFilePath) {
    return localFilePath;
  }

  const unzippedfrontendFilePath = path.join(unzippedExtensionPath, frontendFile);
  if (fs.existsSync(unzippedfrontendFilePath)) {
    return unzippedfrontendFilePath;
  }
  throw new Error(`Failed to find ${unzippedfrontendFilePath}`);
}

export {
  createPath,
  extensionFrontendPath,
  executablePath,
  executableName,
  generateProjectFolderPath,
};

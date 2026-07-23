// Node imports
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

// Third party imports
import { v4 as uuidv4 } from "uuid";

// Local imports
import { appMode } from "./app_mode.js";
import { commandExistsSync } from "./scripts.js";

function findExecutableInDir(baseDir, execName, osExecutableName) {
  const oneFilePath = path.join(baseDir, osExecutableName);
  if (fs.existsSync(oneFilePath) && fs.statSync(oneFilePath).isFile()) {
    console.log(`[executablePath] Found OneFile executable: ${oneFilePath}`);
    return oneFilePath;
  }

  const oneDirPath = path.join(baseDir, execName, osExecutableName);
  if (fs.existsSync(oneDirPath) && fs.statSync(oneDirPath).isFile()) {
    console.log(`[executablePath] Found OneDir executable: ${oneDirPath}`);
    return oneDirPath;
  }
  console.log(
    `[executablePath] Executable not found in ${baseDir} (tried OneFile and OneDir): ${execName}`,
  );
  return undefined;
}
function executablePath(execPath, execName) {
  const osExecutableName = executableName(execName);
  const resourcesPath = process.env.RESOURCES_PATH;
  const mode = process.env.MODE;
  const nodeEnv = process.env.NODE_ENV;

  console.log("[executablePath]", { execPath, execName, mode, nodeEnv, resourcesPath });

  const foundAtExecPath = findExecutableInDir(execPath, execName, osExecutableName);
  if (foundAtExecPath) {
    return foundAtExecPath;
  }

  if (mode === appMode.DESKTOP && nodeEnv === "production") {
    const foundInResources = findExecutableInDir(resourcesPath, execName, osExecutableName);
    if (foundInResources) {
      return foundInResources;
    }
    throw new Error(
      `Executable not found in execPath (${execPath}) or resourcesPath (${resourcesPath}): ${osExecutableName}`,
    );
  }

  if (commandExistsSync(osExecutableName)) {
    console.log(`[executablePath] Found executable in PATH: ${osExecutableName}`);
    return osExecutableName;
  }

  throw new Error(`Executable not found: ${osExecutableName}`);
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

function extensionFolderPath(projectFolderPath, extensionId) {
  return path.join(projectFolderPath, "extensions", extensionId);
}

async function lookForLocalExtensionDistPath(rootPath, extentionRepoName, frontendFile) {
  const localExtensionPath = path.join(rootPath, "..", extentionRepoName);
  const localExtensionDistPath = path.join(localExtensionPath, "dist");

  if (!fs.existsSync(localExtensionDistPath)) {
    return;
  }
  console.log(
    `[extensionFrontendPath] Found existing folder: ${localExtensionDistPath}, deleting it...`,
  );
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
}
async function extensionFrontendPath(unzippedExtensionPath, frontendFile, rootPath, extensionId) {
  console.log("[extensionFrontendPath]", {
    unzippedExtensionPath,
    frontendFile,
    rootPath,
    extensionId,
  });
  const extentionRepoName = extensionId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");

  const localFilePath = await lookForLocalExtensionDistPath(
    rootPath,
    extentionRepoName,
    frontendFile,
  );
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
  extensionFolderPath,
  executablePath,
  executableName,
  generateProjectFolderPath,
};

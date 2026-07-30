// Node.js imports
import path from "node:path";
import { unlink } from "node:fs";

// Third party imports
import Conf from "conf";
import sanitize from "sanitize-filename";

// Local imports

function projectConf(projectName) {
  const projectConfig = new Conf({ projectName });
  console.log(projectConf.name, { projectConfig });
  return projectConfig;
}

function confFolderPath(projectName) {
  const projectConfig = projectConf(projectName);
  return path.dirname(projectConfig.path);
}

function targetExtensionFilePath(projectName, filename) {
  const safeFilename = sanitize(filename);
  const targetPath = path.join(configFolderPath(projectName), safeFilename);
  return targetPath;
}

function extensionsConf(projectName) {
  const projectConfig = projectConf(projectName);
  if (!projectConfig.has("extensions")) {
    projectConfig.set("extensions", {});
  }
  const extensionsConfig = projectConfig.get("extensions");
  return extensionsConfig;
}

function addExtensionToConf(projectName, { extensionId, extensionPath }) {
  const projectConfig = projectConf(projectName);
  projectConfig.set(`extensions.${extensionId}.path`, extensionPath);
}

async function removeExtensionFromConf(projectName, extensionId) {
  const projectConfig = projectConf(projectName);
  const extensionArchivePath = extensionPathFromConf(projectName, extensionId);

  await unlink(extensionArchivePath, (error) => {
    if (error) {
      throw error;
    }
    console.log(`${extensionArchivePath} was deleted`);
  });
  projectConfig.delete(`extensions.${extensionId}`);
  console.log(`${extensionId} was deleted from ${projectName} config`);
}

function extensionPathFromConf(projectName, extensionId) {
  const projectConfig = projectConf(projectName);
  return projectConfig.get(`extensions.${extensionId}.path`);
}

export {
  addExtensionToConf,
  confFolderPath,
  extensionPathFromConf,
  extensionsConf,
  projectConf,
  removeExtensionFromConf,
  targetExtensionFilePath,
};

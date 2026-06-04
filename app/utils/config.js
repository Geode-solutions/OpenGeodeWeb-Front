// Node.js imports
import path from "node:path";
import { unlink } from 'node:fs';

// Third party imports
import Conf from "conf";

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

function extensionsConf(projectName) {
  const projectConfig = projectConf(projectName);
  if (!projectConfig.has("extensions")) {
    projectConfig.set("extensions", {});
  }
  const extensionsConfig = projectConfig.get("extensions");
  return extensionsConfig;
}

function addExtensionToConf(projectName, { extensionID, extensionPath }) {
  const projectConfig = projectConf(projectName);
  projectConfig.set(`extensions.${extensionID}.path`, extensionPath);
}

async function removeExtensionFromConf(projectName, extensionID) {
  const projectConfig = projectConf(projectName);
  const extensionArchivePath = extensionPathFromConf(projectName, extensionID);

  await unlink(extensionArchivePath, (error) => {
    if (error) {
      throw error;
    }
    console.log(`${extensionArchivePath} was deleted`);
  });
  projectConfig.delete(`extensions.${extensionID}`);
  console.log(`${extensionID} was deleted from ${projectName} config`);


}

function extensionPathFromConf(projectName, extensionID) {
  const projectConfig = projectConf(projectName);
  return projectConfig.get(`extensions.${extensionID}.path`);
}

export {
  confFolderPath,
  projectConf,
  extensionsConf,
  addExtensionToConf,
  removeExtensionFromConf,
  extensionPathFromConf
};

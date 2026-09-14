// Node.js imports
import path from "node:path";
import { unlink } from "node:fs";

// Third party imports
import Conf from "conf";
import StreamZip from "node-stream-zip";
import sanitize from "sanitize-filename";

// Local imports

interface ExtensionsConfigSchema {
  extensions: Record<string, { path: string }>;
}

function projectConf(projectName: string) {
  const projectConfig = new Conf<ExtensionsConfigSchema>({
    projectName,
  });
  console.log(projectConf.name, {
    projectConfig,
  });
  return projectConfig;
}
function confFolderPath(projectName: string) {
  const projectConfig = projectConf(projectName);
  return path.dirname(projectConfig.path);
}
function targetExtensionFilePath(projectName: string, filename: string) {
  const safeFilename = sanitize(filename);
  const targetPath = path.join(confFolderPath(projectName), safeFilename);
  return targetPath;
}
function extensionsConf(projectName: string) {
  const projectConfig = projectConf(projectName);
  if (!projectConfig.has("extensions")) {
    projectConfig.set("extensions", {});
  }
  const extensionsConfig = projectConfig.get("extensions");
  return extensionsConfig;
}
function addExtensionToConf(
  projectName: string,
  { extensionId, extensionPath }: { extensionId: string; extensionPath: string },
) {
  const projectConfig = projectConf(projectName);
  projectConfig.set(`extensions.${extensionId}.path`, extensionPath);
}

function extensionPathFromConf(projectName: string, extensionId: string): string {
  const projectConfig = projectConf(projectName);
  return projectConfig.get(`extensions.${extensionId}.path`) as string;
}

async function removeExtensionFromConf(projectName: string, extensionId: string) {
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

interface ExtensionMetadata {
  id: string;
  [key: string]: unknown;
}

async function registerExtensionFile(projectName: string, file: string) {
  const StreamZipAsync = StreamZip.async;
  const zip = new StreamZipAsync({
    file,
    storeEntries: true,
  });
  const metadataJson = await zip.entryData("metadata.json");
  const metadata = JSON.parse(metadataJson.toString("utf8")) as ExtensionMetadata;
  const { id } = metadata;
  addExtensionToConf(projectName, {
    extensionId: id,
    extensionPath: file,
  });
}
export {
  addExtensionToConf,
  confFolderPath,
  extensionPathFromConf,
  extensionsConf,
  projectConf,
  registerExtensionFile,
  removeExtensionFromConf,
  targetExtensionFilePath,
};

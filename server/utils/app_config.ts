// Node.js imports
import path from "node:path";
import { unlink } from "node:fs/promises";

// Third party imports
import Conf from "conf";
import StreamZip from "node-stream-zip";
import sanitize from "sanitize-filename";

// Local imports

interface ExtensionsConfigSchema {
  extensions: Record<string, { path: string }>;
}

function projectConf(projectName: string): Conf<ExtensionsConfigSchema> {
  const projectConfig = new Conf<ExtensionsConfigSchema>({
    projectName,
  });
  console.log(projectConf.name, {
    projectConfig,
  });
  return projectConfig;
}

function confFolderPath(projectName: string): string {
  const projectConfig = projectConf(projectName);
  return path.dirname(projectConfig.path);
}

function targetExtensionFilePath(projectName: string, filename: string): string {
  const safeFilename = sanitize(filename);
  const targetPath = path.join(confFolderPath(projectName), safeFilename);
  return targetPath;
}

function extensionsConf(projectName: string): ExtensionsConfigSchema["extensions"] {
  const projectConfig = projectConf(projectName);
  // Read-only: concurrent app instances share this file and racing writes fail on Windows (EPERM)
  return projectConfig.get("extensions", {});
}

function addExtensionToConf(
  projectName: string,
  { extensionId, extensionPath }: { extensionId: string; extensionPath: string },
): void {
  const projectConfig = projectConf(projectName);
  projectConfig.set(`extensions.${extensionId}.path`, extensionPath);
}

function extensionPathFromConf(projectName: string, extensionId: string): string {
  const projectConfig = projectConf(projectName);
  return projectConfig.get(`extensions.${extensionId}.path`);
}

async function removeExtensionFromConf(projectName: string, extensionId: string): Promise<void> {
  const projectConfig = projectConf(projectName);
  const extensionArchivePath = extensionPathFromConf(projectName, extensionId);
  await unlink(extensionArchivePath);
  console.log(`${extensionArchivePath} was deleted`);
  projectConfig.delete(`extensions.${extensionId}`);
  console.log(`${extensionId} was deleted from ${projectName} config`);
}

interface ExtensionMetadata {
  id: string;
  [key: string]: unknown;
}

function isExtensionMetadata(value: unknown): value is ExtensionMetadata {
  return (
    typeof value === "object" && value !== null && "id" in value && typeof value.id === "string"
  );
}

async function registerExtensionFile(projectName: string, file: string): Promise<void> {
  const StreamZipAsync = StreamZip.async;
  const zip = new StreamZipAsync({
    file,
    storeEntries: true,
  });
  const metadataJson = await zip.entryData("metadata.json");
  const parsedMetadata: unknown = JSON.parse(metadataJson.toString("utf8"));
  if (!isExtensionMetadata(parsedMetadata)) {
    throw new TypeError("metadata.json does not match the expected ExtensionMetadata shape");
  }
  const { id } = parsedMetadata;
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

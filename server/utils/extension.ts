// Node imports
import { promises as fs } from "node:fs";
import path from "node:path";

// Third party imports
import { createError } from "h3";

// Local imports
import { extensionFrontendPath } from "@geode/opengeodeweb-front/server/utils/path.js";

interface ExtensionMetadata {
  id: string;
  name: string;
  version: string;
  frontendFile: string;
  backendExecutable: string;
  [key: string]: unknown;
}

async function readExtensionMetadata(unzippedExtensionPath: string): Promise<ExtensionMetadata> {
  const metadataPath = path.join(unzippedExtensionPath, "metadata.json");
  const metadataContent = await fs.readFile(metadataPath, "utf8");
  if (!metadataContent) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid extension file: missing metadata.json",
    });
  }
  const metadata = JSON.parse(metadataContent) as ExtensionMetadata;
  console.log("readExtensionMetadata", { metadata });
  if (!metadata.frontendFile) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid extension file: missing frontend JavaScript",
    });
  }
  if (!metadata.backendExecutable) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid extension file: missing backend executable",
    });
  }

  return metadata;
}

async function readExtensionFrontend(
  unzippedExtensionPath: string,
  frontendFile: string,
  id: string,
): Promise<string> {
  console.log("readExtensionFrontend", { id });
  const frontendFilePath = await extensionFrontendPath(
    unzippedExtensionPath,
    frontendFile,
    path.resolve(),
    id,
  );
  console.log("readExtensionFrontend", { frontendFilePath });
  return fs.readFile(frontendFilePath, "utf8");
}

export { readExtensionFrontend, readExtensionMetadata };

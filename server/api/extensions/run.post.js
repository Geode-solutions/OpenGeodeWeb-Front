// Node imports
import fs from "node:fs";
import path from "node:path";

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  addMicroserviceMetadatas,
  runBack,
} from "@geode/opengeodeweb-front/app/utils/local/microservices.js";
import {
  executableName,
  extensionFolderPath,
  extensionFrontendPath,
} from "@geode/opengeodeweb-front/app/utils/local/path.js";
import { extensionsConf } from "@geode/opengeodeweb-front/app/utils/config.js";
import { unzipFile } from "@geode/opengeodeweb-front/app/utils/server.js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { projectFolderPath, projectName } = body;
    const extensionsConfig = extensionsConf(projectName);

    const extensionsArray = await Promise.all(
      Object.keys(extensionsConfig).map(async (extensionID) => {
        const extensionPath = extensionsConfig[extensionID].path;
        const unzippedExtensionPath = await unzipFile(
          extensionPath,
          extensionFolderPath(projectFolderPath, extensionID),
        );
        const metadataPath = path.join(unzippedExtensionPath, "metadata.json");
        const metadataContent = await fs.promises.readFile(metadataPath, "utf8");

        if (!metadataContent) {
          throw createError({
            statusCode: 400,
            statusMessage: "Invalid extension file: missing metadata.json",
          });
        }
        const metadata = JSON.parse(metadataContent);
        console.log("runExtensions", { metadata });

        const { id, name, version, backendExecutable, frontendFile } = metadata;
        console.log("runExtensions", { id, name, version, backendExecutable });

        if (!frontendFile) {
          throw createError({
            statusCode: 400,
            statusMessage: "Invalid extension file: missing frontend JavaScript",
          });
        }
        if (!backendExecutable) {
          throw createError({
            statusCode: 400,
            statusMessage: "Invalid extension file: missing backend executable",
          });
        }

        const frontendFilePath = await extensionFrontendPath(
          unzippedExtensionPath,
          frontendFile,
          path.resolve(),
          id,
        );

        console.log("runExtensions", { frontendFilePath });
        const frontendContent = await fs.promises.readFile(frontendFilePath, "utf8");

        const backendExecutablePath = path.join(
          unzippedExtensionPath,
          executableName(backendExecutable),
        );
        console.log("runExtensions", { backendExecutablePath });
        fs.chmodSync(backendExecutablePath, "755");
        const port = await runBack(backendExecutable, unzippedExtensionPath, {
          projectFolderPath,
        });
        await addMicroserviceMetadatas(projectFolderPath, {
          type: "back",
          name,
          port,
        });
        return {
          id,
          name,
          version,
          frontendContent,
          port,
        };
      }),
    );

    return {
      statusCode: 200,
      extensionsArray,
    };
  } catch (error) {
    console.error("Error running extensions:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});

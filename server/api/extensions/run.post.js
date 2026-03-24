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
import { extensionFrontendPath } from "@geode/opengeodeweb-front/app/utils/local/path.js";
import { extensionsConf } from "@geode/opengeodeweb-front/app/utils/config.js";
import { unzipFile } from "@geode/opengeodeweb-front/app/utils/server.js";

const __dirname = path.resolve();

const CODE_200 = 200;

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
          path.join(projectFolderPath, "extensions"),
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

        const frontendFilePath = extensionFrontendPath(
          projectFolderPath,
          frontendFile,
          path.resolve(__dirname),
          id,
        );

        console.log("frontendFilePath", { frontendFilePath });
        const frontendContent = await fs.promises.readFile(frontendFilePath, "utf8");

        const backendExecutablePath = path.join(unzippedExtensionPath, backendExecutable);
        fs.chmodSync(backendExecutablePath, "755");
        const port = await runBack(backendExecutable, backendExecutablePath, {
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
      statusCode: CODE_200,
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

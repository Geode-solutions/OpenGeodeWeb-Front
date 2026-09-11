// Node imports
import fs from "node:fs";

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  addMicroserviceMetadatas,
  runExtension,
} from "@geode/opengeodeweb-front/server/utils/microservices.js";
import {
  extensionBackendPath,
  extensionFolderPath,
} from "@geode/opengeodeweb-front/server/utils/path.js";
import {
  readExtensionFrontend,
  readExtensionMetadata,
} from "@geode/opengeodeweb-front/server/utils/extension.js";
import { extensionsConf } from "@geode/opengeodeweb-front/server/utils/app_config.js";
import { unzipFile } from "@geode/opengeodeweb-front/server/utils/server.js";

export default defineEventHandler(async (event) => {
  try {
    console.log("NITRO: runExtensions", event);
    const { projectFolderPath, projectName } = await readBody(event);
    const extensionsConfig = extensionsConf(projectName);
    const extensionsArray = await Promise.all(
      Object.keys(extensionsConfig).map(async (extensionId) => {
        const extensionPath = extensionsConfig[extensionId].path;
        const unzippedExtensionPath = await unzipFile(
          extensionPath,
          extensionFolderPath(projectFolderPath, extensionId),
        );
        const { id, name, version, backendExecutable, frontendFile } =
          await readExtensionMetadata(unzippedExtensionPath);
        const frontendContent = await readExtensionFrontend(
          unzippedExtensionPath,
          frontendFile,
          id,
        );
        fs.chmodSync(extensionBackendPath(unzippedExtensionPath, backendExecutable), "755");
        const port = await runExtension(id, backendExecutable, unzippedExtensionPath, {
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

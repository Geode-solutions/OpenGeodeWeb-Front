// Node imports
import fs from "node:fs";

// Third party imports
import { type H3Event, createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  addMicroserviceMetadatas,
  runBack,
} from "@geode/opengeodeweb-front/server/utils/microservices.ts";
import {
  extensionBackendPath,
  extensionFolderPath,
} from "@geode/opengeodeweb-front/server/utils/path.ts";
import {
  readExtensionFrontend,
  readExtensionMetadata,
} from "@geode/opengeodeweb-front/server/utils/extension.ts";
import { extensionsConf } from "@geode/opengeodeweb-front/server/utils/app_config.ts";
import { unzipFile } from "@geode/opengeodeweb-front/server/utils/server.ts";

interface RunExtensionsBody {
  projectFolderPath: string;
  projectName: string;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    console.log("NITRO: runExtensions", event);
    const { projectFolderPath, projectName } = await readBody<RunExtensionsBody>(event);
    const extensionsConfig = extensionsConf(projectName);
    const extensionsArray = await Promise.all(
      Object.entries(extensionsConfig).map(async ([extensionId, { path: extensionPath }]) => {
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
        const port = await runBack(backendExecutable, unzippedExtensionPath, {
          projectFolderPath,
        });
        addMicroserviceMetadatas(projectFolderPath, {
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

      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});

// Node imports
import fs from "node:fs";

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { addMicroserviceMetadatas, runBack } from "@ogw_server/utils/microservices";
import { extensionBackendPath, extensionFolderPath } from "@ogw_server/utils/path";
import { readExtensionFrontend, readExtensionMetadata } from "@ogw_server/utils/extension";
import { extensionsConf } from "@ogw_server/utils/app_config";
import { unzipFile } from "@ogw_server/utils/server";

interface RunExtensionsBody {
  projectFolderPath: string;
  projectName: string;
}

export default defineEventHandler(async (event) => {
  try {
    console.log("NITRO: runExtensions", event);
    const { projectFolderPath, projectName } = await readBody<RunExtensionsBody>(event);
    const extensionsConfig = extensionsConf(projectName);
    const extensionsArray = await Promise.all(
      Object.keys(extensionsConfig).map(async (extensionId) => {
        // Safe: extensionId comes from Object.keys(extensionsConfig) itself.
        const extensionPath = extensionsConfig[extensionId]!.path;
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
        await addMicroserviceMetadatas(projectFolderPath, {
          type: "back",
          name,
          // RunBack can exhaust its port-conflict retries and return undefined
          // (pre-existing bug: addMicroserviceMetadatas/URLs then embed "undefined").
          port: port as number,
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
      statusMessage: (error as Error).message,
    });
  }
});

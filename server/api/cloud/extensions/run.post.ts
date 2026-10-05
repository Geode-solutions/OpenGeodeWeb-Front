// Node imports
import fs from "node:fs";

// Third party imports
import { consola } from "consola";

// Local imports
import {
  addMicroserviceMetadatas,
  runExtension,
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

import { defineTypedEventHandler } from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

export default defineTypedEventHandler(
  schemas.api.cloud.extensions.run,
  async ({ projectFolderPath, projectName }) => {
    consola.debug("NITRO: runExtensions", { projectFolderPath, projectName });
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
        const port = await runExtension(id, backendExecutable, unzippedExtensionPath, {
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

    return { statusCode: 200, extensionsArray };
  },
);

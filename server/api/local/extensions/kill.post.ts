// Node imports

// Third party imports
import { consola } from "consola";

// Local imports
import {
  deleteFolderRecursive,
  getMicroserviceByName,
  killMicroservice,
  projectMicroservices,
} from "@geode/opengeodeweb-front/server/utils/cleanup.ts";
import { extensionFolderPath } from "@geode/opengeodeweb-front/server/utils/path.ts";
import { removeExtensionFromConf } from "@geode/opengeodeweb-front/server/utils/app_config.ts";

import { defineTypedEventHandler } from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

export default defineTypedEventHandler(
  schemas.api.local.extensions.kill,
  async ({ projectFolderPath, projectName, extensionId }) => {
    consola.debug({ projectFolderPath, projectName, extensionId });

    const microservices = projectMicroservices(projectFolderPath);
    const microservice = getMicroserviceByName(microservices, extensionId);
    if (!microservice) {
      throw new Error(`Microservice ${extensionId} not found`);
    }

    await removeExtensionFromConf(projectName, extensionId);
    await killMicroservice(microservice);
    await deleteFolderRecursive(extensionFolderPath(projectFolderPath, extensionId));

    return { statusCode: 200 };
  },
);

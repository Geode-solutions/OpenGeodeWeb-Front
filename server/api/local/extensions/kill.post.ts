// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  deleteFolderRecursive,
  getMicroserviceByName,
  killMicroservice,
  projectMicroservices,
} from "@geode/opengeodeweb-front/server/utils/cleanup.js";
import { extensionFolderPath } from "@geode/opengeodeweb-front/server/utils/path.js";
import { removeExtensionFromConf } from "@geode/opengeodeweb-front/server/utils/app_config.js";

interface KillExtensionBody {
  projectFolderPath: string;
  projectName: string;
  extensionId: string;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<KillExtensionBody>(event);
    const { projectFolderPath, projectName, extensionId } = body;

    console.log({ projectFolderPath, projectName, extensionId });

    const microservices = projectMicroservices(projectFolderPath);
    const microservice = getMicroserviceByName(microservices, extensionId);
    if (!microservice) {
      throw new Error(`Microservice ${extensionId} not found`);
    }

    await removeExtensionFromConf(projectName, extensionId);
    await killMicroservice(microservice);
    await deleteFolderRecursive(extensionFolderPath(projectFolderPath, extensionId));

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error killing extension:", error);
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message,
    });
  }
});

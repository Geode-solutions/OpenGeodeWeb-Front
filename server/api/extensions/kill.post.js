// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  deleteFolderRecursive,
  getMicroserviceByName,
  killMicroservice,
  projectMicroservices,
} from "@geode/opengeodeweb-front/app/utils/local/cleanup.js";
import { extensionFolderPath } from "@geode/opengeodeweb-front/app/utils/local/path.js";
import { removeExtensionFromConf } from "@geode/opengeodeweb-front/app/utils/config.js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { projectFolderPath, projectName, extensionId } = body;

    console.log({ projectFolderPath, projectName, extensionId });

    const microservices = projectMicroservices(projectFolderPath);
    const microservice = getMicroserviceByName(microservices, extensionId);
    if (!microservice) {
      throw new Error(`Microservice ${extensionId} not found`);
    }

    await removeExtensionFromConf(projectName, extensionId);
    await killMicroservice(microservice, microservices);
    console.log("After killMicroservice from kill.post", { microservices });
    await deleteFolderRecursive(extensionFolderPath(projectFolderPath, extensionId));

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error killing extension:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});

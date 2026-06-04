// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { deleteFolderRecursive } from "@geode/opengeodeweb-front/app/utils/local/cleanup.js";
import { extensionFolderPath } from "@geode/opengeodeweb-front/app/utils/path.js";
import { killMicroservice } from "@geode/opengeodeweb-front/app/utils/extension.js";
import { removeExtensionFromConf } from "@geode/opengeodeweb-front/app/utils/config.js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { projectFolderPath, projectName, extensionID } = body;

    await removeExtensionFromConf(projectName, extensionID);
    await deleteFolderRecursive(extensionFolderPath(projectFolderPath, extensionID));
    await killMicroservice({ id: extensionID, type: "back" });

    return {
      statusCode: 200,
      extensionsArray,
    };
  } catch (error) {
    console.error("Error killing extension:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});

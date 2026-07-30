// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { appMode } from "@ogw_shared/app_mode.js";
import { createPath, generateProjectFolderPath } from "@ogw_server/utils/path.js";

export default defineEventHandler(async (event) => {
  try {
    const { PROJECT } = await readBody(event);
    const projectFolderPath = generateProjectFolderPath(PROJECT);
    await createPath(projectFolderPath);

    return {
      statusCode: 200,
      projectFolderPath,
    };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});

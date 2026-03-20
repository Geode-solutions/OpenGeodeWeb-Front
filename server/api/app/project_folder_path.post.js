// Node imports

// Third party imports
import { createError, defineEventHandler } from "h3";

// Local imports
import {
  createPath,
  generateProjectFolderPath,
} from "@geode/opengeodeweb-front/app/utils/local/path.js";

import { useRuntimeConfig } from "nitropack/runtime";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event).public;
    const { PROJECT } = config;
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

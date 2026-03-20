// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  addMicroserviceMetadatas,
  runViewer,
} from "@geode/opengeodeweb-front/app/utils/local/microservices.js";

import { useRuntimeConfig } from "nitropack/runtime";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event).public;
    const { COMMAND_VIEWER, NUXT_ROOT_PATH } = config;
    const { args } = await readBody(event);
    const port = await runViewer(COMMAND_VIEWER, NUXT_ROOT_PATH, args);
    await addMicroserviceMetadatas(args.projectFolderPath, {
      type: "viewer",
      name: COMMAND_VIEWER,
      port,
    });

    return {
      statusCode: 200,
      port,
    };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});

// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";

// Local imports
import {
  addMicroserviceMetadatas,
  runViewer,
} from "@geode/opengeodeweb-front/app/utils/local/microservices.js";

export default defineEventHandler(async (event) => {
  try {
    const { COMMAND_VIEWER, NUXT_ROOT_PATH, args } = await readBody(event);
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

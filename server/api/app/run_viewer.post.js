// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  addMicroserviceMetadatas,
  runViewer,
} from "@geode/opengeodeweb-front/app/utils/local/microservices.js";

export default defineEventHandler(async (event) => {
  try {
    const { VIEWER_COMMAND, VIEWER_PATH, args } = await readBody(event);
    const port = await runViewer(VIEWER_COMMAND, VIEWER_PATH, args);
    await addMicroserviceMetadatas(args.projectFolderPath, {
      type: "viewer",
      name: VIEWER_COMMAND,
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

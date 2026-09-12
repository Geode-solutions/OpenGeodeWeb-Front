// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  addMicroserviceMetadatas,
  runViewer,
} from "@geode/opengeodeweb-front/server/utils/microservices.js";

interface RunViewerBody {
  COMMAND_VIEWER: string;
  NUXT_ROOT_PATH: string;
  args: { projectFolderPath: string; [key: string]: unknown };
}

export default defineEventHandler(async (event) => {
  try {
    const { COMMAND_VIEWER, NUXT_ROOT_PATH, args } = await readBody<RunViewerBody>(event);
    const port = await runViewer(COMMAND_VIEWER, NUXT_ROOT_PATH, args);
    await addMicroserviceMetadatas(args.projectFolderPath, {
      type: "viewer",
      name: COMMAND_VIEWER,
      // runViewer can exhaust its port-conflict retries and return undefined
      // (pre-existing bug: addMicroserviceMetadatas/URLs then embed "undefined").
      port: port as number,
    });

    return {
      statusCode: 200,
      port,
    };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message,
    });
  }
});

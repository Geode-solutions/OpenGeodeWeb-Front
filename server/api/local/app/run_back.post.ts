// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  addMicroserviceMetadatas,
  runBack,
} from "@geode/opengeodeweb-front/server/utils/microservices.js";

interface RunBackBody {
  COMMAND_BACK: string;
  NUXT_ROOT_PATH: string;
  args: { projectFolderPath: string; [key: string]: unknown };
}

export default defineEventHandler(async (event) => {
  try {
    const { COMMAND_BACK, NUXT_ROOT_PATH, args } = await readBody<RunBackBody>(event);
    const port = await runBack(COMMAND_BACK, NUXT_ROOT_PATH, args);
    await addMicroserviceMetadatas(args.projectFolderPath, {
      type: "back",
      name: COMMAND_BACK,
      // RunBack can exhaust its port-conflict retries and return undefined
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

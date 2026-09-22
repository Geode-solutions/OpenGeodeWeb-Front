// Node imports

// Third party imports
import { type H3Event, createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  addMicroserviceMetadatas,
  runBack,
} from "@geode/opengeodeweb-front/server/utils/microservices.ts";

interface RunBackBody {
  COMMAND_BACK: string;
  NUXT_ROOT_PATH: string;
  args: { projectFolderPath: string; [key: string]: unknown };
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { COMMAND_BACK, NUXT_ROOT_PATH, args } = await readBody<RunBackBody>(event);
    const port = await runBack(COMMAND_BACK, NUXT_ROOT_PATH, args);
    addMicroserviceMetadatas(args.projectFolderPath, {
      type: "back",
      name: COMMAND_BACK,
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
      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});

// Node imports

// Third party imports
import { type H3Event, createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  addMicroserviceMetadatas,
  runViewer,
} from "@geode/opengeodeweb-front/server/utils/microservices.ts";

interface RunViewerBody {
  COMMAND_VIEWER: string;
  NUXT_ROOT_PATH: string;
  args: { projectFolderPath: string; [key: string]: unknown };
}

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types
export default defineEventHandler(async (event: H3Event) => {
  try {
    const { COMMAND_VIEWER, NUXT_ROOT_PATH, args } = await readBody<RunViewerBody>(event);
    const port = await runViewer(COMMAND_VIEWER, NUXT_ROOT_PATH, args);
    addMicroserviceMetadatas(args.projectFolderPath, {
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
      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});

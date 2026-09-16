// Node imports

// Third party imports
import { type H3Event, createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  createPath,
  generateProjectFolderPath,
} from "@geode/opengeodeweb-front/server/utils/path.ts";

interface ProjectFolderPathBody {
  PROJECT: string;
}

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types
export default defineEventHandler(async (event: H3Event) => {
  try {
    const { PROJECT } = await readBody<ProjectFolderPathBody>(event);
    const projectFolderPath = generateProjectFolderPath(PROJECT);
    createPath(projectFolderPath);

    return {
      statusCode: 200,
      projectFolderPath,
    };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});

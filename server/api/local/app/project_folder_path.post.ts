// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { createPath, generateProjectFolderPath } from "@ogw_server/utils/path";

interface ProjectFolderPathBody {
  PROJECT: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { PROJECT } = await readBody<ProjectFolderPathBody>(event);
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
      statusMessage: (error as Error).message,
    });
  }
});

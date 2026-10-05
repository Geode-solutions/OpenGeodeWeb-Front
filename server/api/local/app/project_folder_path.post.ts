// Node imports

// Third party imports

// Local imports
import {
  createPath,
  generateProjectFolderPath,
} from "@geode/opengeodeweb-front/server/utils/path.ts";

import { defineTypedEventHandler } from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

export default defineTypedEventHandler(schemas.api.local.app.project_folder_path, ({ PROJECT }) => {
  const projectFolderPath = generateProjectFolderPath(PROJECT);
  createPath(projectFolderPath);
  return { statusCode: 200, projectFolderPath };
});

// Node imports

// Third party imports

// Local imports
import {
  addMicroserviceMetadatas,
  runViewer,
} from "@geode/opengeodeweb-front/server/utils/microservices.ts";

import { defineTypedEventHandler } from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

export default defineTypedEventHandler(
  schemas.api.local.app.run_viewer,
  async ({ COMMAND_VIEWER, NUXT_ROOT_PATH, args }) => {
    const port = await runViewer(COMMAND_VIEWER, NUXT_ROOT_PATH, args);
    addMicroserviceMetadatas(args.projectFolderPath, {
      type: "viewer",
      name: COMMAND_VIEWER,
      port,
    });
    return { statusCode: 200, port };
  },
);

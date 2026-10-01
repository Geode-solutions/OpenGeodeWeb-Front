// Node imports

// Third party imports

// Local imports
import {
  addMicroserviceMetadatas,
  runBack,
} from "@geode/opengeodeweb-front/server/utils/microservices.ts";

import { defineTypedEventHandler } from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

export default defineTypedEventHandler(
  schemas.api.local.app.run_back,
  async ({ COMMAND_BACK, NUXT_ROOT_PATH, args }) => {
    const port = await runBack(COMMAND_BACK, NUXT_ROOT_PATH, args);
    addMicroserviceMetadatas(args.projectFolderPath, {
      type: "back",
      name: COMMAND_BACK,
      port,
    });
    return { statusCode: 200, port };
  },
);

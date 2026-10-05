// Third party imports
import { consola } from "consola";
import { createError } from "h3";

// Local imports
import { setIsAppReady } from "@geode/opengeodeweb-front/server/utils/server_config.ts";

import { defineTypedEventHandler } from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

export default defineTypedEventHandler(
  schemas.api.microservice.app.set_is_app_ready,
  ({ isReady }) => {
    if (!isReady) {
      throw createError({ statusCode: 400, statusMessage: "isReady is required" });
    }
    setIsAppReady(isReady);
    consola.info(`Updated IS_APP_READY to ${isReady}`);
    return { statusCode: 200, isReady };
  },
);

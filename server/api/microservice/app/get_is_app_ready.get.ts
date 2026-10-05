// Third party imports
import { consola } from "consola";

// Local imports
import { getIsAppReady } from "@geode/opengeodeweb-front/server/utils/server_config.ts";

import { defineTypedEventHandler } from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

export default defineTypedEventHandler(schemas.api.microservice.app.get_is_app_ready, () => {
  const isReady = getIsAppReady();
  consola.info(`IS_APP_READY is ${isReady}`);
  return { statusCode: 200, isReady };
});

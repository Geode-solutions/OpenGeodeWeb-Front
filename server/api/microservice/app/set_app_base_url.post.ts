// Third party imports
import { consola } from "consola";
import { createError } from "h3";

// Local imports
import { setAppBaseUrl } from "@geode/opengeodeweb-front/server/utils/server_config.ts";

import { defineTypedEventHandler } from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

export default defineTypedEventHandler(
  schemas.api.microservice.app.set_app_base_url,
  ({ baseUrl }) => {
    if (!baseUrl) {
      throw createError({ statusCode: 400, statusMessage: "baseUrl is required" });
    }
    setAppBaseUrl(baseUrl);
    consola.info(`Updated APP_BASE_URL to ${baseUrl}`);
    return { statusCode: 200, baseUrl };
  },
);

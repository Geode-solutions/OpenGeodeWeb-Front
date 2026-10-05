// Third party imports
import { createError } from "h3";

// Local imports
import { setBackBaseUrl } from "@geode/opengeodeweb-front/server/utils/server_config.ts";

import { defineTypedEventHandler } from "@geode/opengeodeweb-front/server/utils/typed_handler.ts";
import schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

export default defineTypedEventHandler(
  schemas.api.microservice.app.set_back_base_url,
  ({ baseUrl }) => {
    if (!baseUrl) {
      throw createError({ statusCode: 400, statusMessage: "baseUrl is required" });
    }
    setBackBaseUrl(baseUrl);
    return { statusCode: 200, baseUrl };
  },
);

// Third party imports
import { createError, defineEventHandler } from "h3";
import { consola } from "consola";

// Local imports
import { getIsAppReady } from "@geode/opengeodeweb-front/server/utils/server_config.ts";

export default defineEventHandler(() => {
  try {
    const isReady = getIsAppReady();
    consola.info(`IS_APP_READY is ${isReady}`);
    return { statusCode: 200, isReady };
  } catch (error) {
    consola.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});

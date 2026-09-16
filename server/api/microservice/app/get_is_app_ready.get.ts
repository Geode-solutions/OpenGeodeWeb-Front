// Third party imports
import { createError, defineEventHandler } from "h3";

// Local imports
import { getIsAppReady } from "@geode/opengeodeweb-front/server/utils/server_config.ts";

export default defineEventHandler(() => {
  try {
    const isReady = getIsAppReady();
    console.log(`IS_APP_READY is ${isReady}`);
    return { statusCode: 200, isReady };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});

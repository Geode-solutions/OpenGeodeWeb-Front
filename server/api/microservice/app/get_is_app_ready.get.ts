// Third party imports
import { createError, defineEventHandler } from "h3";

// Local imports
import { getIsAppReady } from "@geode/opengeodeweb-front/server/utils/server_config.js";

export default defineEventHandler(async () => {
  try {
    const isReady = await getIsAppReady();
    console.log(`IS_APP_READY is ${isReady}`);
    return { statusCode: 200, isReady };
  } catch (error) {
    console.log(error);
    const err = error as { statusCode?: number; statusMessage?: string; message?: string };
    throw createError({
      statusCode: err.statusCode,
      statusMessage: err.statusMessage ?? err.message,
    });
  }
});

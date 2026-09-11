// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { setIsAppReady } from "@geode/opengeodeweb-front/server/utils/server_config.js";

export default defineEventHandler(async (event) => {
  try {
    const { isReady } = await readBody(event);
    if (!isReady) {
      throw createError({ statusCode: 400, statusMessage: "isReady is required" });
    }

    await setIsAppReady(isReady);
    console.log(`Updated IS_APP_READY to ${isReady}`);

    return { statusCode: 200, isReady };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: error.statusCode,
      statusMessage: error.statusMessage ?? error.message,
    });
  }
});

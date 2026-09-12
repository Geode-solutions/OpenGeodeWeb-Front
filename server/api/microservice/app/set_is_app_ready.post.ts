// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { setIsAppReady } from "@geode/opengeodeweb-front/server/utils/server_config.js";

interface SetIsAppReadyBody {
  isReady: boolean;
}

export default defineEventHandler(async (event) => {
  try {
    const { isReady } = await readBody<SetIsAppReadyBody>(event);
    if (!isReady) {
      throw createError({ statusCode: 400, statusMessage: "isReady is required" });
    }

    await setIsAppReady(isReady);
    console.log(`Updated IS_APP_READY to ${isReady}`);

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

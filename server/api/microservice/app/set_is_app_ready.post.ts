// Third party imports
import { type H3Event, createError, defineEventHandler, readBody } from "h3";
import { consola } from "consola";

// Local imports
import { setIsAppReady } from "@geode/opengeodeweb-front/server/utils/server_config.ts";

interface SetIsAppReadyBody {
  isReady: boolean;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { isReady } = await readBody<SetIsAppReadyBody>(event);
    if (!isReady) {
      throw createError({ statusCode: 400, statusMessage: "isReady is required" });
    }

    setIsAppReady(isReady);
    consola.info(`Updated IS_APP_READY to ${isReady}`);

    return { statusCode: 200, isReady };
  } catch (error) {
    consola.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});

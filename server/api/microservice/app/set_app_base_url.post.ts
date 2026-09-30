// Third party imports
import { type H3Event, createError, defineEventHandler, readBody } from "h3";
import { consola } from "consola";

// Local imports
import { setAppBaseUrl } from "@geode/opengeodeweb-front/server/utils/server_config.ts";

interface SetAppBaseUrlBody {
  baseUrl: string;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { baseUrl } = await readBody<SetAppBaseUrlBody>(event);
    if (!baseUrl) {
      throw createError({ statusCode: 400, statusMessage: "baseUrl is required" });
    }

    setAppBaseUrl(baseUrl);
    consola.info(`Updated APP_BASE_URL to ${baseUrl}`);

    return { statusCode: 200, baseUrl };
  } catch (error) {
    consola.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});

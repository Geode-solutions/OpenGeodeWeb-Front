// Third party imports
import { type H3Event, createError, defineEventHandler, readBody } from "h3";

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
    console.log(`Updated APP_BASE_URL to ${baseUrl}`);

    return { statusCode: 200, baseUrl };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { setAppBaseUrl } from "@geode/opengeodeweb-front/server/utils/server_config.js";

interface SetAppBaseUrlBody {
  baseUrl: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { baseUrl } = await readBody<SetAppBaseUrlBody>(event);
    if (!baseUrl) {
      throw createError({ statusCode: 400, statusMessage: "baseUrl is required" });
    }

    await setAppBaseUrl(baseUrl);
    console.log(`Updated APP_BASE_URL to ${baseUrl}`);

    return { statusCode: 200, baseUrl };
  } catch (error) {
    console.log(error);
    const err = error as { statusCode?: number; statusMessage?: string; message?: string };
    throw createError({
      statusCode: err.statusCode,
      statusMessage: err.statusMessage ?? err.message,
    });
  }
});

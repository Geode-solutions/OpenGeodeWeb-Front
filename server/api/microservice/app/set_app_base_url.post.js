// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { setAppBaseUrl } from "@geode/opengeodeweb-front/server/utils/server_config.js";

export default defineEventHandler(async (event) => {
  try {
    const { baseUrl } = await readBody(event);
    if (!baseUrl) {
      throw createError({ statusCode: 400, statusMessage: "baseUrl is required" });
    }

    await setAppBaseUrl(baseUrl);
    console.log(`Updated APP_BASE_URL to ${baseUrl}`);

    return { statusCode: 200, baseUrl };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: error.statusCode,
      statusMessage: error.statusMessage ?? error.message,
    });
  }
});

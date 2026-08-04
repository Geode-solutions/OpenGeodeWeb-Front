// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import {
  getAppBaseUrl,
  getBackBaseUrl,
  setBackBaseUrl,
} from "@geode/opengeodeweb-front/server/utils/server_config.js";

export default defineEventHandler(async (event) => {
  try {
    const { baseUrl } = await readBody(event);
    console.log(`Updating BACK_BASE_URL to ${baseUrl}`);
    if (!baseUrl) {
      throw createError({ statusCode: 400, statusMessage: "baseUrl is required" });
    }
    const appBaseUrl = await getAppBaseUrl();
    await setBackBaseUrl(appBaseUrl, baseUrl);
    console.log(`Updated BACK_BASE_URL to ${getBackBaseUrl()}`);
    return { statusCode: 200, baseUrl };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: error.statusCode,
      statusMessage: error.message,
    });
  }
});

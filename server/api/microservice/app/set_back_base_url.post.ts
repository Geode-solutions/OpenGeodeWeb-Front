// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { setBackBaseUrl } from "@geode/opengeodeweb-front/server/utils/server_config.js";

interface SetBackBaseUrlBody {
  baseUrl: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { baseUrl } = await readBody<SetBackBaseUrlBody>(event);
    if (!baseUrl) {
      throw createError({ statusCode: 400, statusMessage: "baseUrl is required" });
    }
    await setBackBaseUrl(baseUrl);
    return { statusCode: 200, baseUrl };
  } catch (error) {
    console.log(error);
    const err = error as { statusCode?: number; message?: string };
    throw createError({
      statusCode: err.statusCode,
      statusMessage: err.message,
    });
  }
});

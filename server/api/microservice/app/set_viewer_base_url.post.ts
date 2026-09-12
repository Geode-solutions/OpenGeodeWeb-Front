// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { setViewerBaseUrl } from "@geode/opengeodeweb-front/server/utils/server_config.js";

interface SetViewerBaseUrlBody {
  baseUrl: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { baseUrl } = await readBody<SetViewerBaseUrlBody>(event);
    if (!baseUrl) {
      throw createError({ statusCode: 400, statusMessage: "baseUrl is required" });
    }
    await setViewerBaseUrl(baseUrl);
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

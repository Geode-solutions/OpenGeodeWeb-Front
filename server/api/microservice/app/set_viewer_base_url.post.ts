// Third party imports
import { type H3Event, createError, defineEventHandler, readBody } from "h3";

// Local imports
import { setViewerBaseUrl } from "@geode/opengeodeweb-front/server/utils/server_config.ts";

interface SetViewerBaseUrlBody {
  baseUrl: string;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { baseUrl } = await readBody<SetViewerBaseUrlBody>(event);
    if (!baseUrl) {
      throw createError({ statusCode: 400, statusMessage: "baseUrl is required" });
    }
    setViewerBaseUrl(baseUrl);
    return { statusCode: 200, baseUrl };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});

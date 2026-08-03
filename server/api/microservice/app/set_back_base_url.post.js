// Third party imports
import { createError, defineEventHandler, readBody } from "h3";

// Local imports
import { setBackBaseUrl } from "@ogw_shared/utils/server_config.js";

export default defineEventHandler(async (event) => {
  try {
    const { baseUrl } = await readBody(event);
    if (!baseUrl) {
      throw createError({ statusCode: 400, statusMessage: "baseUrl is required" });
    }
    await setBackBaseUrl(baseUrl);
    return { statusCode: 200, baseUrl };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: error.statusCode,
      statusMessage: error.message,
    });
  }
});

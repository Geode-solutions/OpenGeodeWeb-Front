// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"

// Local imports
import { runViewerWrapper } from "@geode/opengeodeweb-front/app/utils/local/microservices.js"

export default defineEventHandler(async (event) => {
  try {
    const { VIEWER_PATH, VIEWER_COMMAND, args } = await readBody(event)
    const port = await runViewerWrapper({ VIEWER_PATH, VIEWER_COMMAND, args })

    return {
      statusCode: 200,
      port,
    }
  } catch (error) {
    console.log(error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})

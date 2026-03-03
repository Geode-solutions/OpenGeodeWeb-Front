// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"

// Local imports
import { runBackWrapper } from "@geode/opengeodeweb-front/app/utils/local/microservices.js"

export default defineEventHandler(async (event) => {
  try {
    console.log("[SERVER] runBack", { event })

    const { BACK_PATH, BACK_COMMAND, args } = await readBody(event)
    console.log("[SERVER] runBack", { BACK_PATH, BACK_COMMAND, args })
    const port = await runBackWrapper({ BACK_PATH, BACK_COMMAND, args })

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

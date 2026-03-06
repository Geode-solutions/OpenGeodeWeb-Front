// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"

// Local imports
import { runBack } from "@geode/opengeodeweb-front/app/utils/local/microservices.js"

export default defineEventHandler(async (event) => {
  try {
    const { BACK_COMMAND, BACK_PATH, args } = await readBody(event)
    const port = await runBack(BACK_COMMAND, BACK_PATH, args)

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

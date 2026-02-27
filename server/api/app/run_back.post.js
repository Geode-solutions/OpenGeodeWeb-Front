// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"

// Local imports
import {
  executable_name,
  executable_path,
  run_back,
} from "@geode/opengeodeweb-front/app/utils/local.js"

export default defineEventHandler(async (event) => {
  try {
    const { BACK_PATH, BACK_COMMAND, args } = await readBody(event)
    const backPath = await executable_path(BACK_PATH)
    const backCommand = executable_name(BACK_COMMAND)

    const port = await run_back(backCommand, backPath, args)
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

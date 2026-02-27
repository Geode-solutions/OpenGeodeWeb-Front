// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"

// Local imports
import {
  executable_name,
  executable_path,
  run_viewer,
} from "@geode/opengeodeweb-front/app/utils/local.js"

export default defineEventHandler(async (event) => {
  try {
    const { VIEWER_PATH, VIEWER_COMMAND, args } = await readBody(event)
    const viewerPath = await executable_path(VIEWER_PATH)
    const viewerCommand = executable_name(VIEWER_COMMAND)
    const port = await run_viewer(viewerCommand, viewerPath, args)

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

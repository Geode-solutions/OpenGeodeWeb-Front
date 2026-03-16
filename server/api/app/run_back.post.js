// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"

// Local imports
import {
  addMicroserviceMetadatas,
  runBack,
} from "@geode/opengeodeweb-front/app/utils/local/microservices.js"

export default defineEventHandler(async (event) => {
  try {
    const { COMMAND_BACK, args } = await readBody(event)
    const port = await runBack(COMMAND_BACK, args)
    await addMicroserviceMetadatas(args.projectFolderPath, {
      type: "back",
      name: COMMAND_BACK,
      port,
    })

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

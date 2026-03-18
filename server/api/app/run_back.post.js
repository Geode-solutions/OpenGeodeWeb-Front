// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"

// Local imports
import {
  addMicroserviceMetadatas,
  runBack,
} from "@geode/opengeodeweb-front/app/utils/local/microservices.js"

import { useRuntimeConfig } from "nitropack/runtime"

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event).public
    const { COMMAND_BACK, NUXT_ROOT_PATH } = config
    const { args } = await readBody(event)
    const port = await runBack(COMMAND_BACK, NUXT_ROOT_PATH, args)
    await addMicroserviceMetadatas(args.projectFolderPath, {
      type: "back",
      name: execName,
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

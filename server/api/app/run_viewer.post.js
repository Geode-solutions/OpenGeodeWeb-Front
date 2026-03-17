// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"

// Local imports
import {
  addMicroserviceMetadatas,
  runViewer,
} from "@geode/opengeodeweb-front/app/utils/local/microservices.js"

export default defineEventHandler(async (event) => {
  try {
    const { execName, execPath, args } = await readBody(event)
    const port = await runViewer(execName, execPath, args)
    await addMicroserviceMetadatas(args.projectFolderPath, {
      type: "viewer",
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

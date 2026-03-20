// Node imports

// Third party imports
import { createError, defineEventHandler } from "h3"
import { useRuntimeConfig } from "nitropack/runtime"

// Local imports
import {
  createPath,
  generateProjectFolderPath,
} from "@geode/opengeodeweb-front/app/utils/local/path.js"

export default defineEventHandler(async (event) => {
  try {
    console.log("1")
    const config = useRuntimeConfig(event).public
    console.log("2", { config })
    const { PROJECT } = config
    console.log("3", { PROJECT })
    const projectFolderPath = generateProjectFolderPath(PROJECT)
    console.log("4", { projectFolderPath })
    await createPath(projectFolderPath)
    console.log("5")

    return {
      statusCode: 200,
      projectFolderPath,
    }
  } catch (error) {
    console.log(error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})

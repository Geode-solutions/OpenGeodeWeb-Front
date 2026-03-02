// Node imports
import path from "node:path"
import os from "node:os"

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"
import { v4 as uuidv4 } from "uuid"

// Local imports
import { create_path } from "@geode/opengeodeweb-front/app/utils/local.js"

export default defineEventHandler(async (event) => {
  try {
    const { PROJECT } = await readBody(event)
    const projectFolderPath = await create_path(
      path.join(os.tmpdir(), PROJECT, uuidv4()),
    )

    console.log("createProject", { projectFolderPath })

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

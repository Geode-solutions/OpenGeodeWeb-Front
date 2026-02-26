// Node imports
import path from "node:path"
import os from "node:os"

// Third party imports
import { defineEventHandler } from "h3"
import { v4 as uuidv4 } from "uuid"

// Local imports
import { create_path } from "@geode/opengeodeweb-front/app/utils/local.js"

export default defineEventHandler(async (event) => {
  const projectFolderPath = create_path(
    path.join(os.tmpdir(), "vease", uuidv4()),
  )

  return {
    statusCode: 200,
  }
})

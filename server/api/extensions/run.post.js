// Node imports
import fs from "node:fs"
import path from "node:path"

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"
import _ from "lodash"

// Local imports
import { extensionsConf } from "../../../app/utils/config.js"
import { unzipFile } from "../../../app/utils/server.js"
import { runBack } from "../../../app/utils/local/microservices.js"

const CODE_200 = 200

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { projectFolderPath, projectName } = body
    const extensionsConfig = extensionsConf(projectName)

    const extensionsArray = []

    for (const extensionID of Object.keys(extensionsConfig)) {
      const extensionPath = extensionsConfig[extensionID].path
      const unzippedExtensionPath = await unzipFile(
        extensionPath,
        path.join(projectFolderPath, "extensions"),
      )
      const metadataPath = path.join(unzippedExtensionPath, "metadata.json")
      const metadataContent = await fs.promises.readFile(metadataPath, "utf-8")

      if (!metadataContent) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid extension file: missing metadata.json",
        })
      }
      const metadata = JSON.parse(metadataContent)
      console.log("runExtensions", { metadata })

      const { id, name, version, backendExecutable, frontendFile } = metadata
      console.log("runExtensions", { id, name, version, backendExecutable })

      if (!frontendFile) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid extension file: missing frontend JavaScript",
        })
      }
      if (!backendExecutable) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid extension file: missing backend executable",
        })
      }

      const frontendFilePath = path.join(unzippedExtensionPath, frontendFile)
      const frontendContent = await fs.promises.readFile(
        frontendFilePath,
        "utf-8",
      )
      const backendExecutablePath = path.join(
        unzippedExtensionPath,
        backendExecutable,
      )
      await fs.chmodSync(backendExecutablePath, "755")
      const port = await runBack(backendExecutable, backendExecutablePath, {
        projectFolderPath,
      })
      extensionsArray.push({
        id,
        name,
        version,
        frontendContent,
        port,
      })
    }

    return {
      statusCode: CODE_200,
      extensionsArray,
    }
  } catch (error) {
    console.error("Error running extensions:", error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})

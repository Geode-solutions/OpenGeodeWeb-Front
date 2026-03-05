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

const extensionProcesses = new Map()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const projectName = "vease"
    const { projectFolderPath } = body
    console.log("runExtensions", { projectName, projectFolderPath })
    const extensionsConfig = extensionsConf(projectName)
    console.log("runExtensions", { extensionsConfig })

    const extensionsArray = []
    console.log("runExtensions", { extensionsArray })

    for (const extensionID of Object.keys(extensionsConfig)) {
      console.log("runExtensions", { extensionID })
      const extensionPath = extensionsConfig[extensionID].path
      console.log("runExtensions", { extensionPath })

      const unzippedExtensionPath = await unzipFile(
        extensionPath,
        path.join(projectFolderPath, "extensions"),
      )
      console.log("runExtensions", { unzippedExtensionPath })
      const metadataPath = path.join(unzippedExtensionPath, "metadata.json")
      console.log("runExtensions", { metadataPath })
      const metadataContent = await fs.promises.readFile(metadataPath, "utf-8")
      console.log("runExtensions", { metadataContent })

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
      console.log("runExtensions after runBack", { port })
      extensionProcesses.set(name, { port })
      extensionsArray.push({
        id,
        name,
        version,
        frontendContent,
        backendPort: port,
      })
    }

    console.log("runExtensions before RETURN", { extensionsArray })
    return {
      statusCode: CODE_200,
      extensionsArray,
      extensionProcesses,
    }
  } catch (error) {
    console.error("[s] Error running extensions:", error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})

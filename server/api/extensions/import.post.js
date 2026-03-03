// Node imports
import fs from "node:fs"
import path from "node:path"

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"
import _ from "lodash"
import { getPort } from "get-port-please"

// Local imports
import { extensionsConf } from "../../../app/utils/config.js"
import { unzipFile } from "../../../app/utils/server.js"

const CODE_200 = 200
const MIN_PORT = 5001
const MAX_PORT = 5999

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const projectName = "vease"
    const { projectFolderPath } = body
    console.log("runExtensions", { projectName, projectFolderPath })
    const extensionsConfig = extensionsConf(projectName)
    console.log("runExtensions", { extensionsConfig })

    for (const archivePath of extensionsConfig) {
      console.log("runExtensions", { archivePath })

      const unzippedExtensionPath = await unzipFile(
        archivePath,
        projectFolderPath,
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
      const { id, name, version, backendExecutable, frontendFile } = metadata

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

      const port = await getPort({ portRange: [MIN_PORT, MAX_PORT] })
      console.log(`Extension ${name} will use port ${port}`)
      extensionProcesses.set(name, { process, port })

      process.on("error", (error) => {
        console.error(`[${name}] Process error:`, error)
      })

      process.on("exit", (code) => {
        console.log(`[${name}] Process exited with code ${code}`)
        extensionProcesses.delete(name)
      })
    }
    return {
      statusCode: CODE_200,
      extension_metadata: { id, name, version },
      frontendContent,
      backendPort: port,
    }
  } catch (error) {
    console.error("[Extensions] Error running extensions:", error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})

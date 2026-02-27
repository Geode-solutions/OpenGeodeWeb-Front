// Node imports
import fs from "node:fs"
import path from "node:path"

// Third party imports
import { defineEventHandler, readBody } from "h3"
import _ from "lodash"
import { getPort } from "get-port-please"

// Local imports
import { extensionsConf } from "../../../../app/utils/config.js"
import { unzipFile } from "../../../../app/utils/server.js"
// import { useRuntimeConfig } from "#imports"

const CODE_200 = 200
const MIN_PORT = 5001
const MAX_PORT = 5999

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const projectName = "vease"
  const { projectFolderPath } = body
  console.log("runExtensions", { projectName, projectFolderPath })
  const extensionsConfig = extensionsConf(projectName)
  console.log("runExtensions", { extensionsConfig })

  if (_.isEqual(extensionsConfig, [])) {
    return Promise.resolve()
  }

  for (const archivePath of extensionsConfig) {
    console.log("runExtensions", { archivePath })

    const unzippedExtensionPath = await unzipFile(
      archivePath,
      projectFolderPath,
    )

    // Read and validate metadata.json
    const metadataPath = path.join(unzippedExtensionPath, "metadata.json")
    let metadata
    try {
      const metadataContent = await fs.promises.readFile(metadataPath, "utf-8")
      metadata = JSON.parse(metadataContent)
    } catch (error) {
      throw new Error("Invalid .vext file: missing metadata.json")
    }

    const { name, version, backendExecutable, frontendFile } = metadata

    if (!frontendFile) {
      throw new Error("Invalid .vext file: missing frontend JavaScript")
    }
    if (!backendExecutable) {
      throw new Error("Invalid .vext file: missing backend executable")
    }
    const frontendFilePath = path.join(unzippedExtensionPath, frontendFile)
    const frontendContent = await fs.promises.readFile(
      frontendFilePath,
      "utf-8",
    )

    try {
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

      const test = {
        success: true,
        extension_metadata: { name, version },
        frontendContent,
        backendPort: port,
      }
      console.log("[Extensions] test return :", { test })
      return test
    } catch (error) {
      console.error(`[Extensions] Failed to launch extension ${name}:`, error)
      return { success: false, error: error.message }
    }
  }

  return { statusCode: CODE_200 }
})

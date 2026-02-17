// Node.js imports
import fs from "node:fs"
import path from "node:path"

// Third party imports
import Conf from "conf"
import { getPort } from "get-port-please"
import _ from "lodash"

// Local imports
import { unzipFile } from "./local.js"

const projectConfigSchema = {
  properties: {
    projectName: {
      type: "string",
      minLength: 1,
    },
  },
  additionalProperties: false,
  required: ["projectName"],
}

const MIN_PORT = 5001
const MAX_PORT = 5999
const KILL_TIMEOUT = 2000

const extensionProcesses = new Map()

function projectConf(projectName) {
  const projectConfig = new Conf({ projectName })
  // schema: projectConfigSchema
  console.log(projectConf.name, { projectConfig })
  return projectConfig
}

function extensionsConf(projectConfig) {
  const extensionsConfig = projectConfig.get("extensions")
  if (_.isEqual(extensionsConfig, {})) {
    projectConfig.set("extensions", {})
  }
  return extensionsConfig
}

async function runExtensions(projectName, projectFolderPath) {
  const projectConfig = projectConf(projectName)
  console.log(runExtensions.name, { projectConfig })
  const extensionsConfig = extensionsConf(projectConfig)
  console.log(runExtensions.name, { extensionsConfig })

  if (_.isEqual(extensionsConfig, {})) {
    return Promise.resolve()
  }
  console.log("Found extensions config for project:", projectName)
  const promiseArray = []

  for (const extensionId of Object.keys(extensionsConfig)) {
    const { archivePath } = extensionsConfig[extensionId]
    console.log(runExtensions.name, { archivePath })

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

    // Look for backend executable and frontend JS
    let backendExecutable = null
    let frontendFile = null

    const files = await fs.promises.readdir(unzippedExtensionPath)

    for (const file of files) {
      const filePath = path.join(unzippedExtensionPath, file)
      const stats = await fs.promises.stat(filePath)

      if (stats.isFile()) {
        if (file.endsWith(".es.js")) {
          frontendFile = filePath
        } else if (!file.endsWith(".js") && !file.endsWith(".css")) {
          backendExecutable = filePath
          // Make executable (Unix-like systems)
          await fs.promises.chmod(backendExecutable, 0o755)
        }
      }
    }

    // Validate required files
    if (!frontendFile) {
      throw new Error("Invalid .vext file: missing frontend JavaScript")
    }
    if (!backendExecutable) {
      throw new Error("Invalid .vext file: missing backend executable")
    }

    // Read frontend content
    const frontendContent = await fs.promises.readFile(frontendFile, "utf-8")

    try {
      const port = await getPort({ portRange: [MIN_PORT, MAX_PORT] })
      console.log(`[Electron] Extension ${extensionId} will use port ${port}`)
      extensionProcesses.set(extensionId, { process, port })

      process.on("error", (error) => {
        console.error(`[${extensionId}] Process error:`, error)
      })

      process.on("exit", (code) => {
        console.log(`[${extensionId}] Process exited with code ${code}`)
        extensionProcesses.delete(extensionId)
      })

      const test = {
        extension_metadata: {
          name: metadata.name,
          version: metadata.version,
        },
        frontend_content: frontendContent,
        backend_path: backendExecutable,
      }
      console.log("[Extensions] test return :", { test })
      return { success: true, port }
    } catch (error) {
      console.error(
        `[Extensions] Failed to launch extension ${extensionId}:`,
        error,
      )
      return { success: false, error: error.message }
    }
  }
}

function killExtensionMicroservices() {
  return [...extensionProcesses.values()].map(async ({ process, _port }) => {
    if (process && !process.killed) {
      process.kill()
      try {
        // Wait for exit or timeout
        await Promise.race([once(process, "exit"), setTimeout(KILL_TIMEOUT)])
      } catch {
        // Ignore errors during kill wait
      }
    }
  })
}

export {
  projectConf,
  extensionsConf,
  runExtensions,
  killExtensionMicroservices,
}

// Node.js imports

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

async function runExtensions(projectName) {
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

    await unzipFile(archivePath)

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

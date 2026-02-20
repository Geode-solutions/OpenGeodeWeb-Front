// Node.js imports
import fs from "node:fs"
import path from "node:path"

// Third party imports
import { getPort } from "get-port-please"
import _ from "lodash"

// Local imports
import { unzipFile } from "./local.js"
import { projectConf, extensionsConf } from "./config"

async function uploadExtension(
  archiveFileContent,
  archiveFilename,
  projectName,
) {
  const projectConfig = projectConf(projectName)
  const extensionsConfig = extensionsConf(projectConfig)
  const configFolderPath = path.dirname(projectConfig.path)
  const outputPath = path.join(configFolderPath, archiveFilename)

  await fs.promises.writeFile(outputPath, archiveFileContent)

  extensionsConfig.push(outputPath)
  projectConfig.set("extensions", extensionsConfig)
}

async function runExtensions(projectName, projectFolderPath) {
  const projectConfig = projectConf(projectName)
  console.log("runExtensions", { projectConfig })
  const extensionsConfig = extensionsConf(projectConfig)
  console.log("runExtensions", { extensionsConfig })

  if (_.isEqual(extensionsConfig, {})) {
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
  uploadExtension,
  runExtensions,
  killExtensionMicroservices,
}

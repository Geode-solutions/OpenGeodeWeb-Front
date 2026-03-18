// Node imports
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

// Third party imports
import { v4 as uuidv4 } from "uuid"

// Local imports
import { appMode, getAppMode } from "@ogw_front/utils/app_mode"

async function executablePath(microservicePath) {
  console.log("[executablePath] microservicePath", microservicePath)
  if (getAppMode() === appMode.DESKTOP) {
    const electron = await import("electron")
    console.log(
      "[executablePath] electron.app.isPackaged",
      electron.app.isPackaged,
    )
    if (electron.app.isPackaged) {
      return process.resourcesPath
    }
  }
  return microservicePath
}

function executableName(name) {
  if (process.platform === "win32") {
    return `${name}.exe`
  }
  return name
}

function createPath(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`${dirPath} directory created successfully!`)
  }
  return dirPath
}

function generateProjectFolderPath(projectName) {
  return path.join(os.tmpdir(), projectName.replace(/\//g, "_"), uuidv4())
}

export { createPath, executablePath, executableName, generateProjectFolderPath }

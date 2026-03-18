// Node imports
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { setTimeout } from "node:timers/promises"

// Third party imports
import { rimraf } from "rimraf"
import { v4 as uuidv4 } from "uuid"

// Local imports
import {
  appMode,
  getAppMode,
} from "@geode/opengeodeweb-front/app/utils/app_mode.js"

const MAX_DELETE_FOLDER_RETRIES = 5

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

async function deleteFolderRecursive(folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.log(`Folder ${folderPath} does not exist.`)
    return
  }
  for (let i = 0; i <= MAX_DELETE_FOLDER_RETRIES; i += 1) {
    try {
      console.log(`Deleting folder: ${folderPath}`)
      // oxlint-disable-next-line no-await-in-loop
      await rimraf(folderPath)
      console.log(`Deleted folder: ${folderPath}`)
      return
    } catch (error) {
      console.error(`Error deleting folder ${folderPath}:`, error)
      // Wait before retrying
      const MILLISECONDS_PER_RETRY = 1000
      const DELAY = MILLISECONDS_PER_RETRY * (i + 1)
      // oxlint-disable-next-line no-await-in-loop
      await setTimeout(DELAY)
      console.log("Retrying delete folder")
    }
  }
}
export {
  createPath,
  executablePath,
  executableName,
  deleteFolderRecursive,
  generateProjectFolderPath,
}

// Node imports
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { setTimeout } from "timers/promises"

// Third party imports
import isElectron from "is-electron"
import { rimraf } from "rimraf"
import { v4 as uuidv4 } from "uuid"

const MAX_DELETE_FOLDER_RETRIES = 5

function venvScriptPath(microservicePath) {
  const venvPath = path.join(microservicePath, "venv")
  let scriptPath = ""
  if (process.platform === "win32") {
    scriptPath = path.join(venvPath, "Scripts")
  } else {
    scriptPath = path.join(venvPath, "bin")
  }
  return scriptPath
}

async function executablePath(microservicePath) {
  if (isElectron()) {
    const electron = await import("electron")
    if (electron.app.isPackaged) {
      return process.resourcesPath
    } else {
      return venvScriptPath(microservicePath)
    }
  } else {
    return venvScriptPath(microservicePath)
  }
}

function executableName(name) {
  if (process.platform === "win32") {
    return `${name}.exe`
  }
  return name
}

function createPath(pathToCreate) {
  if (!fs.existsSync(pathToCreate)) {
    fs.mkdirSync(pathToCreate, { recursive: true })
    console.log(`${pathToCreate} directory created successfully!`)
  }
  return pathToCreate
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
      await rimraf(folderPath)
      console.log(`Deleted folder: ${folderPath}`)
      return
    } catch (error) {
      console.error(`Error deleting folder ${folderPath}:`, error)
      // Wait before retrying
      const DELAY = 1000 * (i + 1)
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

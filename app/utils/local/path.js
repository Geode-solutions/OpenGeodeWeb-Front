// Node imports
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

// Third party imports
import { v4 as uuidv4 } from "uuid"

// Local imports
import { appMode } from "./app_mode.js"

function executablePath(microservicePath) {
  console.log("[executablePath]", { microservicePath }, process.env.NODE_ENV)
  if (
    useRuntimeConfig().public.MODE === appMode.DESKTOP &&
    process.env.NODE_ENV === "production"
  ) {
    return process.resourcesPath
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

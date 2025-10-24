// Node.js imports
import fs from "fs"
import path from "path"

function getCurrentFolders(dataFolderPath) {
  if (!fs.existsSync(dataFolderPath)) {
    return new Set()
  }
  const entries = fs.readdirSync(dataFolderPath)
  const folders = new Set()
  for (const entry of entries) {
    const entryPath = path.join(dataFolderPath, entry)
    if (fs.statSync(entryPath).isDirectory()) {
      folders.add(entry)
    }
  }
  return folders
}

function cleanupCreatedFolders(dataFolderPath, foldersBeforeTests) {
  if (!fs.existsSync(dataFolderPath)) {
    return
  }
  const currentFolders = getCurrentFolders(dataFolderPath)
  console.log("getCurrentFolders currentFolders", currentFolders)
  for (const folder of currentFolders) {
    if (!foldersBeforeTests.has(folder)) {
      const folderPath = path.join(dataFolderPath, folder)
      fs.rmSync(folderPath, { recursive: true, force: true })
      console.log(`Deleted folder: ${folderPath}`)
    }
  }
}

export { getCurrentFolders, cleanupCreatedFolders }

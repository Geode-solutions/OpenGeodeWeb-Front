// Node.js imports
import path from "node:path"

// Third party imports
import Conf from "conf"
import _ from "lodash"

// Local imports

function projectConf(projectName) {
  console.log("projectConf", { projectName })
  const projectConfig = new Conf({ projectName })
  console.log(projectConf.name, { projectConfig })
  return projectConfig
}

function confFolderPath(projectName) {
  console.log("confFolderPath", { projectName })
  const projectConfig = projectConf(projectName)
  console.log("confFolderPath", { projectConfig })
  return path.dirname(projectConfig.path)
}

function extensionsConf(projectName) {
  console.log("extensionsConf", { projectName })
  const projectConfig = projectConf(projectName)
  if (!projectConfig.has("extensions")) {
    projectConfig.set("extensions", [])
  }

  const extensionsConfig = projectConfig.get("extensions")
  console.log("extensionsConf", { extensionsConfig })
  return { extensionsConfig, path: extensionsConfig }
}

function addExtensionToConf(projectName, extensionPath) {
  const projectConfig = projectConf(projectName)
  const { extensionsConfig } = extensionsConf(projectName)
  extensionsConfig.push(extensionPath)
  projectConfig.set("extensions", extensionsConfig)
}

export { confFolderPath, projectConf, extensionsConf, addExtensionToConf }

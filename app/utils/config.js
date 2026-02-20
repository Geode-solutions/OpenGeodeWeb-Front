// Node.js imports

// Third party imports
import Conf from "conf"
import _ from "lodash"

// Local imports

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

const extensionProcesses = new Map()

function projectConf(projectName) {
  const projectConfig = new Conf({ projectName })
  // schema: projectConfigSchema
  console.log(projectConf.name, { projectConfig })
  return projectConfig
}

function extensionsConf(projectConfig) {
  const extensionsConfig = projectConfig.get("extensions")
  console.log(extensionsConf.name, { extensionsConfig })
  if (_.isEqual(extensionsConfig, undefined)) {
    projectConfig.set("extensions", [])
  }
  return extensionsConfig
}

export { projectConf, extensionsConf, extensionProcesses }

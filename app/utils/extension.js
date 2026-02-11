// Node.js imports

// Third party imports
import Conf from "conf"

const projectConfigSchema = {
  name: {
    type: "string",
    minLength: 1,
    required: true,
  },
  path: {
    type: "string",
    format: "url",
    required: true,
  },
  additionalProperties: false,
  required: ["name", "path"],
}

function createProjectConfig(projectName) {
  console.log(createProjectConfig.name, { config })

  const config = new Conf({ projectName, schema: projectConfigSchema })
  console.log(createProjectConfig.name, { config })
  return config
}

function getProjectConfig(projectName) {
  console.log(getProjectConfig.name, { projectName })

  const config = config.get(projectName)
  console.log(getProjectConfig.name, { config })

  return config
}

export { createProjectConfig, getProjectConfig }

// Node.js imports

// Third party imports
import _ from "lodash"
import { useRuntimeConfig } from "nuxt/app"

// Local imports
import { useAppStore } from "../stores/app"

const appStore = useAppStore()

async function uploadExtension(file) {
  await appStore.upload(file)
}

async function runExtensions() {
  const projectFolderPath = appStore.projectFolderPath
  console.log("runExtensions", { projectFolderPath })
  const { PROJECT: projectName } = useRuntimeConfig().public
  console.log("runExtensions", { projectName })
  const params = { projectFolderPath, projectName }
  console.log("runExtensions", { params })

  const schema = {
    $id: "/api/extensions/run",
    methods: ["POST"],
    type: "object",
    properties: {
      projectFolderPath: { type: "string" },
      projectName: { type: "string" },
    },
    required: ["projectFolderPath", "projectName"],
    additionalProperties: false,
  }

  return appStore.request(schema, params)
}

export { uploadExtension, runExtensions }

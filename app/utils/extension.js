// Node.js imports

// Third party imports
import _ from "lodash"

// Local imports
import { useAppStore } from "../stores/app"

const appStore = useAppStore()

async function uploadExtension(file) {
  await appStore.upload(file)
}

async function importExtensions() {
  const projectFolderPath = appStore.projectFolderPath
  console.log("importExtensions", { projectFolderPath })
  const params = { projectFolderPath }
  const schema = {
    $id: "/api/import_extensions",
    methods: ["POST"],
    type: "object",
    properties: {
      projectFolderPath: { type: "string" },
    },
    required: ["projectFolderPath"],
    additionalProperties: false,
  }

  return appStore.request(schema, params, {
    response_function: (response) => {
      console.log("runExtensions", { response })
    },
  })
}

export { uploadExtension, importExtensions }

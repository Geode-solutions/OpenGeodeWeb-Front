// Node.js imports

// Third party imports
import _ from "lodash"

// Local imports
import { useAppStore } from "../stores/app"

const appStore = useAppStore()
const extensionProcesses = new Map()

async function uploadExtension(file) {
  console.log("uploadExtension", { file })
  await appStore.upload(file)
  console.log("appStore.uploaded")
}

async function importExtensions(projectFolderPath) {
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

  await appStore.request(schema, params, {
    response_function: (response) => {
      console.log("runExtensions", { response })
    },
  })
}

function killExtensionMicroservices() {
  return [...extensionProcesses.values()].map(async ({ process, _port }) => {
    if (process && !process.killed) {
      process.kill()
      try {
        // Wait for exit or timeout
        await Promise.race([once(process, "exit"), setTimeout(KILL_TIMEOUT)])
      } catch {
        // Ignore errors during kill wait
      }
    }
  })
}

export {
  uploadExtension,
  importExtensions,
  killExtensionMicroservices,
  extensionProcesses,
}

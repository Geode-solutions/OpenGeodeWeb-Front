// Node.js imports
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { WebSocket } from "ws"

// Third party imports
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { afterAll, beforeAll, expect, vi } from "vitest"
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

// Local imports
import { useDataStyleStore } from "~/stores/data_style"
import { useDataBaseStore } from "~/stores/data_base"
import { useGeodeStore } from "~/stores/geode"
import { useViewerStore } from "~/stores/viewer"
import { useInfraStore } from "~/stores/infra"
import { api_fetch } from "~/composables/api_fetch"
import { appMode } from "~/utils/app_mode"
import Status from "~/utils/status"
import {
  executable_name,
  executable_path,
  run_back,
  run_viewer,
} from "~/utils/local"
import { getCurrentFolders, cleanupCreatedFolders } from "./utils.js"

// Local constants
const data_folder = path.join("tests", "integration", "data")

async function setupIntegrationTests(file_name, geode_object) {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()
  const geodeStore = useGeodeStore()
  const viewerStore = useViewerStore()
  const infraStore = useInfraStore()
  infraStore.app_mode = appMode.BROWSER

  const microservices_path = path.join("tests", "integration", "microservices")
  const project_folder_path = path.join(__dirname, "data", uuidv4())
  const upload_folder_path = path.join(__dirname, "data", "uploads")
  const back_path = path.join(
    executable_path(path.join(microservices_path, "back")),
    executable_name("opengeodeweb-back"),
  )
  const viewer_path = path.join(
    executable_path(path.join(microservices_path, "viewer")),
    executable_name("opengeodeweb-viewer"),
  )
  const [back_port, viewer_port] = await Promise.all([
    run_back(back_path, {
      project_folder_path: project_folder_path,
      upload_folder_path: upload_folder_path,
    }),
    run_viewer(viewer_path, {
      project_folder_path: project_folder_path,
    }),
  ])
  console.log("back_port", back_port)
  console.log("viewer_port", viewer_port)

  if (!back_port || !viewer_port) {
    throw new Error("Failed to start microservices")
  }
  geodeStore.default_local_port = back_port
  viewerStore.default_local_port = viewer_port
  await viewerStore.ws_connect()

  const response = await api_fetch({
    schema: back_schemas.opengeodeweb_back.save_viewable_file,
    params: {
      input_geode_object: geode_object,
      filename: file_name,
    },
  })

  console.log("response.data._value.id", response.data._value.id)
  console.log("response.status._value", response.status._value)

  const id = response.data._value.id
  await dataBaseStore.registerObject(id)

  await dataBaseStore.addItem(response.data._value.id, {
    object_type: response.data._value.object_type,
    geode_object: response.data._value.geode_object,
    native_filename: response.data._value.native_file_name,
    viewable_filename: response.data._value.viewable_file_name,
    displayed_name: response.data._value.name,
    vtk_js: {
      binary_light_viewable: response.data._value.binary_light_viewable,
    },
  })

  await dataStyleStore.addDataStyle(
    id,
    response.data._value.geode_object,
    response.data._value.object_type,
  )
  expect(viewerStore.status).toBe(Status.CONNECTED)
  return { id, back_port, viewer_port }
}

const mockLockRequest = vi.fn().mockImplementation(async (name, callback) => {
  return callback({ name })
})

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

let foldersBeforeTests = new Set()

beforeAll(() => {
  global.WebSocket = WebSocket
  foldersBeforeTests = getCurrentFolders(data_folder)
})

afterAll(() => {
  delete global.WebSocket
  cleanupCreatedFolders(data_folder, foldersBeforeTests)
})

export { setupIntegrationTests }

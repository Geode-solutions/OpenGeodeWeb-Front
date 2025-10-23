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
  get_available_port,
  run_back,
  run_viewer,
} from "~/utils/local"
import { getCurrentFolders, cleanupCreatedFolders } from "./utils.js"

async function setupIntegrationTests(file_name, geode_object, object_type) {
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
  const b_port = await get_available_port()
  const v_port = await get_available_port()
  const [back_port, viewer_port] = await Promise.all([
    run_back(back_path, {
      port: b_port,
      project_folder_path: project_folder_path,
      upload_folder_path: upload_folder_path,
    }),
    run_viewer(viewer_path, {
      port: v_port,
      project_folder_path: project_folder_path,
    }),
  ])
  console.log("back_port", back_port)
  console.log("viewer_port", viewer_port)
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

  const id = response.data._value.id
  await dataBaseStore.registerObject(id)
  await dataStyleStore.addDataStyle(id, geode_object, object_type)
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

const data_folder_path = path.join(__dirname, "..", "..", "..", "data")

let foldersBeforeTests = new Set()
beforeAll(() => {
  global.WebSocket = WebSocket
  foldersBeforeTests = getCurrentFolders(data_folder_path)
  console.log("foldersBeforeTests", foldersBeforeTests)
})

afterAll(() => {
  delete global.WebSocket
  cleanupCreatedFolders(data_folder_path, foldersBeforeTests)
})

export { setupIntegrationTests }

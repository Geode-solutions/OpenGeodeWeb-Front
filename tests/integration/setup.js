// Node.js imports
import { WebSocket } from "ws"
import path from "node:path"
import { v4 as uuidv4 } from "uuid"

// Third party imports
import { afterAll, beforeAll, expect, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

// Local imports
import {
  executable_name,
  executable_path,
  run_back,
  run_viewer,
} from "@ogw_front/utils/local"
import Status from "@ogw_front/utils/status"
import { appMode } from "@ogw_front/utils/app_mode"
import { importFile } from "@ogw_front/utils/file_import_workflow"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const data_folder = path.join("tests", "integration", "data")

async function runMicroservices() {
  const geodeStore = useGeodeStore()
  const infraStore = useInfraStore()
  const viewerStore = useViewerStore()
  infraStore.app_mode = appMode.BROWSER

  const microservices_path = path.join("tests", "integration", "microservices")
  const project_folder_path = path.join(data_folder, uuidv4())
  const upload_folder_path = path.join(__dirname, "data", "uploads")
  const back_path = await executable_path(path.join(microservices_path, "back"))
  const back_name = executable_name("opengeodeweb-back")
  const viewer_path = await executable_path(
    path.join(microservices_path, "viewer"),
  )
  const viewer_name = executable_name("opengeodeweb-viewer")
  const [back_port, viewer_port] = await Promise.all([
    run_back(back_name, back_path, {
      project_folder_path: project_folder_path,
      upload_folder_path: upload_folder_path,
    }),
    run_viewer(viewer_name, viewer_path, {
      project_folder_path: project_folder_path,
    }),
  ])
  console.log("back_port", back_port)
  console.log("viewer_port", viewer_port)

  geodeStore.default_local_port = back_port
  viewerStore.default_local_port = viewer_port
  console.log("after ports")

  return { back_port, viewer_port, project_folder_path }
}

async function setupIntegrationTests(file_name, geode_object) {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const viewerStore = useViewerStore()

  const { back_port, viewer_port, project_folder_path } =
    await runMicroservices()
  await viewerStore.ws_connect()

  const id = await importFile(file_name, geode_object)
  expect(viewerStore.status).toBe(Status.CONNECTED)
  console.log("end of setupIntegrationTests")
  return { id, back_port, viewer_port, project_folder_path }
}

const mockLockRequest = vi.fn().mockImplementation(async (name, callback) => await callback({ name }))

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

beforeAll(() => {
  global.WebSocket = WebSocket
})

afterAll(() => {
  delete global.WebSocket
})

export { runMicroservices, setupIntegrationTests }

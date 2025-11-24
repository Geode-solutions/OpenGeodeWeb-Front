// Node.js imports
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { WebSocket } from "ws"

// Third party imports
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { afterAll, beforeAll, expect, vi } from "vitest"

// Local imports
import { useGeodeStore } from "~/stores/geode"
import { useViewerStore } from "~/stores/viewer"
import { useInfraStore } from "~/stores/infra"
import { appMode } from "~/utils/app_mode"
import { importFile } from "~/utils/file_import_workflow"
import Status from "~/utils/status"
import {
  executable_name,
  executable_path,
  run_back,
  run_viewer,
} from "~/utils/local"

// Local constants
const data_folder = path.join("tests", "integration", "data")

async function setupIntegrationTests(file_name, geode_object) {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const infraStore = useInfraStore()
  infraStore.init_microservices()
  const geodeStore = useGeodeStore()
  const hybridViewerStore = useHybridViewerStore()
  const viewerStore = useViewerStore()
  infraStore.app_mode = appMode.BROWSER

  const microservices_path = path.join("tests", "integration", "microservices")
  const project_folder_path = path.join(data_folder, uuidv4())
  const upload_folder_path = path.join(__dirname, "data", "uploads")
  const back_path = executable_path(path.join(microservices_path, "back"))
  const back_name = executable_name("opengeodeweb-back")
  const viewer_path = executable_path(path.join(microservices_path, "viewer"))
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
  await viewerStore.ws_connect()
  // await hybridViewerStore.initHybridViewer()
  console.log("after hybridViewerStore.initHybridViewer")

  // await viewerStore.ws_connect()
  const id = await importFile(file_name, geode_object)
  expect(viewerStore.status).toBe(Status.CONNECTED)
  console.log("end of setupIntegrationTests")
  return { id, back_port, viewer_port, project_folder_path }
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

beforeAll(() => {
  global.WebSocket = WebSocket
})

afterAll(() => {
  delete global.WebSocket
})

export { setupIntegrationTests }

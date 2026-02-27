// Node.js imports
import { WebSocket } from "ws"
import path from "node:path"

// Third party imports
import { afterAll, beforeAll, expect, vi } from "vitest"

// Local imports
import {
  delete_folder_recursive,
  kill_back,
  kill_viewer,
} from "@ogw_front/utils/local"
import Status from "@ogw_front/utils/status"
import { appMode } from "@ogw_front/utils/app_mode"
import { importFile } from "@ogw_front/utils/file_import_workflow"
import { setupActivePinia } from "../utils"
import { useAppStore } from "@ogw_front/stores/app"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const data_folder = path.join("tests", "integration", "data")

async function runMicroservices() {
  const appStore = useAppStore()
  const geodeStore = useGeodeStore()
  const infraStore = useInfraStore()
  const viewerStore = useViewerStore()
  infraStore.app_mode = appMode.BROWSER

  await appStore.init()
  await Promise.all([geodeStore.launch(), viewerStore.launch()])

  return {
    back_port: geodeStore.default_local_port,
    viewer_port: viewerStore.default_local_port,
    project_folder_path: appStore.project_folder_path,
  }
}

async function setupIntegrationTests(file_name, geode_object) {
  setupActivePinia()
  const viewerStore = useViewerStore()

  const { back_port, viewer_port, project_folder_path } =
    await runMicroservices()
  await viewerStore.ws_connect()

  const id = await importFile(file_name, geode_object)
  expect(viewerStore.status).toBe(Status.CONNECTED)
  console.log("end of setupIntegrationTests")
  return { id, back_port, viewer_port, project_folder_path }
}

const mockLockRequest = vi
  .fn()
  .mockImplementation(async (name, task) => await task({ name }))

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

beforeAll(() => {
  globalThis.WebSocket = WebSocket
})

afterAll(() => {
  delete globalThis.WebSocket
})

async function teardownIntegrationTests(
  back_port,
  viewer_port,
  project_folder_path,
) {
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
}

export { runMicroservices, setupIntegrationTests, teardownIntegrationTests }

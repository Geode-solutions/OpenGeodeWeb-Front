// Node.js imports
import path from "node:path"
import { WebSocket } from "ws"

// Third party imports
import { afterAll, beforeAll, expect, vi } from "vitest"
import { useRuntimeConfig } from "nuxt/app"

// Local imports
import {
  createPath,
  deleteFolderRecursive,
  generateProjectFolderPath,
} from "@ogw_front/utils/local/path"
import {
  killBack,
  killViewer,
  runBack,
  runViewer,
} from "@ogw_front/utils/local/microservices"
import { Status } from "@ogw_front/utils/status"
import { appMode } from "@ogw_front/utils/app_mode"
import { importFile } from "@ogw_front/utils/file_import_workflow"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { setupActivePinia } from "@ogw_tests/utils"

// Local constants
const data_folder = path.join("tests", "integration", "data", "uploads")

async function runMicroservices() {
  const geodeStore = useGeodeStore()
  const infraStore = useInfraStore()
  const viewerStore = useViewerStore()
  infraStore.app_mode = appMode.BROWSER
  const { BACK_COMMAND, BACK_PATH, PROJECT, VIEWER_COMMAND, VIEWER_PATH } =
    useRuntimeConfig().public
  const projectFolderPath = generateProjectFolderPath(PROJECT)
  await createPath(projectFolderPath)

  const [back_port, viewer_port] = await Promise.all([
    runBack(BACK_COMMAND, BACK_PATH, {
      projectFolderPath,
      uploadFolderPath: data_folder,
    }),
    runViewer(VIEWER_COMMAND, VIEWER_PATH, { projectFolderPath }),
  ])

  console.log("back_port", back_port)
  console.log("viewer_port", viewer_port)

  geodeStore.default_local_port = back_port
  viewerStore.default_local_port = viewer_port
  console.log("after ports")

  return {
    back_port,
    viewer_port,
    project_folder_path: projectFolderPath,
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
  await Promise.all([killBack(back_port), killViewer(viewer_port)])
  deleteFolderRecursive(project_folder_path)
}

export { runMicroservices, setupIntegrationTests, teardownIntegrationTests }

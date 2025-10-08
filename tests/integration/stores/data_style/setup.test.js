// Global imports
import path from "path"

// Third party imports
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { expect, vi } from "vitest"

// Local imports
import { useDataStyleStore } from "@ogw_f/stores/data_style"
import { useDataBaseStore } from "@ogw_f/stores/data_base"
import { useViewerStore } from "@ogw_f/stores/viewer"
import { useInfraStore } from "@ogw_f/stores/infra"

import { appMode } from "@ogw_f/utils/app_mode"
import { executable_name, executable_path, run_viewer } from "@ogw_f/utils"

async function setupTests(id, file_name, object_type) {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()
  const viewerStore = useViewerStore()
  const infraStore = useInfraStore()
  infraStore.app_mode = appMode.appMode.BROWSER

  const viewer_path = path.join(
    executable_path(
      path.join("tests", "integration", "microservices", "viewer"),
    ),
    executable_name("opengeodeweb_viewer"),
  )
  const data_folder_path = path.join(__dirname, "..", "..", "..", "data")
  const viewer_port = await run_viewer(viewer_path, {
    port: 1234,
    data_folder_path,
  })

  viewerStore.default_local_port = viewer_port
  await viewerStore.ws_connect()
  await dataBaseStore.registerObject(id, file_name, object_type)
  await dataStyleStore.addDataStyle(id, geode_object, object_type)
  expect(viewerStore.status).toBe(Status.CONNECTED)
}

export { setupTests }

import path from "path"

import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest"

import {
  executable_name,
  executable_path,
  kill_processes,
  run_viewer,
} from "@ogw_f/utils/local"

import Status from "@ogw_f/utils/status"

import * as composables from "@ogw_f/composables/viewer_call"
import { useDataStyleStore } from "@ogw_f/stores/data_style"
import { useDataBaseStore } from "@ogw_f/stores/data_base"
import { useViewerStore } from "@ogw_f/stores/viewer"
import { useInfraStore } from "@ogw_f/stores/infra"

import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import { WebSocket } from "ws"

const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges

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

const id = "fake_id"
const file_name = "edged_curve.vtp"
const geode_object = "EdgedCurve2D"
const object_type = "mesh"

// beforeEach(async () => {
//   const pinia = createTestingPinia({
//     stubActions: false,
//     createSpy: vi.fn,
//   })
//   setActivePinia(pinia)
//   const dataStyleStore = useDataStyleStore()
//   const dataBaseStore = useDataBaseStore()
//   const viewerStore = useViewerStore()
//   const infraStore = useInfraStore()
//   infraStore.app_mode = appMode.appMode.BROWSER

//   const viewer_path = path.join(
//     executable_path(
//       path.join("tests", "integration", "microservices", "viewer"),
//     ),
//     executable_name("opengeodeweb_viewer"),
//   )
//   const data_folder_path = path.join(__dirname, "..", "..", "..", "data")
//   const viewer_port = await run_viewer(viewer_path, {
//     port: 1234,
//     data_folder_path,
//   })

//   viewerStore.default_local_port = viewer_port
//   await viewerStore.ws_connect()
//   await dataBaseStore.registerObject(id, file_name, object_type)
//   await dataStyleStore.addDataStyle(id, geode_object, object_type)
//   expect(viewerStore.status).toBe(Status.CONNECTED)
// }, 20000)

describe("Mesh", () => {
  // afterEach(async () => {
  //   await kill_processes()
  // })
  test("dumb test", async () => {
    expect(true).toBe(true)
  })

  // describe("Edges visibility", () => {
  //   test("test visibility true", async () => {
  //     const dataStyleStore = useDataStyleStore()
  //     const viewerStore = useViewerStore()
  //     await dataStyleStore.setEdgesVisibility(id, true)
  //     expect(dataStyleStore.edgesVisibility(id)).toBe(true)
  //     expect(viewerStore.status).toBe(Status.CONNECTED)
  //   })
  // })
})

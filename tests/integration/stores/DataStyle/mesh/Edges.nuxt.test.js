import path from "path"
// import fs from "fs"

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
  run_back,
} from "@ogw_f/utils/local"

import Status from "@ogw_f/utils/status"

import { api_fetch } from "@ogw_f/composables/api_fetch"
import * as composables from "@ogw_f/composables/viewer_call"
import { useDataStyleStore } from "@ogw_f/stores/data_style"
import { useDataBaseStore } from "@ogw_f/stores/data_base"
import { useViewerStore } from "@ogw_f/stores/viewer"
import { useInfraStore } from "@ogw_f/stores/infra"
import { useGeodeStore } from "@ogw_f/stores/geode"

import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import appMode from "@ogw_f/utils/app_mode"
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

let id = "fake_id"
const file_name = "test.og_edc2d"
const geode_object = "EdgedCurve2D"

beforeEach(async () => {
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

  // const data_folder_path = path.join(__dirname, "..", "..", "..", "data")
  // if (!fs.existsSync(data_folder_path)) {
  //   fs.mkdirSync(data_folder_path, { recursive: true })
  // }

  const back_path = path.join(
    executable_path(path.join("tests", "integration", "microservices", "back")),
    executable_name("opengeodeweb-back"),
  )
  const viewer_path = path.join(
    executable_path(
      path.join("tests", "integration", "microservices", "viewer"),
    ),
    executable_name("opengeodeweb-viewer"),
  )

  const { port: back_port } = await run_back(back_path, {
    port: 5000,
    data_folder_path,
  })

  // await new Promise((resolve) => setTimeout(resolve, 5000))

  const viewer_port = await run_viewer(viewer_path, {
    port: 1234,
    data_folder_path,
  })
  console.log("Viewer path:", viewer_path)
  geodeStore.default_local_port = back_port
  viewerStore.default_local_port = viewer_port
  await viewerStore.ws_connect()
  console.log("schema", back_schemas.opengeodeweb_back.save_viewable_file)

  const response = await api_fetch({
    schema: back_schemas.opengeodeweb_back.save_viewable_file,
    params: {
      input_geode_object: geode_object,
      filename: file_name,
    },
  })
  id = response.data.value.id

  await dataBaseStore.registerObject(id)
  await dataStyleStore.addDataStyle(id, geode_object, "mesh")

  expect(viewerStore.status).toBe(Status.CONNECTED)
}, 15000)

describe("Mesh edges", () => {
  afterEach(async () => {
    // await kill_processes()
  })

  describe("Edges visibility", () => {
    test("test visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      await dataStyleStore.setEdgesVisibility(id, true)
      expect(dataStyleStore.edgesVisibility(id)).toBe(true)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  // describe("Edges active coloring", () => {
  //   test("test coloring", async () => {
  //     const dataStyleStore = useDataStyleStore()
  //     const viewerStore = useViewerStore()
  //     const coloringTypes = ["color"]
  //     for (let i = 0; i < coloringTypes.length; i++) {
  //       dataStyleStore.setEdgesActiveColoring(id, coloringTypes[i])
  //       expect(dataStyleStore.edgesActiveColoring(id)).toBe(coloringTypes[i])
  //       expect(viewerStore.status).toBe(Status.CONNECTED)
  //     }
  //   })
  // })
  // describe("Edges color", () => {
  //   test("test red", async () => {
  //     const dataStyleStore = useDataStyleStore()
  //     const viewerStore = useViewerStore()
  //     const color = { r: 255, g: 0, b: 0 }
  //     const spy = vi.spyOn(composables, "viewer_call")
  //     await dataStyleStore.setEdgesColor(id, color)
  //     expect(spy).toHaveBeenCalledWith(
  //       {
  //         schema: mesh_edges_schemas.color,
  //         params: { id, color },
  //       },
  //       {
  //         response_function: expect.any(Function),
  //       },
  //     )
  //     expect(dataStyleStore.edgesColor(id)).toStrictEqual(color)
  //     expect(viewerStore.status).toBe(Status.CONNECTED)
  //   })
  // })
})

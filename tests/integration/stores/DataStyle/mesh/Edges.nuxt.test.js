// @vitest-environment nuxt
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

import * as composables from "@ogw_f/composables/viewer_call"
import { useDataStyleStore } from "@ogw_f/stores/data_style"
import { useDataBaseStore } from "@ogw_f/stores/data_base"
import { useViewerStore } from "@ogw_f/stores/viewer"
import { useInfraStore } from "@ogw_f/stores/infra"

import { ResetPlugin } from "@ogw_f/plugins/reset_plugin"
import viewer_call from "@ogw_f/composables/viewer_call"
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

describe("Mesh edges", () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
    plugins: [ResetPlugin],
  })
  setActivePinia(pinia)
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()
  const viewerStore = useViewerStore()
  const infraStore = useInfraStore()

  beforeEach(async () => {
    await dataStyleStore.$reset()
    await dataBaseStore.$reset()
    await viewerStore.$reset()
    await infraStore.$reset()
    infraStore.app_mode = appMode.appMode.BROWSER

    const viewer_path = path.join(
      executable_path(
        path.join("tests", "integration", "microservices", "viewer"),
      ),
      executable_name("opengeodeweb_viewer"),
    )
    const viewer_port = await run_viewer(viewer_path, {
      port: 1234,
      data_folder_path: path.join(__dirname, "..", "..", "..", "data"),
    })

    viewerStore.default_local_port = viewer_port
    await viewerStore.ws_connect()
    await dataBaseStore.registerObject(id, file_name, object_type)
    await dataStyleStore.addDataStyle(id, geode_object, object_type)
    expect(viewerStore.status).toBe("CONNECTED")
  })

  afterEach(() => {
    kill_processes()
  })

  describe("Edges visibility", () => {
    test("test visibility true", async () => {
      // dataStyleStore.addDataStyle(id, geode_object, object_type)
      await dataStyleStore.setEdgesVisibility(id, true)
      expect(dataStyleStore.edgesVisibility(id)).toBe(true)
    })
  })

  // describe("Edges active coloring", () => {
  //   test("test color", async () => {
  //     const id = "fake_id"
  //     const geodeObject = "EdgedCurve2D"
  //     const object_type = "mesh"

  //     const coloringTypes = ["color"]
  //     for (let i = 0; i < coloringTypes.length; i++) {
  //       dataStyleStore.addDataStyle(id, geodeObject, object_type)
  //       dataStyleStore.setEdgesActiveColoring(id, coloringTypes[i])
  //       expect(dataStyleStore.edgesActiveColoring(id)).toBe(coloringTypes[i])
  //     }
  //   })
  // })
  describe("Edges color", () => {
    test("test red", async () => {
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setEdgesColor(id, color)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: mesh_edges_schemas.color,
          params: { id, color },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(spy).toHaveBeenCalledTimes(1)
      expect(dataStyleStore.edgesColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(status.CONNECTED)
    })
  })
})

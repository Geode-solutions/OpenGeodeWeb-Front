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

const mesh_polygons_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polygons

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
const file_name = "hat.vtp"
const geode_object = "PolygonalSurface3D"
const object_type = "mesh"

beforeEach(async () => {
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
  const viewer_port = await run_viewer(viewer_path, {
    port: 1234,
    data_folder_path: path.join(__dirname, "..", "..", "..", "data"),
  })

  viewerStore.default_local_port = viewer_port
  await viewerStore.ws_connect()
  await dataBaseStore.registerObject(id, file_name, object_type)
  await dataStyleStore.addDataStyle(id, geode_object, object_type)
  expect(viewerStore.status).toBe(Status.CONNECTED)
}, 15000)

describe("Mesh polygons", () => {
  afterEach(async () => {
    await kill_processes()
  })

  describe("Polygons visibility", () => {
    test("test visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      await dataStyleStore.setPolygonsVisibility(id, true)
      expect(dataStyleStore.polygonsVisibility(id)).toBe(true)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Polygons active coloring", () => {
    test("test coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = ["color"]
      for (let i = 0; i < coloringTypes.length; i++) {
        dataStyleStore.setPolygonsActiveColoring(id, coloringTypes[i])
        expect(dataStyleStore.polygonsActiveColoring(id)).toBe(coloringTypes[i])
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })
  })
  describe("Polygons color", () => {
    test("test red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setPolygonsColor(id, color)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: mesh_polygons_schemas.color,
          params: { id, color },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.polygonsColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})

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
  kill_viewer,
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

const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points

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

beforeEach(async () => {
  console.log("1")
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  console.log("2")

  setActivePinia(pinia)
  console.log("3")

  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()
  const viewerStore = useViewerStore()
  const infraStore = useInfraStore()
  console.log("4")

  infraStore.app_mode = appMode.appMode.BROWSER
  console.log("5")
  const viewer_path = path.join(
    executable_path(
      path.join("tests", "integration", "microservices", "viewer"),
    ),
    executable_name("opengeodeweb_viewer"),
  )
  console.log("6")
  const data_folder_path = path.join(__dirname, "..", "..", "..", "data")
  const viewer_port = await run_viewer(viewer_path, {
    port: 1234,
    data_folder_path,
  })
  console.log("7")
  viewerStore.default_local_port = viewer_port
  console.log("8")
  await viewerStore.ws_connect()
  console.log("9")
  await dataBaseStore.registerObject(id, file_name, object_type)
  console.log("10")
  await dataStyleStore.addDataStyle(id, geode_object, object_type)
  console.log("11")
  expect(viewerStore.status).toBe(Status.CONNECTED)
  console.log("12")
}, 20000)

describe("Mesh points", () => {
  afterEach(async () => {
    const viewerStore = useViewerStore()
    await kill_viewer(viewerStore.default_local_port)
  })

  // test("dumb test", async () => {
  //   expect(true).toBe(true)
  // })

  describe("Points visibility", () => {
    test("test visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      await dataStyleStore.setPointsVisibility(id, true)
      expect(dataStyleStore.pointsVisibility(id)).toBe(true)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Points active coloring", () => {
    test("test coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = ["color"]
      for (let i = 0; i < coloringTypes.length; i++) {
        dataStyleStore.setPointsActiveColoring(id, coloringTypes[i])
        expect(dataStyleStore.pointsActiveColoring(id)).toBe(coloringTypes[i])
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })
  })
  describe("Points color", () => {
    test("test red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setPointsColor(id, color)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: mesh_points_schemas.color,
          params: { id, color },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.pointsColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})

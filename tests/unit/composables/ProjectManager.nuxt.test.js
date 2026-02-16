import { describe, expect, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

// Local imports
import { appMode } from "@ogw_front/utils/app_mode"
import { useProjectManager } from "@ogw_front/composables/project_manager"

// Constants
const PANEL_WIDTH = 300
const Z_SCALE = 1.5
const FOCAL_POINT1 = 1
const FOCAL_POINT2 = 2
const FOCAL_POINT3 = 3
const FOCAL_POINT = [FOCAL_POINT1, FOCAL_POINT2, FOCAL_POINT3]
const VIEW_UP1 = 0
const VIEW_UP2 = 1
const VIEW_UP3 = 0
const VIEW_UP = [VIEW_UP1, VIEW_UP2, VIEW_UP3]
const POSITION1 = 10
const POSITION2 = 11
const POSITION3 = 12
const POSITION = [POSITION1, POSITION2, POSITION3]
const VIEW_ANGLE = 30
const CLIPPING_RANGE1 = 0.1
const CLIPPING_RANGE2 = 1000
const CLIPPING_RANGE = [CLIPPING_RANGE1, CLIPPING_RANGE2]
const POINT_SIZE = 2
const VIEWER_CALL_COUNT = 2

// Snapshot
const snapshotMock = {
  data: {
    items: [
      {
        id: "abc123",
        viewer_type: "mesh",
        geode_object_type: "PointSet2D",
        native_file: "native.ext",
        viewable_file: "viewable.ext",
        name: "My Data",
        binary_light_viewable: "VGxpZ2h0RGF0YQ==",
      },
    ],
  },
  treeview: {
    isAdditionnalTreeDisplayed: false,
    panelWidth: PANEL_WIDTH,
    model_id: "",
    isTreeCollection: false,
    selectedTree: undefined,
    selectionIds: [],
  },
  dataStyle: {
    styles: {
      abc123: {
        points: {
          visibility: true,
          coloring: {
            active: "color",
            color: { r: 255, g: 255, b: 255 },
            vertex: undefined,
          },
          size: POINT_SIZE,
        },
      },
    },
  },
  hybridViewer: {
    zScale: Z_SCALE,
    camera_options: {
      focal_point: FOCAL_POINT,
      view_up: VIEW_UP,
      position: POSITION,
      view_angle: VIEW_ANGLE,
      clipping_range: CLIPPING_RANGE,
    },
  },
}

const geodeStoreMock = {
  start_request: vi.fn(),
  stop_request: vi.fn(),
  base_url: vi.fn(() => ""),
  $reset: vi.fn(),
}
const infraStoreMock = {
  app_mode: appMode.BROWSER,
  ID: "1234",
}
const viewerStoreMock = {
  ws_connect: vi.fn().mockResolvedValue(),
  base_url: vi.fn(() => ""),
  request: vi.fn().mockResolvedValue(),
}
const treeviewStoreMock = {
  clear: vi.fn(),
  importStores: vi.fn().mockResolvedValue(),
  finalizeImportSelection: vi.fn(),
  addItem: vi.fn().mockResolvedValue(),
}
const dataStoreMock = {
  clear: vi.fn(),
  registerObject: vi.fn().mockResolvedValue(),
  addItem: vi.fn().mockResolvedValue(),
}
const dataStyleStoreMock = {
  importStores: vi.fn().mockResolvedValue(),
  applyAllStylesFromState: vi.fn().mockResolvedValue(),
  addDataStyle: vi.fn().mockResolvedValue(),
  applyDefaultStyle: vi.fn().mockResolvedValue(),
}

const viewer_call_mock_fn = vi.fn().mockResolvedValue()

const hybridViewerStoreMock = {
  clear: vi.fn(),
  initHybridViewer: vi.fn().mockResolvedValue(),
  importStores: vi.fn((snapshot) => {
    if (snapshot?.zScale !== undefined) {
      hybridViewerStoreMock.setZScaling(snapshot.zScale)
    }
    if (snapshot?.camera_options) {
      viewer_call_mock_fn({
        schema: { $id: "opengeodeweb_viewer.viewer.update_camera" },
        params: { camera_options: snapshot.camera_options },
      })
      hybridViewerStoreMock.remoteRender()
    }
  }),
  addItem: vi.fn().mockResolvedValue(),
  remoteRender: vi.fn(),
  setZScaling: vi.fn(),
}

// MOCKS
vi.stubGlobal("$fetch", vi.fn().mockResolvedValue({ snapshot: snapshotMock }))
vi.mock("../../../internal/utils/viewer_call", () => ({
  viewer_call: viewer_call_mock_fn,
}))

vi.mock("@ogw_front/composables/api_fetch", () => ({
  api_fetch: vi.fn(async (_req, options = {}) => {
    const response = {
      _data: new Blob(["zipcontent"], { type: "application/zip" }),
      headers: {
        get: (k) => (k === "new-file-name" ? "project_123.vease" : undefined),
      },
    }
    if (options.response_function) {
      await options.response_function(response)
    }
    return response
  }),
}))
vi.mock("js-file-download", () => ({ default: vi.fn() }))
vi.mock("@ogw_front/stores/infra", () => ({
  useInfraStore: () => infraStoreMock,
}))
vi.mock("@ogw_front/stores/viewer", () => ({
  useViewerStore: () => viewerStoreMock,
}))
vi.mock("@ogw_front/stores/treeview", () => ({
  useTreeviewStore: () => treeviewStoreMock,
}))
vi.mock("@ogw_front/stores/data", () => ({
  useDataStore: () => dataStoreMock,
}))
vi.mock("@ogw_front/stores/data_style", () => ({
  useDataStyleStore: () => dataStyleStoreMock,
}))
vi.mock("@ogw_front/stores/hybrid_viewer", () => ({
  useHybridViewerStore: () => hybridViewerStoreMock,
}))
vi.mock("@ogw_front/stores/geode", () => ({
  useGeodeStore: () => geodeStoreMock,
}))
vi.mock("@ogw_front/stores/app", () => ({
  useAppStore: () => ({
    exportStores: vi.fn(() => ({ projectName: "mockedProject" })),
  }),
}))

vi.stubGlobal("useAppStore", () => ({
  exportStores: vi.fn(() => ({ projectName: "mockedProject" })),
}))

const mockLockRequest = vi
  .fn()
  .mockImplementation(async (name, fn) => await fn({ name }))

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

function verifyViewerCalls() {
  expect(viewerStoreMock.ws_connect).toHaveBeenCalledWith()
  expect(viewer_call_mock_fn).toHaveBeenCalledTimes(VIEWER_CALL_COUNT)
}

function verifyStoreImports() {
  expect(treeviewStoreMock.importStores).toHaveBeenCalledWith(
    snapshotMock.treeview,
  )
  expect(hybridViewerStoreMock.initHybridViewer).toHaveBeenCalledWith()
  expect(hybridViewerStoreMock.importStores).toHaveBeenCalledWith(
    snapshotMock.hybridViewer,
  )
  expect(hybridViewerStoreMock.setZScaling).toHaveBeenCalledWith(Z_SCALE)
}

function verifyDataManagement() {
  expect(dataStyleStoreMock.importStores).toHaveBeenCalledWith(
    snapshotMock.dataStyle,
  )
  expect(dataStyleStoreMock.applyAllStylesFromState).toHaveBeenCalledWith()
  expect(dataStoreMock.registerObject).toHaveBeenCalledWith("abc123")
  expect(dataStoreMock.addItem).toHaveBeenCalledWith(
    "abc123",
    expect.anything(),
  )
  expect(treeviewStoreMock.addItem).toHaveBeenCalledWith(
    "PointSet2D",
    "My Data",
    "abc123",
    "mesh",
  )
}

function verifyRemaining() {
  expect(hybridViewerStoreMock.addItem).toHaveBeenCalledWith("abc123")
  expect(dataStyleStoreMock.addDataStyle).toHaveBeenCalledWith(
    "abc123",
    "PointSet2D",
  )
  expect(dataStyleStoreMock.applyDefaultStyle).toHaveBeenCalledWith("abc123")
  expect(hybridViewerStoreMock.remoteRender).toHaveBeenCalledWith()
}

describe("projectManager composable (compact)", () => {
  function setup() {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    setActivePinia(pinia)

    // reset spies
    const storesList = [
      viewerStoreMock,
      treeviewStoreMock,
      dataStoreMock,
      dataStyleStoreMock,
      hybridViewerStoreMock,
    ]
    for (const store of storesList) {
      const values = Object.values(store)
      for (const value of values) {
        if (typeof value === "function" && value.mockClear) {
          value.mockClear()
        }
      }
    }
    viewer_call_mock_fn.mockClear()
  }

  test("exportProject", async () => {
    setup()
    const { exportProject } = useProjectManager()
    const { default: fileDownload } = await import("js-file-download")

    await exportProject()

    expect(fileDownload).toHaveBeenCalledWith(
      { snapshot: snapshotMock },
      "project.vease",
    )
  })

  test("importProjectFile with snapshot - Viewer and Stores", async () => {
    setup()
    const { importProjectFile } = useProjectManager()
    const file = new Blob(['{"dataBase":{"db":{}}}'], {
      type: "application/json",
    })

    await importProjectFile(file)

    verifyViewerCalls()
    verifyStoreImports()
    expect(true).toBeTruthy()
  })

  test("importProjectFile with snapshot - Data and Rendering", async () => {
    setup()
    const { importProjectFile } = useProjectManager()
    const file = new Blob(['{"dataBase":{"db":{}}}'], {
      type: "application/json",
    })

    await importProjectFile(file)

    verifyDataManagement()
    verifyRemaining()
    expect(true).toBeTruthy()
  })
})

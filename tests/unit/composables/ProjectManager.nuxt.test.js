import { beforeEach, describe, expect, test, vi } from "vitest"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

// Local imports
import { useProjectManager } from "@ogw_front/composables/project_manager"
import { appMode } from "@ogw_front/utils/app_mode"

// Snapshot
const snapshotMock = {
  dataBase: {
    db: {
      abc123: {
        viewer_type: "mesh",
        geode_object_type: "PointSet2D",
        native_file: "native.ext",
        viewable_file: "viewable.ext",
        name: "My Data",
        binary_light_viewable: "VGxpZ2h0RGF0YQ==",
      },
    },
  },
  treeview: {
    isAdditionnalTreeDisplayed: false,
    panelWidth: 320,
    model_id: "",
    isTreeCollection: false,
    selectedTree: null,
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
            vertex: null,
          },
          size: 2,
        },
      },
    },
  },
  hybridViewer: {
    zScale: 1.5,
    camera_options: {
      focal_point: [1, 2, 3],
      view_up: [0, 1, 0],
      position: [10, 11, 12],
      view_angle: 30,
      clipping_range: [0.1, 1000],
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
  ws_connect: vi.fn(() => Promise.resolve()),
  base_url: vi.fn(() => ""),
  request: vi.fn(() => Promise.resolve()),
}
const treeviewStoreMock = {
  clear: vi.fn(),
  importStores: vi.fn(() => Promise.resolve()),
  finalizeImportSelection: vi.fn(),
  addItem: vi.fn(() => Promise.resolve()),
}
const dataBaseStoreMock = {
  clear: vi.fn(),
  registerObject: vi.fn(() => Promise.resolve()),
  addItem: vi.fn(() => Promise.resolve()),
}
const dataStyleStoreMock = {
  importStores: vi.fn(() => Promise.resolve()),
  applyAllStylesFromState: vi.fn(() => Promise.resolve()),
  addDataStyle: vi.fn(() => Promise.resolve()),
  applyDefaultStyle: vi.fn(() => Promise.resolve()),
}
const hybridViewerStoreMock = {
  clear: vi.fn(),
  initHybridViewer: vi.fn(() => Promise.resolve()),
  importStores: vi.fn(async (snapshot) => {
    if (snapshot?.zScale != null) {
      hybridViewerStoreMock.setZScaling(snapshot.zScale)
    }
    if (snapshot?.camera_options) {
      const { viewer_call } = await import(
        "../../../internal/utils/viewer_call"
      )
      viewer_call({
        schema: { $id: "opengeodeweb_viewer.viewer.update_camera" },
        params: { camera_options: snapshot.camera_options },
      })
      hybridViewerStoreMock.remoteRender()
    }
  }),
  addItem: vi.fn(() => Promise.resolve()),
  remoteRender: vi.fn(),
  setZScaling: vi.fn(),
}

// Mocks
vi.stubGlobal(
  "$fetch",
  vi.fn(async () => ({ snapshot: snapshotMock })),
)
vi.mock("../../../internal/utils/viewer_call", () => ({
  viewer_call: vi.fn(() => Promise.resolve()),
}))

vi.mock("@ogw_front/composables/api_fetch", () => ({
  api_fetch: vi.fn(async (_req, options = {}) => {
    const response = {
      _data: new Blob(["zipcontent"], { type: "application/zip" }),
      headers: {
        get: (k) => (k === "new-file-name" ? "project_123.vease" : null),
      },
    }
    if (options.response_function) await options.response_function(response)
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
vi.mock("@ogw_front/stores/data_base", () => ({
  useDataBaseStore: () => dataBaseStoreMock,
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

const mockLockRequest = vi.fn().mockImplementation(async (name, callback) => {
  return callback({ name })
})

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
})

describe("ProjectManager composable (compact)", () => {
  beforeEach(async () => {
    const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
    setActivePinia(pinia)

    // reset spies
    for (const store of [
      viewerStoreMock,
      treeviewStoreMock,
      dataBaseStoreMock,
      dataStyleStoreMock,
      hybridViewerStoreMock,
    ]) {
      Object.values(store).forEach(
        (v) => typeof v === "function" && v.mockClear && v.mockClear(),
      )
    }
    const { viewer_call } = await import("../../../internal/utils/viewer_call")
    viewer_call.mockClear()
  })

  test("exportProject", async () => {
    const { exportProject } = useProjectManager()
    const { default: fileDownload } = await import("js-file-download")

    await exportProject()

    expect(fileDownload).toHaveBeenCalled()
  })

  test("importProjectFile with snapshot", async () => {
    const { importProjectFile } = useProjectManager()
    const file = new Blob(['{"dataBase":{"db":{}}}'], {
      type: "application/json",
    })

    await importProjectFile(file)

    const { viewer_call } = await import("../../../internal/utils/viewer_call")

    expect(viewerStoreMock.ws_connect).toHaveBeenCalled()
    expect(viewer_call).toHaveBeenCalledTimes(2)

    expect(treeviewStoreMock.importStores).toHaveBeenCalledWith(
      snapshotMock.treeview,
    )
    expect(hybridViewerStoreMock.initHybridViewer).toHaveBeenCalled()
    expect(hybridViewerStoreMock.importStores).toHaveBeenCalledWith(
      snapshotMock.hybridViewer,
    )
    expect(hybridViewerStoreMock.setZScaling).toHaveBeenCalledWith(1.5)

    expect(dataStyleStoreMock.importStores).toHaveBeenCalledWith(
      snapshotMock.dataStyle,
    )
    expect(dataStyleStoreMock.applyAllStylesFromState).toHaveBeenCalled()

    expect(dataBaseStoreMock.registerObject).toHaveBeenCalledWith("abc123")
    expect(dataBaseStoreMock.addItem).toHaveBeenCalledWith(
      "abc123",
      expect.objectContaining({
        viewer_type: "mesh",
        geode_object_type: "PointSet2D",
        name: "My Data",
      }),
    )
    expect(treeviewStoreMock.addItem).toHaveBeenCalledWith(
      "PointSet2D",
      "My Data",
      "abc123",
      "mesh",
    )
    expect(hybridViewerStoreMock.addItem).toHaveBeenCalledWith("abc123")
    expect(dataStyleStoreMock.addDataStyle).toHaveBeenCalledWith(
      "abc123",
      "PointSet2D",
    )
    expect(dataStyleStoreMock.applyDefaultStyle).toHaveBeenCalledWith("abc123")

    expect(hybridViewerStoreMock.remoteRender).toHaveBeenCalled()
  })
})

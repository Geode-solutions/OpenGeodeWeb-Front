import { describe, expect, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

import { useAppStore } from "@ogw_front/stores/app"
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
import { useTreeviewStore } from "@ogw_front/stores/treeview"

import { database } from "../../../internal/database/database.js"

const PANEL_WIDTH = 320
const Z_SCALE = 1.5
const STORES_SLICE_START = 1

vi.mock("../../../internal/utils/viewer_call", () => ({
  viewer_call: vi.fn(async () => {
    await Promise.resolve()
  }),
}))
vi.mock("../../../app/stores/hybrid_viewer", () => ({
  useHybridViewerStore: () => ({
    $id: "hybridViewer",
    addItem: vi.fn(),
    clear: vi.fn(),
    initHybridViewer: vi.fn(),
    load: vi.fn(),
    save: vi.fn(),
    setZScaling: vi.fn(),
  }),
}))

const snapshot = {
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
    items: [{ title: "PointSet2D", children: [] }],
    selection: [],
    components_selection: [],
    isAdditionnalTreeDisplayed: false,
    panelWidth: PANEL_WIDTH,
    model_id: "",
    isTreeCollection: false,
    selectedTree: undefined,
  },
  dataStyle: { styles: { abc123: { some: "style" } } },
  hybridViewer: { zScale: Z_SCALE },
}

describe("project import", () => {
  function setup() {
    setActivePinia(
      createTestingPinia({
        stubActions: false,
        createSpy: vi.fn,
      }),
    )
    const stores = {
      app: useAppStore(),
      dataBase: useDataStore(),
      treeview: useTreeviewStore(),
      dataStyle: useDataStyleStore(),
      hybrid: useHybridViewerStore(),
    }
    const storesArray = Object.values(stores)
    for (const store of storesArray.slice(STORES_SLICE_START)) {
      stores.app.registerStore(store)
    }
    return { stores }
  }

  test("app.importStores restores stores", async () => {
    const { stores } = setup()

    vi.spyOn(stores.dataBase, "importStores").mockImplementation(
      async (snapshot) => {
        const { items } = snapshot
        await Promise.all(items.map((item) => database.data.put(item)))
      },
    )

    await stores.app.importStores(snapshot)

    const item = await database.data.get("abc123")
    expect(item).toBeDefined()
    expect(item.id).toBe("abc123")
    expect(stores.dataStyle.styles.abc123).toBeDefined()
  })
})

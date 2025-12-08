import { beforeEach, describe, expect, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

import { useTreeviewStore } from "@ogw_front/stores/treeview"
import { useAppStore } from "@ogw_front/stores/app"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
import { useDataBaseStore } from "@ogw_front/stores/database"

vi.mock("../../../internal/utils/viewer_call.js", () => ({
  viewer_call: vi.fn(() => Promise.resolve()),
}))
vi.mock("@/stores/hybrid_viewer.js", () => ({
  useHybridViewerStore: () => ({
    $id: "hybridViewer",
    initHybridViewer: vi.fn(),
    clear: vi.fn(),
    addItem: vi.fn(),
    setZScaling: vi.fn(),
    save: vi.fn(),
    load: vi.fn(),
  }),
}))

beforeEach(() => {
  setActivePinia(
    createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    }),
  )
})

describe("Project import", () => {
  test("app.importStores restores stores", async () => {
    const stores = {
      app: useAppStore(),
      dataBase: useDataBaseStore(),
      treeview: useTreeviewStore(),
      dataStyle: useDataStyleStore(),
      hybrid: useHybridViewerStore(),
    }
    Object.values(stores)
      .slice(1)
      .forEach((store) => stores.app.registerStore(store))

    vi.spyOn(stores.dataBase, "importStores").mockImplementation(
      async (snapshot) => {
        for (const [id, item] of Object.entries(snapshot?.db || {})) {
          stores.dataBase.db[id] = item
        }
      },
    )

    const snapshot = {
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
        items: [{ title: "PointSet2D", children: [] }],
        selection: [],
        components_selection: [],
        isAdditionnalTreeDisplayed: false,
        panelWidth: 320,
        model_id: "",
        isTreeCollection: false,
        selectedTree: null,
      },
      dataStyle: { styles: { abc123: { some: "style" } } },
      hybridViewer: { zScale: 1.5 },
    }

    await stores.app.importStores(snapshot)

    expect(stores.dataBase.db.abc123).toBeDefined()
    expect(stores.dataStyle.styles.abc123).toBeDefined()
  })
})

import { beforeEach, describe, expect, test, vi } from "vitest"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { useAppStore } from "@/stores/app.js"
import { useDataBaseStore } from "@/stores/data_base.js"
import { useTreeviewStore } from "@/stores/treeview.js"
import { useDataStyleStore } from "@/stores/data_style.js"
import { useHybridViewerStore } from "@/stores/hybrid_viewer.js"
import { viewer_call } from "@/composables/viewer_call.js"

vi.mock("@/composables/viewer_call.js", () => ({
  default: vi.fn(() => Promise.resolve({})),
  viewer_call: vi.fn(() => Promise.resolve({})),
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

    const snapshot = {
      dataBase: {
        db: {
          abc123: {
            object_type: "mesh",
            geode_object: "PointSet2D",
            native_filename: "native.ext",
            viewable_filename: "viewable.ext",
            displayed_name: "My Data",
            vtk_js: { binary_light_viewable: "VGxpZ2h0RGF0YQ==" },
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

    console.log("[TEST ProjectImport] Snapshot keys:", Object.keys(snapshot))
    console.log(
      "[TEST ProjectImport] treeview snapshot:",
      JSON.stringify(snapshot.treeview, null, 2),
    )
    console.log(
      "[TEST ProjectImport] dataStyle snapshot:",
      JSON.stringify(snapshot.dataStyle, null, 2),
    )

    await stores.app.importStores(snapshot)

    console.log(
      "[TEST ProjectImport] Treeview items after import:",
      JSON.stringify(stores.treeview.items, null, 2),
    )
    console.log(
      "[TEST ProjectImport] Styles after import:",
      JSON.stringify(stores.dataStyle.styles, null, 2),
    )

    expect(stores.dataBase.db.abc123).toBeDefined()
    expect(stores.treeview.items.length).toBe(1)
    expect(stores.dataStyle.styles.abc123).toBeDefined()
    expect(viewer_call).toHaveBeenCalled()
  })
})

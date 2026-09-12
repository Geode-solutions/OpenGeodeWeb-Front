import { beforeEach, describe, expect, test, vi } from "vitest";

import { useAppStore } from "@ogw_front/stores/app";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

import { database } from "@ogw_internal/database/database.js";
import { setupActivePinia } from "@ogw_tests/utils";

const PANEL_WIDTH = 320;
const Z_SCALE = 1.5;
const STORES_SLICE_START = 1;

vi.mock(import("@ogw_internal/utils/viewer_call"), () => ({
  viewer_call: vi.fn(async () => {
    await Promise.resolve();
  }),
}));
vi.mock(import("@ogw_front/stores/hybrid_viewer"), () => ({
  useHybridViewerStore: () => ({
    $id: "hybridViewer",
    initHybridViewer: vi.fn(),
    clear: vi.fn(),
    addItem: vi.fn(),
    setZScaling: vi.fn(),
    save: vi.fn(),
    load: vi.fn(),
  }),
}));

describe("project import", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("app.importStores restores stores", async () => {
    const stores = {
      app: useAppStore(),
      dataBase: useDataStore(),
      treeview: useTreeviewStore(),
      dataStyle: useDataStyleStore(),
      hybrid: useHybridViewerStore(),
    };

    // NOTE: the real `useDataStore().importStores` now expects
    // `{ modelComponents, modelComponentsRelations }` (see app/stores/data.ts), not the
    // `{ items }` shape mocked here. This spy fully replaces the implementation for this
    // Test, so it still exercises the intended behavior at runtime, but the mismatch with
    // The current store signature suggests this test (and/or the store) may be stale -
    // Flagging for review rather than silently changing behavior during the TS migration.
    vi.spyOn(stores.dataBase, "importStores").mockImplementation(
      (async (snapshot: { items: Record<string, unknown>[] }) => {
        const { items } = snapshot;
        await Promise.all(items.map((item) => database.data.put(item)));
      }) as typeof stores.dataBase.importStores,
    );

    const storesArray = Object.values(stores);
    for (const store of storesArray.slice(STORES_SLICE_START)) {
      stores.app.registerStore(store as Parameters<typeof stores.app.registerStore>[0]);
    }

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
      dataStyle: {
        styles: { abc123: { some: "style" } },
        componentStyles: {},
      },
      hybridViewer: { zScale: Z_SCALE },
    };

    await stores.app.importStores(snapshot);

    const item = await database.data.get("abc123");
    expect(item).toBeDefined();
    expect(item?.id).toBe("abc123");

    const style = await database.data_style.get("abc123");
    expect(style).toBeDefined();
    expect(style?.id).toBe("abc123");
  });
});

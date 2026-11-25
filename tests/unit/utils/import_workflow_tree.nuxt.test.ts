// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { type Mock, describe, expect, test, vi } from "vitest";

// Local imports
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import { importFile } from "@ogw_front/utils/import_workflow";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

vi.setConfig({ testTimeout: 10_000 });

const SURFACE = { id: "surface", name: "surface", viewer_object_type: "mesh" };

function setup(): { request: Mock; addHybridItem: Mock } {
  const backStore = useBackStore();
  const dataStore = useDataStore();
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();
  const request = vi.fn().mockResolvedValue({ data: [SURFACE] });
  const addHybridItem = vi.fn();
  backStore.request = mockAs<typeof backStore.request>(request);
  dataStore.addItem = mockAs<typeof dataStore.addItem>(vi.fn().mockResolvedValue(undefined));
  dataStore.fetchIsViewable = mockAs<typeof dataStore.fetchIsViewable>(
    vi.fn().mockResolvedValue(true),
  );
  dataStore.registerObject = mockAs<typeof dataStore.registerObject>(vi.fn());
  dataStyleStore.addDataStyle = mockAs<typeof dataStyleStore.addDataStyle>(vi.fn());
  dataStyleStore.applyDefaultStyle = mockAs<typeof dataStyleStore.applyDefaultStyle>(vi.fn());
  hybridViewerStore.addItem = mockAs<typeof hybridViewerStore.addItem>(addHybridItem);
  return { request, addHybridItem };
}

function isLoading(dataId: string): boolean | undefined {
  return useTreeviewStore()
    .items.flatMap((group) => group.children)
    .find((child) => child.id === dataId)?.loading;
}

describe("import progress in the object tree", () => {
  setupActivePinia();

  test("shows the file as pending in the tree until its objects arrive", async () => {
    const { request } = setup();
    const treeviewStore = useTreeviewStore();
    const { promise, resolve } = Promise.withResolvers<unknown>();
    request.mockReturnValueOnce(promise);

    const importing = importFile("folder/surface.vtp", "PolygonalSurface3D");

    expect(treeviewStore.pendingImports).toStrictEqual([
      expect.objectContaining({
        title: "surface.vtp",
        geode_object_type: "PolygonalSurface3D",
        loading: true,
      }),
    ]);
    resolve({ data: [SURFACE] });
    await importing;
    expect(treeviewStore.pendingImports).toStrictEqual([]);
  });

  test("the pending file leaves the tree when its conversion fails", async () => {
    const { request } = setup();
    request.mockRejectedValueOnce(new Error("conversion failed"));

    await expect(importFile("broken.vtp", "PolygonalSurface3D")).rejects.toThrow(
      "conversion failed",
    );
    expect(useTreeviewStore().pendingImports).toStrictEqual([]);
  });

  test("an object shows as loading until it is in the viewer", async () => {
    const { request, addHybridItem } = setup();
    request.mockResolvedValueOnce({ data: [{ ...SURFACE, id: "slow_surface" }] });
    const loadingStates: (boolean | undefined)[] = [];
    addHybridItem.mockImplementation(() => {
      loadingStates.push(isLoading("slow_surface"));
    });

    await importFile("surface.vtp", "PolygonalSurface3D");

    expect(loadingStates).toStrictEqual([true]);
    expect(isLoading("slow_surface")).toBe(false);
  });

  test("an object stops loading when its import fails", async () => {
    const { request, addHybridItem } = setup();
    request.mockResolvedValueOnce({ data: [{ ...SURFACE, id: "broken_surface" }] });
    addHybridItem.mockRejectedValueOnce(new Error("viewer failed"));

    await expect(importFile("surface.vtp", "PolygonalSurface3D")).rejects.toThrow("viewer failed");
    expect(isLoading("broken_surface")).toBe(false);
  });
});

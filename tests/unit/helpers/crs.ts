import { type DataItem, useDataStore } from "@ogw_front/stores/data";
import { type MockInstance, vi } from "vitest";
import { setDataItems } from "@ogw_tests/unit/stores/data_helpers";
import { useBackStore } from "@ogw_front/stores/back";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
const UTM = { authority: "EPSG", code: "32631", name: "WGS 84 / UTM zone 31N" };
const item: DataItem = {
  data_id: "item-1",
  geode_id: "00000000-0000-0000-0000-000000000001",
  name: "Points",
  geode_object_type: "PointSet3D",
  viewer_object_type: "mesh",
  visible: true,
  created_at: "",
};

// Oldest first: a and c in Lambert-93, b already in UTM, local1 and local2 without CRS
function projectItems(): DataItem[] {
  return [
    { ...item, data_id: "a", created_at: "1", crs: LAMBERT },
    { ...item, data_id: "b", created_at: "2", crs: UTM },
    { ...item, data_id: "c", created_at: "3", crs: LAMBERT },
    { ...item, data_id: "local1", created_at: "4" },
    { ...item, data_id: "local2", created_at: "5" },
  ];
}

// The crs store reads the data when it is created: mocked first
function mockCrsItems(items: DataItem[]): void {
  setDataItems(items);
}

type BackRequest = ReturnType<typeof useBackStore>["request"];
type FocusCamera = ReturnType<typeof useHybridViewerStore>["focusCameraOnObject"];

interface CrsStubs {
  request: MockInstance<BackRequest>;
  focusCameraOnObject: MockInstance<FocusCamera>;
}

// To call in beforeEach, after setupActivePinia(). Shares its call log with the reloadObject mock.
function stubCrsStores(calls: string[]): CrsStubs {
  calls.length = 0;
  const request = vi.spyOn(useBackStore(), "request").mockImplementation(async () => {
    calls.push("request");
    await Promise.resolve();
    return { binary_light_viewable: "light", crs: LAMBERT };
  });
  vi.spyOn(useDataStore(), "updateItem").mockImplementation(async () => {
    calls.push("update");
    await Promise.resolve();
  });
  const focusCameraOnObject = vi
    .spyOn(useHybridViewerStore(), "focusCameraOnObject")
    .mockImplementation(async () => {
      calls.push("focus");
      await Promise.resolve();
    });
  return { request, focusCameraOnObject };
}

export {
  type BackRequest,
  type CrsStubs,
  type FocusCamera,
  LAMBERT,
  UTM,
  item,
  mockCrsItems,
  projectItems,
  stubCrsStores,
};

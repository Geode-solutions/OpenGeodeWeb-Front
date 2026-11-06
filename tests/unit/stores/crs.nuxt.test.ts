// oxlint-disable vitest/require-mock-type-parameters
import { type DataItem, useDataStore } from "@ogw_front/stores/data";
import { type Ref, nextTick, ref } from "vue";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useCrsStore } from "@ogw_front/stores/crs";

vi.setConfig({ testTimeout: 10_000 });

const EXPECTED_REQUESTS = 1;
const CRS_LIST = [{ authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" }];

function mockItems(items: DataItem[]): Ref<DataItem[]> {
  const data = ref(items);
  const dataStore = useDataStore();
  dataStore.refCrsItems = mockAs<typeof dataStore.refCrsItems>(() => data);
  return data;
}

describe("crs store", () => {
  beforeEach(() => {
    setupActivePinia();
    mockItems([]);
  });

  test("loads the geographic list once, whatever the object type", async () => {
    const request = vi.fn().mockResolvedValue({ crs_list: CRS_LIST });
    const backStore = useBackStore();
    backStore.request = mockAs<typeof backStore.request>(request);
    const crsStore = useCrsStore();

    const [first, second] = await Promise.all([
      crsStore.geographicList("PointSet3D"),
      crsStore.geographicList("PointSet3D"),
    ]);
    // The same list for 2D and 3D data: another type does not request it again
    await crsStore.geographicList("BRep");
    await crsStore.geographicList("PointSet2D");

    expect(first).toStrictEqual(CRS_LIST);
    expect(second).toStrictEqual(CRS_LIST);
    expect(request).toHaveBeenCalledTimes(EXPECTED_REQUESTS);
  });

  test("does not cache a failed request", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ crs_list: CRS_LIST });
    const backStore = useBackStore();
    backStore.request = mockAs<typeof backStore.request>(request);
    const crsStore = useCrsStore();

    await expect(crsStore.geographicList("BRep")).resolves.toStrictEqual([]);
    await expect(crsStore.geographicList("BRep")).resolves.toStrictEqual(CRS_LIST);
  });

  test("does not cache a rejected request", async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error("back disconnected"))
      .mockResolvedValueOnce({ crs_list: CRS_LIST });
    const backStore = useBackStore();
    backStore.request = mockAs<typeof backStore.request>(request);
    const crsStore = useCrsStore();

    await expect(crsStore.geographicList("Section")).resolves.toStrictEqual([]);
    await expect(crsStore.geographicList("Section")).resolves.toStrictEqual(CRS_LIST);
  });

  test("forwards an edit request until it is cleared", () => {
    const crsStore = useCrsStore();
    expect(crsStore.crsEditEnabled).toBe(false);
    crsStore.enableCrsEdit();
    crsStore.requestCrsEdit("data-1");
    expect(crsStore.crsEditEnabled).toBe(true);
    expect(crsStore.crsEditRequest).toBe("data-1");
    crsStore.clearCrsEditRequest();
    expect(crsStore.crsEditRequest).toBeUndefined();
  });
});

const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
const UTM = { authority: "EPSG", code: "32631", name: "WGS 84 / UTM zone 31N" };

describe("project crs", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("follows when every georeferenced data is in one crs", async () => {
    const data = mockItems([]);
    const crsStore = useCrsStore();
    data.value = mockAs<DataItem[]>([{ data_id: "a", created_at: "1", crs: LAMBERT }]);
    await nextTick();
    expect(crsStore.projectCrs).toStrictEqual(LAMBERT);
    // One data converted alone: mixed, the project keeps its crs
    data.value = mockAs<DataItem[]>([
      { data_id: "a", created_at: "1", crs: UTM },
      { data_id: "b", created_at: "2", crs: LAMBERT },
      { data_id: "local", created_at: "3" },
    ]);
    await nextTick();
    expect(crsStore.projectCrs).toStrictEqual(LAMBERT);
    data.value = mockAs<DataItem[]>([
      { data_id: "a", created_at: "1", crs: UTM },
      { data_id: "b", created_at: "2", crs: UTM },
      { data_id: "local", created_at: "3" },
    ]);
    await nextTick();
    expect(crsStore.projectCrs).toStrictEqual(UTM);
  });

  test("an imported project crs is kept while the data are mixed", async () => {
    mockItems(
      mockAs<DataItem[]>([
        { data_id: "a", created_at: "1", crs: LAMBERT },
        { data_id: "b", created_at: "2", crs: UTM },
      ]),
    );
    const crsStore = useCrsStore();
    crsStore.importStores({ projectCrs: UTM });
    await nextTick();
    expect(crsStore.projectCrs).toStrictEqual(UTM);
  });

  test("lists the data in another crs than the project", () => {
    mockItems(
      mockAs<DataItem[]>([
        { data_id: "a", created_at: "1", crs: LAMBERT },
        { data_id: "b", created_at: "2", crs: UTM },
        { data_id: "local", created_at: "3" },
      ]),
    );
    const crsStore = useCrsStore();
    // Data without CRS too: they could not follow the project
    expect([...crsStore.mismatchedCrs.entries()]).toStrictEqual([
      ["b", UTM],
      ["local", undefined],
    ]);
  });

  test("is exported and imported with the project", () => {
    mockItems(mockAs<DataItem[]>([{ data_id: "a", created_at: "1", crs: LAMBERT }]));
    const crsStore = useCrsStore();
    crsStore.setProjectCrs(UTM);
    expect(crsStore.exportStores()).toStrictEqual({ projectCrs: UTM });
    crsStore.reset();
    expect(crsStore.projectCrs).toBeUndefined();
    crsStore.importStores({ projectCrs: UTM });
    expect(crsStore.projectCrs).toStrictEqual(UTM);
  });

  test("a project saved without it takes the crs of its oldest georeferenced data", () => {
    mockItems(
      mockAs<DataItem[]>([
        { data_id: "b", created_at: "2", crs: UTM },
        { data_id: "a", created_at: "1", crs: LAMBERT },
      ]),
    );
    const crsStore = useCrsStore();
    crsStore.reset();
    crsStore.importStores(undefined);
    expect(crsStore.projectCrs).toStrictEqual(LAMBERT);
  });

  test("forwards a project crs edit request until it is cleared", () => {
    mockItems([]);
    const crsStore = useCrsStore();
    crsStore.requestProjectCrsEdit();
    expect(crsStore.projectCrsEditRequest).toBe(true);
    crsStore.clearProjectCrsEditRequest();
    expect(crsStore.projectCrsEditRequest).toBe(false);
  });
});

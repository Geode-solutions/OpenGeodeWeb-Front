// oxlint-disable vitest/require-mock-type-parameters, no-magic-numbers, max-lines
import { type DataItem, useDataStore } from "@ogw_front/stores/data";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

vi.setConfig({ testTimeout: 10_000 });

const OPAQUE = { satellite: 1, streets: 1, topo: 1 };
const AROUND = { satellite: true, streets: true, topo: true };
const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
const REBUILD_DELAY = 500;
const HALF_DELAY = 100;
const ONCE = 1;
const TWICE = 2;
const THRICE = 3;
const BOX_A = [0, 10, 0, 20, -5, 5];
const BOX_B = [5, 30, -10, 10, 0, 1];
// Data ids in hybridDb: a and c are georeferenced, b is still in local coordinates
const FIRST_DATA = "a";
const LOCAL_DATA = "b";
const SECOND_DATA = "c";
const DELETE_ROUTE = back_schemas.opengeodeweb_back.basemap.delete.$id;

function fakeActor(bounds: number[]): unknown {
  return { polydata: { getBounds: () => bounds } };
}

function buildResponse(id: string): Record<string, unknown> {
  return {
    id,
    name: "basemap",
    tiles_folder: "tiles",
    columns: 2,
    rows: 3,
    attribution: "Powered by Esri | test",
  };
}

function georeferenced(): DataItem[] {
  return mockAs<DataItem[]>([
    { id: "a", created_at: "1", crs: LAMBERT },
    { id: "b", created_at: "2" },
    { id: "c", created_at: "3", crs: LAMBERT },
  ]);
}

describe("basemap store", () => {
  let backRequest = vi.fn();
  let deleteRequest = vi.fn();
  let remoteRender = vi.fn();
  let viewerRequest = vi.fn();
  let registerObject = vi.fn();
  let deregisterObject = vi.fn();
  let items = ref<DataItem[]>([]);

  function setup(): ReturnType<typeof useBasemapStore> {
    setupActivePinia();
    backRequest = vi.fn().mockResolvedValue(buildResponse("basemap-1"));
    deleteRequest = vi.fn().mockResolvedValue({});
    remoteRender = vi.fn().mockResolvedValue(undefined);
    viewerRequest = vi.fn().mockResolvedValue({});
    registerObject = vi.fn().mockResolvedValue({});
    deregisterObject = vi.fn().mockResolvedValue({});
    items = ref(georeferenced());

    const backStore = useBackStore();
    // Builds and deletions are spied apart: build counts stay readable.
    // This test's own spies: a debounced rebuild left by a previous test must not reach them.
    const buildSpy = backRequest;
    const deleteSpy = deleteRequest;
    backStore.request = mockAs<typeof backStore.request>(
      async (request: { schema: { $id: string } }): Promise<unknown> => {
        const spy = request.schema.$id === DELETE_ROUTE ? deleteSpy : buildSpy;
        const result: unknown = await spy(request);
        return result;
      },
    );
    const viewerStore = useViewerStore();
    viewerStore.request = mockAs<typeof viewerStore.request>(viewerRequest);
    const dataStore = useDataStore();
    dataStore.refCrsItems = mockAs<typeof dataStore.refCrsItems>(() => items);
    dataStore.registerObject = mockAs<typeof dataStore.registerObject>(registerObject);
    dataStore.deregisterObject = mockAs<typeof dataStore.deregisterObject>(deregisterObject);
    const hybridViewerStore = useHybridViewerStore();
    hybridViewerStore.remoteRender = mockAs<typeof hybridViewerStore.remoteRender>(remoteRender);
    Object.assign(hybridViewerStore.hybridDb, {
      [FIRST_DATA]: fakeActor(BOX_A),
      [SECOND_DATA]: fakeActor(BOX_B),
    });
    return useBasemapStore();
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("setStyle builds the basemap from the data bounds and the project crs", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    expect(backRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        params: {
          style: "satellite",
          bounds: { x_min: 0, y_min: -10, x_max: 30, y_max: 20 },
          crs: LAMBERT,
          z: 5,
        },
      }),
    );
    expect(registerObject).toHaveBeenCalledWith("basemap-1", "basemap");
    expect(viewerRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { id: "basemap-1", tiles_folder: "tiles", columns: 2, rows: 3, layer: 0 },
      }),
    );
    expect(store.basemapIds.satellite).toBe("basemap-1");
    expect(store.attribution).toBe("Powered by Esri | test");
  });

  test("data without crs is left out of the bounds", async () => {
    const store = setup();
    // Data still in local coordinates would stretch the basemap far from the georeferenced data
    Object.assign(useHybridViewerStore().hybridDb, {
      [LOCAL_DATA]: fakeActor([0, 1e9, 0, 1e9, -1e9, 0]),
    });
    await store.setMaps(["satellite"]);
    const params: unknown = expect.objectContaining({
      bounds: { x_min: 0, y_min: -10, x_max: 30, y_max: 20 },
      z: 5,
    });
    expect(backRequest).toHaveBeenCalledWith(expect.objectContaining({ params }));
  });

  test("rebuilds when georeferenced data moves without a crs change", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    expect(backRequest).toHaveBeenCalledTimes(ONCE);
    // A re-align keeps the CRS but rebuilds the local actor at the new place
    Object.assign(useHybridViewerStore().hybridDb, {
      [FIRST_DATA]: fakeActor([100, 110, 100, 120, -5, 5]),
    });
    await nextTick();
    await vi.advanceTimersByTimeAsync(REBUILD_DELAY);
    expect(backRequest).toHaveBeenCalledTimes(TWICE);
    const params: unknown = expect.objectContaining({
      bounds: { x_min: 5, y_min: -10, x_max: 110, y_max: 120 },
    });
    expect(backRequest).toHaveBeenLastCalledWith(expect.objectContaining({ params }));
  });

  test("the first build renders the viewer", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    // No previous basemap to remove: the build itself must render
    expect(remoteRender).toHaveBeenCalledWith();
  });

  test("none removes the basemap", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    await store.setMaps([]);
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-1" } }),
    );
    // The viewer lets the mesh go before the back deletes its files
    expect(deregisterObject).toHaveBeenCalledBefore(deleteRequest);
    expect(store.basemapIds.satellite).toBeUndefined();
    expect(store.attribution).toBeUndefined();
  });

  test("a newer build makes the running one obsolete", async () => {
    const store = setup();
    const slow = Promise.withResolvers();
    backRequest.mockReturnValueOnce(slow.promise).mockResolvedValueOnce(buildResponse("basemap-2"));
    const first = store.setMaps(["satellite"]);
    await store.setMaps(["topo"]);
    slow.resolve(buildResponse("basemap-1"));
    await first;
    expect(store.basemapIds.topo).toBe("basemap-2");
    expect(registerObject).not.toHaveBeenCalledWith("basemap-1", "basemap");
    // Never registered in the viewer: only its back data is deleted
    expect(deregisterObject).not.toHaveBeenCalledWith("basemap-1");
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-1" } }),
    );
    expect(store.loading).toBe(false);
  });

  test("rebuilds once, 500 ms after the data changed", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    expect(backRequest).toHaveBeenCalledTimes(ONCE);
    items.value = [...georeferenced(), mockAs<DataItem>({ id: "c", created_at: "3" })];
    await nextTick();
    vi.advanceTimersByTime(HALF_DELAY);
    items.value = [...georeferenced(), mockAs<DataItem>({ id: "d", created_at: "4" })];
    await nextTick();
    await vi.advanceTimersByTimeAsync(REBUILD_DELAY);
    expect(backRequest).toHaveBeenCalledTimes(TWICE);
    await vi.advanceTimersByTimeAsync(REBUILD_DELAY);
    expect(backRequest).toHaveBeenCalledTimes(TWICE);
  });

  test("removes the basemap when no data is georeferenced anymore", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    expect(store.available).toBe(true);
    items.value = mockAs<DataItem[]>([{ id: "a", created_at: "1" }]);
    await nextTick();
    await vi.advanceTimersByTimeAsync(REBUILD_DELAY);
    expect(deregisterObject).toHaveBeenCalledWith("basemap-1");
    expect(store.basemapIds.satellite).toBeUndefined();
    // No data in the project CRS: no map, so no Basemap category either
    expect(store.available).toBe(false);
  });

  test("exports the visible maps and the opacities, rebuilds on import", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    expect(store.exportStores()).toStrictEqual({
      maps: ["satellite"],
      opacities: OPAQUE,
      around: AROUND,
    });
    await store.importStores({ maps: ["topo"], opacities: OPAQUE });
    const topoParams: unknown = expect.objectContaining({ style: "topo" });
    expect(backRequest).toHaveBeenLastCalledWith(expect.objectContaining({ params: topoParams }));
  });

  test("a build finishing its apply after the basemap was hidden is discarded", async () => {
    const store = setup();
    const apply = Promise.withResolvers();
    viewerRequest.mockReturnValueOnce(apply.promise);
    const building = store.setMaps(["satellite"]);
    await vi.waitFor(() => {
      expect(viewerRequest).toHaveBeenCalledTimes(ONCE);
    });
    await store.setMaps([]);
    apply.resolve({});
    await building;
    expect(deregisterObject).toHaveBeenCalledWith("basemap-1");
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-1" } }),
    );
    expect(store.basemapIds.satellite).toBeUndefined();
    expect(store.attribution).toBeUndefined();
  });

  test("builds once the data gets displayed after an import without data", async () => {
    const store = setup();
    const { hybridDb } = useHybridViewerStore();
    for (const key of Object.keys(hybridDb)) {
      Reflect.deleteProperty(hybridDb, key);
    }
    await store.importStores({ style: "satellite" });
    expect(backRequest).not.toHaveBeenCalled();
    Object.assign(hybridDb, { [FIRST_DATA]: fakeActor(BOX_A) });
    await nextTick();
    await vi.advanceTimersByTimeAsync(REBUILD_DELAY);
    expect(backRequest).toHaveBeenCalledTimes(ONCE);
    expect(store.basemapIds.satellite).toBe("basemap-1");
  });

  test("a failed apply removes the new basemap and goes back to none", async () => {
    const store = setup();
    viewerRequest.mockRejectedValueOnce(new Error("apply failed"));
    await store.setMaps(["satellite"]);
    expect(deregisterObject).toHaveBeenCalledWith("basemap-1");
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-1" } }),
    );
    expect(store.basemapIds.satellite).toBeUndefined();
    expect(store.maps).toStrictEqual([]);
    expect(store.loading).toBe(false);
  });

  test("a failed build goes back to none and data changes no longer rebuild", async () => {
    const store = setup();
    backRequest.mockRejectedValueOnce(new Error("Basemap unavailable: no API key"));
    await store.setMaps(["satellite"]);
    expect(store.maps).toStrictEqual([]);
    items.value = georeferenced().slice(0, 1);
    await nextTick();
    await vi.advanceTimersByTimeAsync(REBUILD_DELAY);
    expect(backRequest).toHaveBeenCalledTimes(ONCE);
  });

  test("reset forgets the basemap without any request", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    deregisterObject.mockClear();
    store.reset();
    expect(store.basemapIds.satellite).toBeUndefined();
    expect(store.attribution).toBeUndefined();
    expect(store.loading).toBe(false);
    expect(deregisterObject).not.toHaveBeenCalled();
    expect(deleteRequest).not.toHaveBeenCalled();
  });

  test("reset makes the builds in flight obsolete", async () => {
    const store = setup();
    const slow = Promise.withResolvers();
    backRequest.mockReturnValueOnce(slow.promise);
    const building = store.setMaps(["satellite"]);
    store.reset();
    slow.resolve(buildResponse("basemap-1"));
    await building;
    expect(registerObject).not.toHaveBeenCalled();
    // The previous project's back was already cleared
    expect(deleteRequest).not.toHaveBeenCalled();
    expect(store.basemapIds.satellite).toBeUndefined();
  });

  test("setOpacity asks the viewer without building again", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    viewerRequest.mockClear();
    remoteRender.mockClear();
    await store.setOpacity("satellite", 0.5);
    expect(store.opacities.satellite).toBe(0.5);
    expect(viewerRequest).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ params: { id: "basemap-1", opacity: 0.5 } }),
    );
    expect(remoteRender).toHaveBeenCalledTimes(ONCE);
    expect(backRequest).toHaveBeenCalledTimes(ONCE);
  });

  test("setOpacity without basemap only stores the value", async () => {
    const store = setup();
    await store.setOpacity("satellite", 0.4);
    expect(store.opacities.satellite).toBe(0.4);
    expect(viewerRequest).not.toHaveBeenCalled();
  });

  test("a rebuild applies the opacity again", async () => {
    const store = setup();
    await store.setOpacity("satellite", 0.5);
    await store.setMaps(["satellite"]);
    // Apply, drape, then opacity
    expect(viewerRequest).toHaveBeenCalledTimes(THRICE);
    expect(viewerRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ params: { id: "basemap-1", opacity: 0.5 } }),
    );
  });

  test("a full opacity is not applied after a build", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    // Apply and drape only
    expect(viewerRequest).toHaveBeenCalledTimes(TWICE);
  });

  test("each map keeps its own opacity, only the visible ones reach the viewer", async () => {
    const store = setup();
    await store.setMaps(["streets"]);
    await store.setOpacity("streets", 0.4);
    await store.setOpacity("topo", 0.7);
    expect(viewerRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-1", opacity: 0.4 } }),
    );
    // Topo is hidden: its opacity waits until it is shown
    const topoOpacity: unknown = expect.objectContaining({ opacity: 0.7 });
    expect(viewerRequest).not.toHaveBeenCalledWith(
      expect.objectContaining({ params: topoOpacity }),
    );
    backRequest.mockResolvedValueOnce(buildResponse("basemap-2"));
    await store.setMaps(["streets", "topo"]);
    expect(viewerRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-2", opacity: 0.7 } }),
    );
  });

  test("hiding keeps the last maps", async () => {
    const store = setup();
    await store.setMaps(["topo", "satellite"]);
    await store.setMaps([]);
    expect(store.maps).toStrictEqual([]);
    expect(store.shown).toStrictEqual(["satellite", "topo"]);
  });

  test("maps shown together are built apart and stacked in a fixed order", async () => {
    const store = setup();
    backRequest
      .mockResolvedValueOnce(buildResponse("basemap-1"))
      .mockResolvedValueOnce(buildResponse("basemap-2"));
    await store.setMaps(["streets", "satellite"]);
    expect(store.maps).toStrictEqual(["satellite", "streets"]);
    expect(store.basemapIds).toStrictEqual({ satellite: "basemap-1", streets: "basemap-2" });
    // Satellite at the bottom, streets on top
    const bottom: unknown = expect.objectContaining({ id: "basemap-1", layer: 0 });
    const top: unknown = expect.objectContaining({ id: "basemap-2", layer: 2 });
    expect(viewerRequest).toHaveBeenCalledWith(expect.objectContaining({ params: bottom }));
    expect(viewerRequest).toHaveBeenCalledWith(expect.objectContaining({ params: top }));
    // Both from the same provider: credited once
    expect(store.attribution).toBe("Powered by Esri | test");
  });

  test("unchecking one map removes only that map", async () => {
    const store = setup();
    backRequest
      .mockResolvedValueOnce(buildResponse("basemap-1"))
      .mockResolvedValueOnce(buildResponse("basemap-2"));
    await store.setMaps(["satellite", "topo"]);
    backRequest.mockClear();
    await store.setMaps(["satellite"]);
    expect(deregisterObject).toHaveBeenCalledExactlyOnceWith("basemap-2");
    expect(backRequest).not.toHaveBeenCalled();
    expect(store.basemapIds.satellite).toBe("basemap-1");
    expect(store.basemapIds.topo).toBeUndefined();
  });

  test("a failed map is unchecked, the other maps stay", async () => {
    const store = setup();
    backRequest
      .mockResolvedValueOnce(buildResponse("basemap-1"))
      .mockRejectedValueOnce(new Error("Basemap unavailable"));
    await store.setMaps(["satellite", "topo"]);
    expect(store.maps).toStrictEqual(["satellite"]);
    expect(store.basemapIds.satellite).toBe("basemap-1");
  });

  test("imports the visible maps and the opacity of each map", async () => {
    const store = setup();
    await store.importStores({ maps: [], opacities: { streets: 0.5 } });
    expect(store.maps).toStrictEqual([]);
    expect(store.opacities).toStrictEqual({ satellite: 1, streets: 0.5, topo: 1 });
  });

  test("a project with a single visible map shows that map", async () => {
    const store = setup();
    await store.importStores({ style: "topo", opacities: OPAQUE, around: false });
    expect(store.maps).toStrictEqual(["topo"]);
    expect(store.around).toStrictEqual({ satellite: false, streets: false, topo: false });
    await store.importStores({ style: "none", opacities: OPAQUE });
    expect(store.maps).toStrictEqual([]);
  });

  test("an old project shows satellite with its single opacity on every map", async () => {
    const store = setup();
    await store.importStores({ style: "none", opacity: 0.4 });
    expect(store.maps).toStrictEqual(["satellite"]);
    expect(store.opacities).toStrictEqual({ satellite: 0.4, streets: 0.4, topo: 0.4 });
  });

  test("drapes on the georeferenced data after each build", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    expect(viewerRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { id: "basemap-1", around: true, data_ids: ["a", "c"] },
      }),
    );
  });

  test("setAround asks the viewer without building again", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    viewerRequest.mockClear();
    remoteRender.mockClear();
    await store.setAround(false);
    expect(store.around).toStrictEqual({ satellite: false, streets: false, topo: false });
    expect(viewerRequest).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        params: { id: "basemap-1", around: false, data_ids: ["a", "c"] },
      }),
    );
    expect(remoteRender).toHaveBeenCalledTimes(ONCE);
    expect(backRequest).toHaveBeenCalledTimes(ONCE);
  });

  test("setAround without basemap only stores the value", async () => {
    const store = setup();
    await store.setAround(false, ["topo"]);
    expect(store.around).toStrictEqual({ ...AROUND, topo: false });
    expect(viewerRequest).not.toHaveBeenCalled();
  });

  test("each map is cropped to the data on its own", async () => {
    const store = setup();
    backRequest
      .mockResolvedValueOnce(buildResponse("basemap-1"))
      .mockResolvedValueOnce(buildResponse("basemap-2"));
    await store.setMaps(["satellite", "topo"]);
    viewerRequest.mockClear();
    await store.setAround(false, ["topo"]);
    expect(viewerRequest).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        params: { id: "basemap-2", around: false, data_ids: ["a", "c"] },
      }),
    );
    expect(store.around).toStrictEqual({ ...AROUND, topo: false });
  });

  test("exports and imports map around", async () => {
    const store = setup();
    await store.setAround(false, ["streets"]);
    expect(store.exportStores()).toStrictEqual({
      maps: ["satellite"],
      opacities: OPAQUE,
      around: { ...AROUND, streets: false },
    });
    await store.importStores({ maps: [] });
    expect(store.around).toStrictEqual(AROUND);
    await store.importStores({ maps: [], around: { topo: false } });
    expect(store.around).toStrictEqual({ ...AROUND, topo: false });
  });

  test("shows satellite on its own once georeferenced data arrives", async () => {
    const store = setup();
    expect(store.maps).toStrictEqual(["satellite"]);
    // No setStyle call: a data change is enough to build the default map
    items.value = georeferenced().slice(0, 1);
    await nextTick();
    await vi.advanceTimersByTimeAsync(REBUILD_DELAY);
    const satelliteParams: unknown = expect.objectContaining({ style: "satellite" });
    expect(backRequest).toHaveBeenCalledWith(expect.objectContaining({ params: satelliteParams }));
  });

  test("data in another crs than the project stays out of the basemap", async () => {
    const store = setup();
    items.value = mockAs<DataItem[]>([
      { id: "a", created_at: "1", crs: LAMBERT },
      { id: "c", created_at: "3", crs: { authority: "EPSG", code: "32631", name: "UTM" } },
    ]);
    await nextTick();
    await store.setMaps(["satellite"]);
    // BOX_A only: c is in UTM
    const boxAParams: unknown = expect.objectContaining({
      bounds: { x_min: 0, x_max: 10, y_min: 0, y_max: 20 },
      z: 5,
    });
    expect(backRequest).toHaveBeenLastCalledWith(expect.objectContaining({ params: boxAParams }));
  });
});

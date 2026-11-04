// oxlint-disable vitest/require-mock-type-parameters, no-magic-numbers, max-lines
import { type DataItem, useDataStore } from "@ogw_front/stores/data";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

vi.setConfig({ testTimeout: 10_000 });

const OPAQUE = { satellite: 1, plan: 1, routes: 1 };
const UNCROPPED = { satellite: false, plan: false, routes: false };
const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
const REBUILD_DELAY = 500;
const HALF_DELAY = 100;
const ONCE = 1;
const TWICE = 2;
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

interface Request {
  schema: { $id: string };
}

function buildResponse(id: string): Record<string, unknown> {
  return {
    id,
    name: "basemap",
    columns: 2,
    rows: 3,
    attribution: "Powered by Esri | test",
    maps: [{ map: "satellite", sources: ["eox_s2cloudless_2016", "ign_orthophotos"] }],
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

  test("setMaps builds the basemap from the data bounds and the project crs", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    expect(backRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        params: {
          maps: ["satellite"],
          bounds: { x_min: 0, y_min: -10, x_max: 30, y_max: 20 },
          crs: LAMBERT,
          z: 5,
        },
      }),
    );
    expect(registerObject).toHaveBeenCalledWith("basemap-1", "basemap");
    expect(viewerRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        params: {
          id: "basemap-1",
          columns: 2,
          rows: 3,
          maps: buildResponse("basemap-1").maps,
          layers: [{ map: "satellite", visible: true, opacity: 1, crop: false }],
        },
      }),
    );
    expect(store.basemapId).toBe("basemap-1");
    expect(store.attribution).toBe("Powered by Esri | test");
  });

  test("the first build drapes the georeferenced data and renders", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    expect(viewerRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-1", data_ids: ["a", "c"] } }),
    );
    // No previous basemap to remove: the build itself must render
    expect(remoteRender).toHaveBeenCalledWith();
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

  test("none removes the basemap", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    await store.setMaps([]);
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-1" } }),
    );
    // The viewer lets the mesh go before the back deletes its files
    expect(deregisterObject).toHaveBeenCalledBefore(deleteRequest);
    expect(store.basemapId).toBeUndefined();
    expect(store.attribution).toBeUndefined();
    // The last maps are kept, to show them again
    expect(store.shown).toStrictEqual(["satellite"]);
  });

  test("a newer build makes the running one obsolete", async () => {
    const store = setup();
    const slow = Promise.withResolvers();
    backRequest.mockReturnValueOnce(slow.promise).mockResolvedValueOnce(buildResponse("basemap-2"));
    const first = store.setMaps(["satellite"]);
    await store.setMaps(["plan"]);
    slow.resolve(buildResponse("basemap-1"));
    await first;
    expect(store.basemapId).toBe("basemap-2");
    expect(registerObject).not.toHaveBeenCalledWith("basemap-1", "basemap");
    // Never registered in the viewer: only its back data is deleted
    expect(deregisterObject).not.toHaveBeenCalledWith("basemap-1");
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-1" } }),
    );
  });

  test("rebuilds once, 500 ms after the data changed", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    expect(backRequest).toHaveBeenCalledTimes(ONCE);
    items.value = [
      ...georeferenced(),
      mockAs<DataItem>({ id: "d", created_at: "4", crs: LAMBERT }),
    ];
    await nextTick();
    vi.advanceTimersByTime(HALF_DELAY);
    items.value = [
      ...georeferenced(),
      mockAs<DataItem>({ id: "e", created_at: "5", crs: LAMBERT }),
    ];
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
    expect(store.basemapId).toBeUndefined();
    // No data in the project CRS: no map, so no Basemap category either
    expect(store.available).toBe(false);
  });

  test("rebuilds on import", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    await store.importStores({ maps: ["routes"], opacities: OPAQUE });
    const params: unknown = expect.objectContaining({ maps: ["routes"] });
    expect(backRequest).toHaveBeenLastCalledWith(expect.objectContaining({ params }));
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
    expect(store.basemapId).toBeUndefined();
    expect(store.attribution).toBeUndefined();
  });

  test("builds once the data gets displayed after an import without data", async () => {
    const store = setup();
    const { hybridDb } = useHybridViewerStore();
    for (const key of Object.keys(hybridDb)) {
      Reflect.deleteProperty(hybridDb, key);
    }
    await store.importStores({ maps: ["satellite"] });
    expect(backRequest).not.toHaveBeenCalled();
    Object.assign(hybridDb, { [FIRST_DATA]: fakeActor(BOX_A) });
    await nextTick();
    await vi.advanceTimersByTimeAsync(REBUILD_DELAY);
    expect(backRequest).toHaveBeenCalledTimes(ONCE);
    expect(store.basemapId).toBe("basemap-1");
  });

  test("a failed apply removes the new basemap and goes back to none", async () => {
    const store = setup();
    viewerRequest.mockRejectedValueOnce(new Error("apply failed"));
    await store.setMaps(["satellite"]);
    expect(deregisterObject).toHaveBeenCalledWith("basemap-1");
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-1" } }),
    );
    expect(store.basemapId).toBeUndefined();
    expect(store.maps).toStrictEqual([]);
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
    expect(store.basemapId).toBeUndefined();
    expect(store.attribution).toBeUndefined();
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
    expect(store.basemapId).toBeUndefined();
  });

  test("builds the visible maps in one basemap", async () => {
    const store = setup();
    await store.setMaps(["routes", "satellite"]);
    const params: unknown = expect.objectContaining({ maps: ["satellite", "routes"] });
    expect(backRequest).toHaveBeenLastCalledWith(expect.objectContaining({ params }));
    const apply: unknown = expect.objectContaining({
      id: "basemap-1",
      maps: buildResponse("basemap-1").maps,
      layers: [{ map: "satellite", visible: true, opacity: 1, crop: false }],
    });
    expect(viewerRequest).toHaveBeenCalledWith(expect.objectContaining({ params: apply }));
    // The states go with the basemap: no second composition
    const layersRoute = viewer_schemas.opengeodeweb_viewer.mesh.basemap_layers.$id;
    const calls = viewerRequest.mock.calls.map(([request]) => mockAs<Request>(request).schema.$id);
    expect(calls).not.toContain(layersRoute);
  });

  test("hiding a map built in the basemap only recomposes it", async () => {
    const store = setup();
    const both = [
      { map: "satellite", sources: ["ign_orthophotos"] },
      { map: "routes", sources: ["ign_routes"] },
    ];
    backRequest.mockResolvedValueOnce({ ...buildResponse("basemap-1"), maps: both });
    await store.setMaps(["satellite", "routes"]);
    backRequest.mockClear();
    viewerRequest.mockClear();
    await store.setMaps(["satellite"]);
    expect(backRequest).not.toHaveBeenCalled();
    const layers: unknown = expect.arrayContaining([
      { map: "routes", visible: false, opacity: 1, crop: false },
    ]);
    expect(viewerRequest).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ params: { id: "basemap-1", layers } }),
    );
  });

  test("showing a map never downloaded rebuilds the basemap", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    await store.setMaps(["satellite", "plan"]);
    expect(backRequest).toHaveBeenCalledTimes(TWICE);
  });

  test("opacity and crop recompose without building again", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    viewerRequest.mockClear();
    await store.setOpacity("satellite", 0.5);
    await store.setCrop(true, ["satellite"]);
    expect(backRequest).toHaveBeenCalledTimes(ONCE);
    expect(viewerRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        params: {
          id: "basemap-1",
          layers: [{ map: "satellite", visible: true, opacity: 0.5, crop: true }],
        },
      }),
    );
  });

  test("a layer change while the basemap is applied reaches the new basemap", async () => {
    const store = setup();
    // The first viewer request is the apply of the new basemap
    const apply = Promise.withResolvers<object>();
    viewerRequest.mockReturnValueOnce(apply.promise);
    const building = store.setMaps(["satellite"]);
    await vi.waitFor(() => {
      expect(viewerRequest).toHaveBeenCalledTimes(ONCE);
    });
    // The new basemap is not the current one yet: this change has nobody to go to
    await store.setOpacity("satellite", 0.3);
    apply.resolve({});
    await building;
    expect(viewerRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_layers,
        params: {
          id: "basemap-1",
          layers: [{ map: "satellite", visible: true, opacity: 0.3, crop: false }],
        },
      }),
    );
  });

  test("quick opacity changes are sent as one request after the running one", async () => {
    const store = setup();
    await store.setMaps(["satellite"]);
    viewerRequest.mockClear();
    const running = Promise.withResolvers<object>();
    viewerRequest.mockReturnValueOnce(running.promise);
    const first = store.setOpacity("satellite", 0.2);
    const second = store.setOpacity("satellite", 0.4);
    const third = store.setOpacity("satellite", 0.6);
    running.resolve({});
    await Promise.all([first, second, third]);
    expect(viewerRequest).toHaveBeenCalledTimes(TWICE);
    expect(viewerRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        params: {
          id: "basemap-1",
          layers: [{ map: "satellite", visible: true, opacity: 0.6, crop: false }],
        },
      }),
    );
  });

  test("exports and imports the maps, opacities and crop", async () => {
    const store = setup();
    await store.setCrop(true, ["routes"]);
    expect(store.exportStores()).toStrictEqual({
      maps: ["satellite"],
      opacities: OPAQUE,
      crop: { ...UNCROPPED, routes: true },
    });
    await store.importStores({ maps: ["plan", "routes"], crop: { plan: true } });
    expect(store.maps).toStrictEqual(["plan", "routes"]);
    expect(store.crop).toStrictEqual({ ...UNCROPPED, plan: true });
  });

  test("shows satellite on its own once georeferenced data arrives", async () => {
    const store = setup();
    expect(store.maps).toStrictEqual(["satellite"]);
    // No setStyle call: a data change is enough to build the default map
    items.value = georeferenced().slice(0, 1);
    await nextTick();
    await vi.advanceTimersByTimeAsync(REBUILD_DELAY);
    const satelliteParams: unknown = expect.objectContaining({ maps: ["satellite"] });
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

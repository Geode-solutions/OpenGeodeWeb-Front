// oxlint-disable vitest/require-mock-type-parameters, no-magic-numbers
import { type DataItem, useDataStore } from "@ogw_front/stores/data";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

vi.setConfig({ testTimeout: 10_000 });

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
    dataStore.refAllItems = mockAs<typeof dataStore.refAllItems>(() => items);
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
    await store.setStyle("satellite");
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
        params: { id: "basemap-1", tiles_folder: "tiles", columns: 2, rows: 3 },
      }),
    );
    expect(store.basemapId).toBe("basemap-1");
    expect(store.attribution).toBe("Powered by Esri | test");
  });

  test("data without crs is left out of the bounds", async () => {
    const store = setup();
    // Data still in local coordinates would stretch the basemap far from the georeferenced data
    Object.assign(useHybridViewerStore().hybridDb, {
      [LOCAL_DATA]: fakeActor([0, 1e9, 0, 1e9, -1e9, 0]),
    });
    await store.setStyle("satellite");
    const params: unknown = expect.objectContaining({
      bounds: { x_min: 0, y_min: -10, x_max: 30, y_max: 20 },
      z: 5,
    });
    expect(backRequest).toHaveBeenCalledWith(expect.objectContaining({ params }));
  });

  test("rebuilds when georeferenced data moves without a crs change", async () => {
    const store = setup();
    await store.setStyle("satellite");
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
    await store.setStyle("satellite");
    // No previous basemap to remove: the build itself must render
    expect(remoteRender).toHaveBeenCalledWith();
  });

  test("none removes the basemap", async () => {
    const store = setup();
    await store.setStyle("satellite");
    await store.setStyle("none");
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-1" } }),
    );
    // The viewer lets the mesh go before the back deletes its files
    expect(deregisterObject).toHaveBeenCalledBefore(deleteRequest);
    expect(store.basemapId).toBeUndefined();
    expect(store.attribution).toBeUndefined();
  });

  test("a newer build makes the running one obsolete", async () => {
    const store = setup();
    const slow = Promise.withResolvers();
    backRequest.mockReturnValueOnce(slow.promise).mockResolvedValueOnce(buildResponse("basemap-2"));
    const first = store.setStyle("satellite");
    await store.setStyle("topo");
    slow.resolve(buildResponse("basemap-1"));
    await first;
    expect(store.basemapId).toBe("basemap-2");
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
    await store.setStyle("satellite");
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

  test("removes the basemap when the project loses its crs", async () => {
    const store = setup();
    await store.setStyle("satellite");
    expect(store.available).toBe(true);
    items.value = mockAs<DataItem[]>([{ id: "a", created_at: "1" }]);
    await nextTick();
    await vi.advanceTimersByTimeAsync(REBUILD_DELAY);
    expect(deregisterObject).toHaveBeenCalledWith("basemap-1");
    expect(store.basemapId).toBeUndefined();
    expect(store.available).toBe(false);
  });

  test("exports the style and opacity, rebuilds on import", async () => {
    const store = setup();
    await store.setStyle("satellite");
    expect(store.exportStores()).toStrictEqual({ style: "satellite", opacity: 1 });
    await store.importStores({ style: "topo" });
    const topoParams: unknown = expect.objectContaining({ style: "topo" });
    expect(backRequest).toHaveBeenLastCalledWith(expect.objectContaining({ params: topoParams }));
  });

  test("a build finishing its apply after the style went to none is discarded", async () => {
    const store = setup();
    const apply = Promise.withResolvers();
    viewerRequest.mockReturnValueOnce(apply.promise);
    const building = store.setStyle("satellite");
    await vi.waitFor(() => {
      expect(viewerRequest).toHaveBeenCalledTimes(ONCE);
    });
    await store.setStyle("none");
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
    await store.importStores({ style: "satellite" });
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
    await store.setStyle("satellite");
    expect(deregisterObject).toHaveBeenCalledWith("basemap-1");
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "basemap-1" } }),
    );
    expect(store.basemapId).toBeUndefined();
    expect(store.style).toBe("none");
    expect(store.loading).toBe(false);
  });

  test("a failed build goes back to none and data changes no longer rebuild", async () => {
    const store = setup();
    backRequest.mockRejectedValueOnce(new Error("Basemap unavailable: no API key"));
    await store.setStyle("satellite");
    expect(store.style).toBe("none");
    items.value = georeferenced().slice(0, 1);
    await nextTick();
    await vi.advanceTimersByTimeAsync(REBUILD_DELAY);
    expect(backRequest).toHaveBeenCalledTimes(ONCE);
  });

  test("reset forgets the basemap without any request", async () => {
    const store = setup();
    await store.setStyle("satellite");
    deregisterObject.mockClear();
    store.reset();
    expect(store.basemapId).toBeUndefined();
    expect(store.attribution).toBeUndefined();
    expect(store.loading).toBe(false);
    expect(deregisterObject).not.toHaveBeenCalled();
    expect(deleteRequest).not.toHaveBeenCalled();
  });

  test("reset makes the builds in flight obsolete", async () => {
    const store = setup();
    const slow = Promise.withResolvers();
    backRequest.mockReturnValueOnce(slow.promise);
    const building = store.setStyle("satellite");
    store.reset();
    slow.resolve(buildResponse("basemap-1"));
    await building;
    expect(registerObject).not.toHaveBeenCalled();
    // The previous project's back was already cleared
    expect(deleteRequest).not.toHaveBeenCalled();
    expect(store.basemapId).toBeUndefined();
  });

  test("setOpacity asks the viewer without building again", async () => {
    const store = setup();
    await store.setStyle("satellite");
    viewerRequest.mockClear();
    remoteRender.mockClear();
    await store.setOpacity(0.5);
    expect(store.opacity).toBe(0.5);
    expect(viewerRequest).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ params: { id: "basemap-1", opacity: 0.5 } }),
    );
    expect(remoteRender).toHaveBeenCalledTimes(ONCE);
    expect(backRequest).toHaveBeenCalledTimes(ONCE);
  });

  test("setOpacity without basemap only stores the value", async () => {
    const store = setup();
    await store.setOpacity(0.4);
    expect(store.opacity).toBe(0.4);
    expect(viewerRequest).not.toHaveBeenCalled();
  });

  test("a rebuild applies the opacity again", async () => {
    const store = setup();
    await store.setOpacity(0.5);
    await store.setStyle("satellite");
    expect(viewerRequest).toHaveBeenCalledTimes(TWICE);
    expect(viewerRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ params: { id: "basemap-1", opacity: 0.5 } }),
    );
  });

  test("a full opacity is not applied after a build", async () => {
    const store = setup();
    await store.setStyle("satellite");
    expect(viewerRequest).toHaveBeenCalledTimes(ONCE);
  });

  test("exports and imports the opacity", async () => {
    const store = setup();
    await store.setOpacity(0.7);
    expect(store.exportStores()).toStrictEqual({ style: "none", opacity: 0.7 });
    await store.importStores({ style: "none" });
    expect(store.opacity).toBe(1);
    await store.importStores({ style: "none", opacity: 0.3 });
    expect(store.opacity).toBe(0.3);
  });
});

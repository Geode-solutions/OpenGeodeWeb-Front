// oxlint-disable vitest/require-mock-type-parameters, no-magic-numbers, max-lines, max-lines-per-function
import { type DataItem, useDataStore } from "@ogw_front/stores/data";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";
import { useBasemapDetailStore } from "@ogw_front/stores/basemap_detail";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

vi.setConfig({ testTimeout: 10_000 });

const LAMBERT = { authority: "EPSG", code: "2154", name: "RGF93 v1 / Lambert-93" };
const REST_DELAY = 250;
const APPLY_ROUTE = viewer_schemas.opengeodeweb_viewer.mesh.apply_basemap.$id;
const LAYERS_ROUTE = viewer_schemas.opengeodeweb_viewer.mesh.basemap_layers.$id;
const DELETE_ROUTE = back_schemas.opengeodeweb_back.basemap.delete.$id;
// A base of 4000 m: 3.9 m per pixel with 4 columns of tiles
const BASE_BOX = [-2000, 2000, -2000, 2000, 0, 0];
const BASE_BOUNDS = { x_min: -2000, y_min: -2000, x_max: 2000, y_max: 2000 };
// Looking straight down from 100 m, 90 degrees of vertical field of view, on a 1000 x 800 screen:
// 0.25 m per pixel, 250 m x 200 m seen
const TOP_VIEW = {
  position: [0, 0, 100],
  focal_point: [0, 0, 0],
  view_up: [0, 1, 0],
  view_angle: 90,
  distance: 100,
};
const FIRST_DATA = "a";
const DETAIL_MARGIN = 50;
const DETAIL_COLUMNS = 5;
const DETAIL_ZOOM = 18;
const MAPS = [{ map: "satellite", sources: ["eox_s2cloudless_2016"] }];

interface Bounds {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}
interface Counters {
  base: number;
  detail: number;
}
interface ViewerRequest {
  schema: { $id: string };
  params: { id: string; detail_of?: string; layers?: { opacity: number }[] };
}
interface BuildRequest {
  schema: { $id: string };
  params: { margin?: boolean; bounds: Bounds };
}

async function flush(): Promise<void> {
  await vi.advanceTimersByTimeAsync(0);
}

// Changes the camera: it is not at rest until the delay has passed
function moveCamera(): void {
  const hybridViewerStore = useHybridViewerStore();
  hybridViewerStore.is_moving = true;
}

function zoomCamera(factor: number): void {
  const camera = useHybridViewerStore().camera_options;
  Object.assign(camera, {
    position: [0, 0, 100 * factor],
    distance: 100 * factor,
  });
}

function panCameraSlightly(): void {
  const camera = useHybridViewerStore().camera_options;
  Object.assign(camera, { position: [5, 5, 100], focal_point: [5, 5, 0] });
}

function isDetailApply(request: ViewerRequest): boolean {
  return request.schema.$id === APPLY_ROUTE && request.params.detail_of !== undefined;
}

// The viewer refuses the detail only
async function refuseDetail(request: ViewerRequest): Promise<unknown> {
  await Promise.resolve();
  if (isDetailApply(request)) {
    throw new Error("apply failed");
  }
  return {};
}

function holdDetail(pending: Promise<unknown>): (request: ViewerRequest) => Promise<unknown> {
  return async (request) => {
    if (isDetailApply(request)) {
      await pending;
    }
    return {};
  };
}

function layersOf(requests: ViewerRequest[], id: string): ViewerRequest[] {
  return requests.filter(
    (request) => request.schema.$id === LAYERS_ROUTE && request.params.id === id,
  );
}

describe("basemap detail store", () => {
  let backRequest = vi.fn();
  let deleteRequest = vi.fn();
  let viewerRequest = vi.fn<(request: ViewerRequest) => Promise<unknown>>();
  let deregisterObject = vi.fn();
  let slowDetail: PromiseWithResolvers<unknown> | undefined = undefined;

  function baseResponse(counters: Counters, baseColumns: number): Record<string, unknown> {
    counters.base += 1;
    return {
      id: `basemap-${counters.base}`,
      tiles_folder: "tiles",
      columns: baseColumns,
      rows: baseColumns,
      zoom: 14,
      bounds: BASE_BOUNDS,
      attribution: "test",
      maps: MAPS,
    };
  }

  // The back widens the requested area to whole tiles
  function detailResponse(
    counters: Counters,
    bounds: Bounds,
    zoom: number,
  ): Record<string, unknown> {
    counters.detail += 1;
    return {
      id: `detail-${counters.detail}`,
      tiles_folder: "tiles",
      columns: DETAIL_COLUMNS,
      rows: DETAIL_COLUMNS,
      zoom,
      bounds: {
        x_min: bounds.x_min - DETAIL_MARGIN,
        y_min: bounds.y_min - DETAIL_MARGIN,
        x_max: bounds.x_max + DETAIL_MARGIN,
        y_max: bounds.y_max + DETAIL_MARGIN,
      },
      attribution: "test",
      maps: MAPS,
    };
  }

  async function setupWithBase(
    options: { baseColumns?: number; slowDetail?: boolean; detailZooms?: number[] } = {},
  ): Promise<{
    basemap: ReturnType<typeof useBasemapStore>;
    detail: ReturnType<typeof useBasemapDetailStore>;
  }> {
    setupActivePinia();
    const counters = { base: 0, detail: 0 };
    slowDetail = undefined;
    if (options.slowDetail === true) {
      slowDetail = Promise.withResolvers();
    }
    const { baseColumns = 4 } = options;
    const buildSpy = vi.fn();
    backRequest = buildSpy;
    deleteRequest = vi.fn().mockResolvedValue({});
    const deleteSpy = deleteRequest;
    viewerRequest = vi.fn<(request: ViewerRequest) => Promise<unknown>>().mockResolvedValue({});
    deregisterObject = vi.fn().mockResolvedValue({});
    const backStore = useBackStore();
    backStore.request = mockAs<typeof backStore.request>(
      async (request: BuildRequest): Promise<unknown> => {
        if (request.schema.$id === DELETE_ROUTE) {
          const deleted: unknown = await deleteSpy(request);
          return deleted;
        }
        await buildSpy(request);
        if (request.params.margin !== false) {
          return baseResponse(counters, baseColumns);
        }
        const response = detailResponse(
          counters,
          request.params.bounds,
          options.detailZooms?.[counters.detail] ?? DETAIL_ZOOM,
        );
        if (slowDetail !== undefined) {
          await slowDetail.promise;
        }
        return response;
      },
    );
    const viewerStore = useViewerStore();
    viewerStore.request = mockAs<typeof viewerStore.request>(viewerRequest);
    const dataStore = useDataStore();
    const items = ref(mockAs<DataItem[]>([{ id: FIRST_DATA, created_at: "1", crs: LAMBERT }]));
    dataStore.refCrsItems = mockAs<typeof dataStore.refCrsItems>(() => items);
    dataStore.registerObject = mockAs<typeof dataStore.registerObject>(
      vi.fn().mockResolvedValue({}),
    );
    dataStore.deregisterObject = mockAs<typeof dataStore.deregisterObject>(deregisterObject);
    const hybridViewerStore = useHybridViewerStore();
    hybridViewerStore.remoteRender = mockAs<typeof hybridViewerStore.remoteRender>(
      vi.fn().mockResolvedValue(undefined),
    );
    Object.assign(hybridViewerStore.hybridDb, {
      [FIRST_DATA]: { polydata: { getBounds: () => BASE_BOX } },
    });
    Object.assign(hybridViewerStore.camera_options, TOP_VIEW);
    hybridViewerStore.is_moving = false;
    hybridViewerStore.zScale = 1;
    // Same shape as the store: a holder with the render window in its value
    hybridViewerStore.genericRenderWindow = mockAs<typeof hybridViewerStore.genericRenderWindow>({
      value: {
        getApiSpecificRenderWindow: () => ({ getSize: (): [number, number] => [1000, 800] }),
      },
    });
    const basemap = useBasemapStore();
    const detail = useBasemapDetailStore();
    await basemap.setMaps(["satellite"]);
    await flush();
    backRequest.mockClear();
    return { basemap, detail };
  }

  function resolveDetail(): void {
    slowDetail?.resolve({});
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("builds a detail once the camera rests", async () => {
    const { basemap, detail } = await setupWithBase();
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    const params: unknown = expect.objectContaining({ margin: false, max_pixels: 1000 });
    expect(backRequest).toHaveBeenLastCalledWith(expect.objectContaining({ params }));
    const apply: unknown = expect.objectContaining({ detail_of: basemap.basemapId });
    expect(viewerRequest).toHaveBeenCalledWith(expect.objectContaining({ params: apply }));
    expect(detail.detailId).toBe("detail-1");
  });

  test("a small move within the sharp area rebuilds nothing", async () => {
    await setupWithBase();
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    backRequest.mockClear();
    panCameraSlightly();
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    expect(backRequest).not.toHaveBeenCalled();
  });

  // A sharp patch left in a wider view would show as a rectangle until the next detail
  test("zooming out of the detail removes it at once, before the rest delay", async () => {
    const { detail } = await setupWithBase();
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    zoomCamera(4);
    await flush();
    expect(detail.detailId).toBeUndefined();
    expect(deregisterObject).toHaveBeenCalledWith("detail-1");
  });

  test("zooming in one step further replaces the detail", async () => {
    const { detail } = await setupWithBase();
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    zoomCamera(0.4);
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    expect(detail.detailId).toBe("detail-2");
    expect(deregisterObject).toHaveBeenCalledWith("detail-1");
  });

  test("no detail when the base is already fine enough", async () => {
    const { detail } = await setupWithBase({ baseColumns: 64 });
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    expect(detail.detailId).toBeUndefined();
  });

  test("a camera moving during the build makes the detail obsolete", async () => {
    const { detail } = await setupWithBase({ slowDetail: true });
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    moveCamera();
    resolveDetail();
    await flush();
    expect(detail.detailId).toBeUndefined();
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "detail-1" } }),
    );
  });

  test("a new base removes the detail", async () => {
    const { basemap, detail } = await setupWithBase();
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    await basemap.rebuild();
    await flush();
    expect(detail.detailId).toBeUndefined();
    expect(deregisterObject).toHaveBeenCalledWith("detail-1");
  });

  test("map states reach the detail too", async () => {
    const { basemap } = await setupWithBase();
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    viewerRequest.mockClear();
    await basemap.setOpacity("satellite", 0.5);
    await flush();
    const ids = viewerRequest.mock.calls.map(([request]) => request.params.id);
    expect(ids).toContain("detail-1");
  });

  test("a detail the viewer refuses is removed", async () => {
    const { detail } = await setupWithBase();
    viewerRequest.mockImplementation(refuseDetail);
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    expect(deregisterObject).toHaveBeenCalledWith("detail-1");
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "detail-1" } }),
    );
    expect(detail.detailId).toBeUndefined();
  });

  test("map states changed while the detail is applied reach it", async () => {
    const { basemap } = await setupWithBase();
    const pending = Promise.withResolvers<unknown>();
    viewerRequest.mockImplementation(holdDetail(pending.promise));
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    await basemap.setOpacity("satellite", 0.5);
    pending.resolve({});
    await flush();
    const sent = layersOf(
      viewerRequest.mock.calls.map(([request]) => request),
      "detail-1",
    );
    expect(sent.at(-1)?.params.layers?.[0]?.opacity).toBe(0.5);
  });

  test("a project reset forgets the detail without any request", async () => {
    const { basemap, detail } = await setupWithBase();
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    deregisterObject.mockClear();
    deleteRequest.mockClear();
    basemap.reset();
    await flush();
    expect(detail.detailId).toBeUndefined();
    expect(deregisterObject).not.toHaveBeenCalled();
    expect(deleteRequest).not.toHaveBeenCalled();
  });

  test("no finer zoom: the next rests of the same view build nothing", async () => {
    const { detail } = await setupWithBase({ detailZooms: [14] });
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    expect(detail.detailId).toBeUndefined();
    backRequest.mockClear();
    panCameraSlightly();
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    expect(backRequest).not.toHaveBeenCalled();
  });

  test("a remembered step never hides a view that needs a finer map", async () => {
    await setupWithBase({ detailZooms: [14] });
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    backRequest.mockClear();
    zoomCamera(0.4);
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    const params: unknown = expect.objectContaining({ margin: false });
    expect(backRequest).toHaveBeenCalledWith(expect.objectContaining({ params }));
  });

  test("a remembered step removes the detail still shown", async () => {
    const { detail } = await setupWithBase({ detailZooms: [DETAIL_ZOOM, 14] });
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    expect(detail.detailId).toBe("detail-1");
    zoomCamera(0.4);
    await vi.advanceTimersByTimeAsync(REST_DELAY);
    expect(detail.detailId).toBeUndefined();
    expect(deregisterObject).toHaveBeenCalledWith("detail-1");
    expect(deleteRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "detail-1" } }),
    );
  });
});

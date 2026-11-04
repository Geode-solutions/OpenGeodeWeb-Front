import {
  type MapBounds,
  type MapGrid,
  type ViewCamera,
  covers,
  mapResolution,
  needsSharperMap,
  screenPixelGroundSize,
  stillSharp,
  visibleMapArea,
} from "@ogw_front/utils/visible_map_area";
import back_schemas, {
  type BasemapBuildResponse,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface RenderWindowLike {
  getApiSpecificRenderWindow: () => { getSize: () => [number, number] };
}
type BaseGrid = NonNullable<ReturnType<typeof useBasemapStore>["grid"]>;

const REST_DELAY_MILLISECONDS = 250;
const MAX_DETAIL_PIXELS = 4096;
const DETAIL_NAME = "basemap detail";

function ignoreError(): void {
  // Already reported by the request feedback
}

// When the camera rests, the visible area of the basemap at the zoom of the screen
// oxlint-disable-next-line max-lines-per-function, max-statements
export const useBasemapDetailStore = defineStore("basemapDetail", () => {
  const backStore = useBackStore();
  const dataStore = useDataStore();
  const crsStore = useCrsStore();
  const basemapStore = useBasemapStore();
  const hybridViewerStore = useHybridViewerStore();
  const detailId = ref<string | undefined>(undefined);
  // The grid of the detail shown: a new detail is built only when the view leaves its step
  let detailGrid: MapGrid | undefined = undefined;
  // The maps the detail shown was built with
  let detailMaps: string[] = [];
  // Each refresh gets a number: a result arriving after a newer refresh is discarded
  let lastRefresh = 0;

  function forget(): void {
    lastRefresh += 1;
    detailId.value = undefined;
    detailGrid = undefined;
    detailMaps = [];
  }

  async function clear(): Promise<void> {
    const id = detailId.value;
    forget();
    if (id === undefined) {
      return;
    }
    await basemapStore.discard(id, true);
    await hybridViewerStore.remoteRender();
  }

  function viewportSize(): [number, number] | undefined {
    // The store holds the render window in a holder: the vtk.js typing of its API is partial
    // oxlint-disable-next-line no-unsafe-type-assertion -- vtk.js render window API boundary
    const renderWindow = hybridViewerStore.genericRenderWindow.value as unknown as
      | RenderWindowLike
      | undefined;
    const size = renderWindow?.getApiSpecificRenderWindow().getSize();
    if (size === undefined || size[0] === 0 || size[1] === 0) {
      return undefined;
    }
    return size;
  }

  async function detailRequest(
    visibleArea: MapBounds,
    z: number,
    size: readonly number[],
  ): Promise<BasemapBuildResponse | undefined> {
    const crs = crsStore.projectCrs;
    if (crs === undefined) {
      return undefined;
    }
    const response = await backStore.request({
      schema: back_schemas.opengeodeweb_back.basemap.build,
      params: {
        maps: [...basemapStore.maps],
        crs,
        bounds: visibleArea,
        z,
        margin: false,
        max_pixels: Math.min(MAX_DETAIL_PIXELS, Math.max(...size)),
      },
    });
    return response;
  }

  // What the screen shows of the base, and the ground size of one of its pixels
  function currentView(
    grid: BaseGrid,
    size: readonly number[],
  ): { visibleArea: MapBounds | undefined; wanted: number; sharperNeeded: boolean } {
    // oxlint-disable-next-line no-unsafe-type-assertion -- camera_options carries the vtk.js camera fields
    const camera = hybridViewerStore.camera_options as unknown as ViewCamera;
    const planeZ = grid.z * hybridViewerStore.zScale;
    const visibleArea = visibleMapArea(
      camera,
      (size[0] ?? 1) / (size[1] ?? 1),
      planeZ,
      grid.bounds,
    );
    const wanted = screenPixelGroundSize(camera, size[1] ?? 1);
    return { visibleArea, wanted, sharperNeeded: needsSharperMap(mapResolution(grid), wanted) };
  }

  function isObsolete(refreshNumber: number, basemapId: string): boolean {
    return refreshNumber !== lastRefresh || basemapId !== basemapStore.basemapId;
  }

  // Eye, opacity and crop reach the detail as they reach the base. A visible map the detail was
  // Built without would be missing from its sharp patch: the detail goes, the next one has it
  async function syncLayers(): Promise<void> {
    const id = detailId.value;
    if (id === undefined) {
      return;
    }
    if (basemapStore.maps.some((mapStyle) => !detailMaps.includes(mapStyle))) {
      await clear();
      return;
    }
    await basemapStore.applyLayers(id);
    await hybridViewerStore.remoteRender();
  }

  async function replaceDetail(response: BasemapBuildResponse, sentLayers: string): Promise<void> {
    const previous = detailId.value;
    detailId.value = response.id;
    detailGrid = response;
    detailMaps = response.maps.map(({ map }) => map);
    // Out of the viewer before the render, deleted on the back after it: shown sooner
    if (previous !== undefined) {
      await dataStore.deregisterObject(previous).catch(ignoreError);
    }
    // The states changed while the detail was built: the viewer still has the old ones
    if (JSON.stringify(basemapStore.layersParams()) === sentLayers) {
      await hybridViewerStore.remoteRender();
    } else {
      await syncLayers();
    }
    if (previous !== undefined) {
      void basemapStore.discard(previous, false);
    }
  }

  // No finer zoom exists here: the detail still shown goes, and this view is remembered as a step
  async function rememberStep(response: BasemapBuildResponse): Promise<void> {
    const clearing = clear();
    // The synchronous part of clear() has run: the step is set before any newer refresh
    detailGrid = response;
    await clearing;
    await basemapStore.discard(response.id, false);
  }

  async function build(
    grid: BaseGrid,
    basemapId: string,
    view: MapBounds,
    size: readonly number[],
  ): Promise<void> {
    lastRefresh += 1;
    const refreshNumber = lastRefresh;
    const response = await detailRequest(view, grid.z, size);
    if (response === undefined) {
      return;
    }
    if (isObsolete(refreshNumber, basemapId)) {
      await basemapStore.discard(response.id, false);
      return;
    }
    if (response.zoom <= grid.zoom) {
      await rememberStep(response);
      return;
    }
    let sentLayers = "";
    try {
      sentLayers = await basemapStore.applyBasemap(response, DETAIL_NAME, basemapId);
    } catch {
      // The request feedback already shows the error: the detail must not stay registered
      await basemapStore.discard(response.id, true);
      return;
    }
    if (isObsolete(refreshNumber, basemapId)) {
      await basemapStore.discard(response.id, true);
      return;
    }
    await replaceDetail(response, sentLayers);
  }

  async function refresh(): Promise<void> {
    const { grid, basemapId } = basemapStore;
    const size = viewportSize();
    const resting = !hybridViewerStore.is_moving && basemapStore.maps.length > 0;
    if (!resting || grid === undefined || basemapId === undefined || size === undefined) {
      return;
    }
    const { visibleArea, wanted, sharperNeeded } = currentView(grid, size);
    if (visibleArea === undefined || !sharperNeeded) {
      await clear();
      return;
    }
    // Steps: the map shown is still right for this view, nothing to rebuild
    if (detailGrid !== undefined && stillSharp(detailGrid, visibleArea, wanted)) {
      return;
    }
    await build(grid, basemapId, visibleArea, size);
  }

  async function refreshQuietly(): Promise<void> {
    try {
      await refresh();
    } catch (error) {
      // Request failures are shown by the request feedback; logged too, so a programming error
      // Is never hidden
      // oxlint-disable-next-line no-console -- no other channel for an error nobody awaits
      console.error("Basemap detail refresh failed", error);
    }
  }

  const scheduleRefresh = useDebounceFn(() => {
    void refreshQuietly();
  }, REST_DELAY_MILLISECONDS);

  // A view leaving the detail would show it as a sharp patch in a blurred map: it goes at once,
  // The base alone is shown until the next detail
  function dropDetailOutOfView(): void {
    const { grid } = basemapStore;
    const size = viewportSize();
    if (detailGrid === undefined || grid === undefined || size === undefined) {
      return;
    }
    const { visibleArea } = currentView(grid, size);
    if (visibleArea === undefined || !covers(detailGrid.bounds, visibleArea)) {
      void clear();
    }
  }

  watch(
    () => hybridViewerStore.camera_options,
    () => {
      dropDetailOutOfView();
      void scheduleRefresh();
    },
    { deep: true },
  );
  watch(
    () => hybridViewerStore.is_moving,
    (moving) => {
      if (moving) {
        // The result of a refresh started before the move is obsolete
        lastRefresh += 1;
      } else {
        void scheduleRefresh();
      }
    },
  );
  // A new base (data changed, maps rebuilt) drops the detail, then a new one is built for it
  // Once the camera rests
  watch(
    () => basemapStore.basemapId,
    async (id) => {
      await clear();
      if (id !== undefined) {
        void scheduleRefresh();
      }
    },
  );
  // A detail dropped for a missing map, or built while the maps changed, is built again
  watch(
    () => JSON.stringify(basemapStore.layersParams()),
    async () => {
      await syncLayers();
      void scheduleRefresh();
    },
  );

  // A new project: the viewer and the back are already cleared, nothing is requested
  basemapStore.$onAction(({ name }) => {
    if (name === "reset") {
      forget();
    }
  });

  return { detailId };
});

import {
  type MapBounds,
  type ViewCamera,
  needsSharperMap,
  screenPixelGroundSize,
  stillSharp,
  visibleMapArea,
} from "@ogw_front/utils/visible_map_area";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

interface DetailResponse {
  id: string;
  tiles_folder: string;
  columns: number;
  rows: number;
  zoom: number;
  bounds: MapBounds;
  maps: { map: string; sources: string[] }[];
}

interface RenderWindowLike {
  getApiSpecificRenderWindow: () => { getSize: () => [number, number] };
}
interface BaseGrid {
  bounds: MapBounds;
  zoom: number;
  columns: number;
  z: number;
}

const REST_DELAY_MILLISECONDS = 400;
const MAX_DETAIL_PIXELS = 4096;
const TILE_SIZE = 256;
const DETAIL_NAME = "basemap detail";

// When the camera rests, the visible area of the basemap at the zoom of the screen
// oxlint-disable-next-line max-lines-per-function, max-statements
export const useBasemapDetailStore = defineStore("basemapDetail", () => {
  const backStore = useBackStore();
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  const crsStore = useCrsStore();
  const basemapStore = useBasemapStore();
  const hybridViewerStore = useHybridViewerStore();
  const detailId = ref<string | undefined>(undefined);
  // The grid of the detail shown: a new detail is built only when the view leaves its step
  const detailGrid = ref<{ bounds: MapBounds; columns: number } | undefined>(undefined);
  // Each refresh gets a number: a result arriving after a newer refresh is discarded
  let lastRefresh = 0;

  async function clear(): Promise<void> {
    lastRefresh += 1;
    const id = detailId.value;
    detailId.value = undefined;
    detailGrid.value = undefined;
    if (id === undefined) {
      return;
    }
    await basemapStore.remove(id).catch(() => {
      // Already reported by the request feedback
    });
    await hybridViewerStore.remoteRender();
  }

  function viewportSize(): [number, number] | undefined {
    // Pinia unwraps the ref: the vtk.js typing of the render window is lost on the way
    // oxlint-disable-next-line no-unsafe-type-assertion -- vtk.js render window API boundary
    const renderWindow = hybridViewerStore.genericRenderWindow as unknown as
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
  ): Promise<DetailResponse | undefined> {
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

  // Returns the layers sent: the states changed meanwhile are sent again once it is shown
  async function showDetail(response: DetailResponse, basemapId: string): Promise<string> {
    await dataStore.registerObject(response.id, DETAIL_NAME);
    const sentLayers = JSON.stringify(basemapStore.layersParams());
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.apply_basemap,
      params: {
        id: response.id,
        tiles_folder: response.tiles_folder,
        columns: response.columns,
        rows: response.rows,
        maps: response.maps,
        layers: basemapStore.layersParams(),
        detail_of: basemapId,
      },
    });
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_drape,
      params: { id: response.id, data_ids: basemapStore.georeferencedIds() },
    });
    return sentLayers;
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
    const baseResolution = (grid.bounds.x_max - grid.bounds.x_min) / (grid.columns * TILE_SIZE);
    const wanted = screenPixelGroundSize(camera, size[1] ?? 1);
    return { visibleArea, wanted, sharperNeeded: needsSharperMap(baseResolution, wanted) };
  }

  function isObsolete(refreshNumber: number, basemapId: string): boolean {
    return refreshNumber !== lastRefresh || basemapId !== basemapStore.basemapId;
  }

  // Best effort: a detail left behind is only a leftover, never an error to show twice
  async function discard(id: string, registered: boolean): Promise<void> {
    const removal = registered ? basemapStore.remove : basemapStore.deleteData;
    await removal(id).catch(() => {
      // Already reported by the request feedback
    });
  }

  async function applyLayers(id: string): Promise<void> {
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_layers,
      params: { id, layers: basemapStore.layersParams() },
    });
  }

  async function replaceDetail(response: DetailResponse, sentLayers: string): Promise<void> {
    const previous = detailId.value;
    detailId.value = response.id;
    detailGrid.value = { bounds: response.bounds, columns: response.columns };
    if (previous !== undefined) {
      await discard(previous, true);
    }
    // The states changed while the detail was built: the viewer still has the old ones
    if (JSON.stringify(basemapStore.layersParams()) !== sentLayers) {
      await applyLayers(response.id);
    }
    await hybridViewerStore.remoteRender();
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
    if (isObsolete(refreshNumber, basemapId) || response.zoom <= grid.zoom) {
      if (!isObsolete(refreshNumber, basemapId)) {
        // No finer zoom exists here: a detail still shown is out of step and goes first, then
        // This view is a step too, not rebuilt at every rest
        await clear();
        detailGrid.value = { bounds: response.bounds, columns: response.columns };
      }
      await discard(response.id, false);
      return;
    }
    let sentLayers = "";
    try {
      sentLayers = await showDetail(response, basemapId);
    } catch {
      // The request feedback already shows the error: the detail must not stay registered
      await discard(response.id, true);
      return;
    }
    if (isObsolete(refreshNumber, basemapId)) {
      await discard(response.id, true);
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
    if (detailGrid.value !== undefined && stillSharp(detailGrid.value, visibleArea, wanted)) {
      return;
    }
    await build(grid, basemapId, visibleArea, size);
  }

  async function refreshQuietly(): Promise<void> {
    try {
      await refresh();
    } catch {
      // Nothing more to do
    }
  }

  const scheduleRefresh = useDebounceFn(() => {
    // Errors are already shown by the request feedback, never left unhandled
    void refreshQuietly();
  }, REST_DELAY_MILLISECONDS);

  watch(
    () => hybridViewerStore.camera_options,
    () => void scheduleRefresh(),
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
  // A new project: the viewer and the back are already cleared, nothing is requested
  watch(
    () => basemapStore.resetCount,
    () => {
      lastRefresh += 1;
      detailId.value = undefined;
      detailGrid.value = undefined;
    },
  );
  // A new base (data changed, maps rebuilt, project reset) drops the detail, then a new one
  // Is built for it once the camera rests
  watch(
    () => basemapStore.basemapId,
    async (id) => {
      await clear();
      if (id !== undefined) {
        void scheduleRefresh();
      }
    },
  );
  // Eye, opacity and crop reach the detail as they reach the base
  watch(
    () => JSON.stringify(basemapStore.layersParams()),
    async () => {
      if (detailId.value === undefined) {
        return;
      }
      await applyLayers(detailId.value);
      await hybridViewerStore.remoteRender();
    },
  );

  return { detailId, detailGrid, refresh, clear };
});

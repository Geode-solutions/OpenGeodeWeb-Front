import { type MapBounds, covers, stillSharp } from "@ogw_front/utils/visible_map_area";
import type { BasemapBuildResponse } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { BasemapGrid } from "./builds.js";
import type { DetailLayers } from "./detail_layers.js";
import type { DetailMap } from "./detail_map.js";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useBasemapViewer } from "./viewer.js";
import { useDebounceFn } from "@vueuse/core";
import { useDetailView } from "./detail_view.js";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

type BuildDetail = (grid: BasemapGrid, view: MapBounds, size: readonly number[]) => Promise<void>;

interface DetailRefresh {
  // When the camera rests: a refresh waits for the last camera change
  scheduleRefresh: () => void;
  // A view leaving the detail would show it as a sharp patch in a blurred map: it goes at once,
  // The base alone is shown until the next detail
  onCameraChange: () => void;
}

const REST_DELAY_MILLISECONDS = 250;
const DETAIL_NAME = "basemap detail";

// Builds the detail of a view for the basemap shown, unless a newer refresh or base came meanwhile
function useBuildDetail(detail: DetailMap, layers: DetailLayers): BuildDetail {
  const basemapStore = useBasemapStore();
  const { discardMap } = useBasemapViewer();
  const { detailRequest } = useDetailView();
  const { newRefresh, isObsolete } = detail;

  // Shown unless a newer refresh or base came while it was applied
  async function show(
    response: BasemapBuildResponse,
    basemapId: string,
    refreshNumber: number,
  ): Promise<void> {
    let sentLayers = "";
    try {
      sentLayers = await basemapStore.applyBasemap(response, DETAIL_NAME, basemapId);
    } catch {
      // The request feedback already shows the error: the detail must not stay registered
      await discardMap(response.id, true);
      return;
    }
    if (isObsolete(refreshNumber, basemapId)) {
      await discardMap(response.id, true);
      return;
    }
    await layers.replaceDetail(response, sentLayers);
  }

  return async (grid, view, size) => {
    const { basemapId, maps } = basemapStore;
    if (basemapId === undefined) {
      return;
    }
    const refreshNumber = newRefresh();
    const response = await detailRequest({ maps, visibleArea: view, z: grid.z }, size);
    if (response === undefined) {
      return;
    }
    if (isObsolete(refreshNumber, basemapId)) {
      await discardMap(response.id, false);
    } else if (response.zoom <= grid.zoom) {
      await layers.rememberStep(response);
    } else {
      await show(response, basemapId, refreshNumber);
    }
  };
}

// The visible area of the basemap at the zoom of the screen, built when the camera rests
function useDetailRefresh(detail: DetailMap, layers: DetailLayers): DetailRefresh {
  const basemapStore = useBasemapStore();
  const hybridViewerStore = useHybridViewerStore();
  const { viewportSize, currentView } = useDetailView();
  const build = useBuildDetail(detail, layers);
  const { shown, clear } = detail;

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
    if (shown.grid !== undefined && stillSharp(shown.grid, visibleArea, wanted)) {
      return;
    }
    await build(grid, visibleArea, size);
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

  const debouncedRefresh = useDebounceFn(() => {
    void refreshQuietly();
  }, REST_DELAY_MILLISECONDS);

  function scheduleRefresh(): void {
    void debouncedRefresh();
  }

  function onCameraChange(): void {
    const { grid } = basemapStore;
    const size = viewportSize();
    if (shown.grid !== undefined && grid !== undefined && size !== undefined) {
      const { visibleArea } = currentView(grid, size);
      if (visibleArea === undefined || !covers(shown.grid.bounds, visibleArea)) {
        void clear();
      }
    }
    scheduleRefresh();
  }

  return { scheduleRefresh, onCameraChange };
}

export { useDetailRefresh };

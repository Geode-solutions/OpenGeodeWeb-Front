import type { BasemapId } from "@ogw_front/types/identifiers";
import type { MapGrid } from "@ogw_front/utils/visible_map_area";
import type { MapStyle } from "@ogw_front/utils/basemap_tree";
import type { Ref } from "vue";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useBasemapViewer } from "./viewer.js";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface ShownDetail {
  // The grid of the detail shown: a new detail is built only when the view leaves its step
  grid: MapGrid | undefined;
  // The maps the detail shown was built with
  maps: MapStyle[];
}

// A refresh of the detail, by the number it is started with
type DetailRefreshNumber = number;

interface DetailMap {
  detailId: Ref<BasemapId | undefined>;
  shown: ShownDetail;
  // Each refresh gets a number: a result arriving after a newer refresh is discarded
  newRefresh: () => DetailRefreshNumber;
  isObsolete: (refreshNumber: DetailRefreshNumber, basemapId: BasemapId) => boolean;
  forget: () => void;
  clear: () => Promise<void>;
}

// The detail shown over the basemap
function useDetailMap(): DetailMap {
  const basemapStore = useBasemapStore();
  const hybridViewerStore = useHybridViewerStore();
  const { discardMap } = useBasemapViewer();
  const detailId = ref<BasemapId | undefined>(undefined);
  const shown: ShownDetail = { grid: undefined, maps: [] };
  let lastRefresh = 0;

  function newRefresh(): DetailRefreshNumber {
    lastRefresh += 1;
    return lastRefresh;
  }

  function isObsolete(refreshNumber: DetailRefreshNumber, basemapId: BasemapId): boolean {
    return refreshNumber !== lastRefresh || basemapId !== basemapStore.basemapId;
  }

  function forget(): void {
    newRefresh();
    detailId.value = undefined;
    shown.grid = undefined;
    shown.maps = [];
  }

  async function clear(): Promise<void> {
    const id = detailId.value;
    forget();
    if (id !== undefined) {
      await discardMap(id, true);
      await hybridViewerStore.remoteRender();
    }
  }

  return { detailId, shown, newRefresh, isObsolete, forget, clear };
}

export type { DetailMap, DetailRefreshNumber };
export { useDetailMap };

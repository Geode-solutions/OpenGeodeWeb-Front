import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useDetailLayers } from "./basemap_helpers/detail_layers.js";
import { useDetailMap } from "./basemap_helpers/detail_map.js";
import { useDetailRefresh } from "./basemap_helpers/detail_refresh.js";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// When the camera rests, the visible area of the basemap at the zoom of the screen
export const useBasemapDetailStore = defineStore("basemapDetail", () => {
  const basemapStore = useBasemapStore();
  const hybridViewerStore = useHybridViewerStore();
  const detail = useDetailMap();
  const { detailId, newRefresh, forget, clear } = detail;
  const layers = useDetailLayers(detail);
  const { scheduleRefresh, onCameraChange } = useDetailRefresh(detail, layers);

  watch(() => hybridViewerStore.camera_options, onCameraChange, { deep: true });
  watch(
    () => hybridViewerStore.is_moving,
    (moving) => {
      if (moving) {
        // The result of a refresh started before the move is obsolete
        newRefresh();
      } else {
        scheduleRefresh();
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
        scheduleRefresh();
      }
    },
  );
  watch(() => JSON.stringify(basemapStore.layersParams()), layers.syncLayers);
  // A detail dropped for a missing map, or built while the maps changed, is built again
  watch(() => basemapStore.maps.join(","), scheduleRefresh);

  // A new project: the viewer and the back are already cleared, nothing is requested
  basemapStore.$onAction(({ name }) => {
    if (name === "reset") {
      forget();
    }
  });

  return { detailId };
});

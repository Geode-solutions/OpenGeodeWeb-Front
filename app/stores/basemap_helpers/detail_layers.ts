import { coalesced, ignoreError, useBasemapViewer } from "./viewer.js";
import type { BasemapBuildResponse } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { DetailMap } from "./detail_map.js";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useDataStore } from "@ogw_front/stores/data";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface DetailLayers {
  syncLayers: () => Promise<void>;
  replaceDetail: (response: BasemapBuildResponse, sentLayers: string) => Promise<void>;
  rememberStep: (response: BasemapBuildResponse) => Promise<void>;
}

// What the viewer shows of the detail: its layers, and the detail replacing the previous one
function useDetailLayers(detail: DetailMap): DetailLayers {
  const dataStore = useDataStore();
  const basemapStore = useBasemapStore();
  const hybridViewerStore = useHybridViewerStore();
  const { discardMap } = useBasemapViewer();
  const { detailId, shown, clear } = detail;

  // Eye, opacity and crop reach the detail as they reach the base, one request at a time while a
  // Slider is dragged. Nothing visible, or a visible map the detail was built without (missing
  // From its sharp patch): the detail goes, the next one has the maps
  const syncLayers = coalesced(async () => {
    const id = detailId.value;
    if (id === undefined) {
      return;
    }
    const { maps } = basemapStore;
    if (maps.length === 0 || maps.some((mapStyle) => !shown.maps.includes(mapStyle))) {
      await clear();
      return;
    }
    await basemapStore.applyLayers(id);
    await hybridViewerStore.remoteRender();
  });

  async function replaceDetail(response: BasemapBuildResponse, sentLayers: string): Promise<void> {
    const previous = detailId.value;
    detailId.value = response.id;
    shown.grid = response;
    shown.maps = response.maps.map(({ map }) => map);
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
      void discardMap(previous, false);
    }
  }

  // No finer zoom exists here: the detail still shown goes, and this view is remembered as a step
  async function rememberStep(response: BasemapBuildResponse): Promise<void> {
    const clearing = clear();
    // The synchronous part of clear() has run: the step is set before any newer refresh
    shown.grid = response;
    await clearing;
    await discardMap(response.id, false);
  }

  return { syncLayers, replaceDetail, rememberStep };
}

export type { DetailLayers };
export { useDetailLayers };

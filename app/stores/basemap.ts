import { type Extent, boxesExtent, everyMap } from "./basemap_helpers/extent.js";
import { type Layer, coalesced, useBasemapViewer } from "./basemap_helpers/viewer.js";
import { type MapStyle, sortedMaps } from "@ogw_front/utils/basemap_tree";
import type { BasemapBuildResponse } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { sameCrs } from "@ogw_front/utils/crs";
import { useBasemapBuilds } from "./basemap_helpers/builds.js";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface BasemapSnapshot {
  maps?: MapStyle[];
  opacities?: Partial<Record<MapStyle, number>>;
  crop?: Partial<Record<MapStyle, boolean>>;
}

const REBUILD_DELAY_MILLISECONDS = 500;

// oxlint-disable max-lines-per-function, max-statements
export const useBasemapStore = defineStore("basemap", () => {
  const hybridViewerStore = useHybridViewerStore();
  const crsStore = useCrsStore();
  const { sendLayers, showMap } = useBasemapViewer();

  // The last chosen maps: shown again when the basemap is shown again
  const shown = ref<MapStyle[]>(["satellite"]);
  // Shown as soon as the project has a CRS, until the user hides it
  const hidden = ref(false);
  // The visible maps, from the bottom one to the top one
  const maps = computed<MapStyle[]>(() => (hidden.value ? [] : shown.value));
  const opacities = ref<Record<MapStyle, number>>(everyMap(1));
  // Cropped: only draped on the top surfaces, out of the flat map around
  const crop = ref<Record<MapStyle, boolean>>(everyMap(false));
  const built = ref<MapStyle[]>([]);

  // Data without a CRS is still in local coordinates, and data in another CRS than the
  // Project would be misplaced: only the data in the project CRS are under the basemap
  function georeferencedIds(): string[] {
    return crsStore.crsItems
      .filter((item) => sameCrs(item.crs, crsStore.projectCrs))
      .map((item) => item.id);
  }
  // A map needs at least one data in the project CRS to lie under
  const available = computed(
    () => crsStore.projectCrs !== undefined && georeferencedIds().length > 0,
  );

  function dataBounds(): Extent | undefined {
    const georeferenced = new Set(georeferencedIds());
    return boxesExtent(
      Object.entries(hybridViewerStore.hybridDb)
        .filter(([id]) => georeferenced.has(id))
        .map(([, entry]) => entry.polydata.getBounds()),
    );
  }

  function layersParams(): Layer[] {
    return built.value.map((map) => ({
      map,
      visible: maps.value.includes(map),
      opacity: opacities.value[map],
      crop: crop.value[map],
    }));
  }

  async function applyLayers(id: string): Promise<void> {
    await sendLayers(id, layersParams());
  }

  // Returns the layers sent: the states changed meanwhile are sent again
  async function applyBasemap(
    response: BasemapBuildResponse,
    name: string,
    detailOf?: string,
  ): Promise<string> {
    const layers = layersParams();
    await showMap({ response, name, layers, dataIds: georeferencedIds() }, detailOf);
    return JSON.stringify(layers);
  }

  const { basemapId, grid, attribution, rebuild, reset } = useBasemapBuilds({
    maps,
    hidden,
    built,
    layersParams,
    applyLayers,
    applyBasemap,
    dataBounds,
  });

  const recompose = coalesced(async () => {
    const id = basemapId.value;
    if (id !== undefined) {
      await applyLayers(id);
      await hybridViewerStore.remoteRender();
    }
  });

  // No map hides the basemap and keeps the last maps, to show them again
  async function setMaps(newMaps: readonly MapStyle[]): Promise<void> {
    if (newMaps.length === 0) {
      hidden.value = true;
    } else {
      shown.value = sortedMaps(newMaps);
      hidden.value = false;
    }
    const allBuilt = maps.value.every((mapStyle) => built.value.includes(mapStyle));
    if (maps.value.length > 0 && basemapId.value !== undefined && allBuilt) {
      await recompose();
      return;
    }
    await rebuild();
  }

  // No rebuild: each map keeps its opacity
  async function setOpacity(mapStyle: MapStyle, value: number): Promise<void> {
    opacities.value = { ...opacities.value, [mapStyle]: value };
    await recompose();
  }

  // No rebuild
  async function setCrop(value: boolean, mapStyles: readonly MapStyle[]): Promise<void> {
    crop.value = {
      ...crop.value,
      ...Object.fromEntries(mapStyles.map((mapStyle) => [mapStyle, value])),
    };
    await recompose();
  }

  const scheduleRebuild = useDebounceFn(() => {
    void rebuild();
  }, REBUILD_DELAY_MILLISECONDS);
  // Rebuilt when the georeferenced data or their extent change: data added, removed, converted,
  // Aligned, or displayed after a project import
  watch(
    () => {
      const crs = crsStore.projectCrs;
      const extentKey = JSON.stringify(dataBounds() ?? "none");
      return `${crs?.authority}:${crs?.code}|${georeferencedIds().join(",")}|${extentKey}`;
    },
    () => {
      if (maps.value.length > 0) {
        void scheduleRebuild();
      }
    },
  );

  function exportStores(): Required<BasemapSnapshot> {
    return { maps: maps.value, opacities: opacities.value, crop: crop.value };
  }

  // Called once the project data is imported. When the data is not displayed yet,
  // The rebuild finds no bounds and the watch above rebuilds once it is displayed.
  async function importStores(snapshot: BasemapSnapshot | undefined): Promise<void> {
    opacities.value = { ...everyMap(1), ...snapshot?.opacities };
    crop.value = { ...everyMap(false), ...snapshot?.crop };
    await setMaps(sortedMaps(snapshot?.maps ?? ["satellite"]));
  }

  return {
    maps,
    shown,
    opacities,
    crop,
    basemapId,
    grid,
    attribution,
    available,
    setMaps,
    setOpacity,
    setCrop,
    rebuild,
    reset,
    layersParams,
    applyLayers,
    applyBasemap,
    exportStores,
    importStores,
  };
});

export type { BasemapSnapshot };
export type { MapStyle } from "@ogw_front/utils/basemap_tree";

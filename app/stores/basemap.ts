import { useBasemapBuilds } from "./basemap_helpers/builds.js";
import { useBasemapLayers } from "./basemap_helpers/layers.js";
import { useBasemapSettings } from "./basemap_helpers/settings.js";
import { useDebounceFn } from "@vueuse/core";
import { useGeoreferenced } from "./basemap_helpers/georeferenced.js";

const REBUILD_DELAY_MILLISECONDS = 500;

export const useBasemapStore = defineStore("basemap", () => {
  const { available, georeferencedIds, dataBounds, dataKey } = useGeoreferenced();
  const layers = useBasemapLayers(georeferencedIds);
  const { shown, maps, opacities, crop, layersParams, applyLayers, applyBasemap } = layers;
  const { basemapId, grid, attribution, rebuild, reset } = useBasemapBuilds(layers, dataBounds);
  const settings = useBasemapSettings(layers, basemapId, rebuild);
  const { setMaps, setOpacity, setCrop, exportStores, importStores } = settings;

  const scheduleRebuild = useDebounceFn(() => {
    void rebuild();
  }, REBUILD_DELAY_MILLISECONDS);
  // Rebuilt when the georeferenced data or their extent change: data added, removed, converted,
  // Aligned, or displayed after a project import
  watch(dataKey, () => {
    // A hidden basemap would be out of date once shown again: the rebuild removes it
    if (maps.value.length > 0 || basemapId.value !== undefined) {
      void scheduleRebuild();
    }
  });

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

export type { BasemapSnapshot } from "./basemap_helpers/settings.js";
export type { MapStyle } from "@ogw_front/utils/basemap_tree";

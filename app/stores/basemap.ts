import { useBasemapBuilds } from "./basemap_helpers/builds.js";
import { useBasemapLayers } from "./basemap_helpers/layers.js";
import { useBasemapSettings } from "./basemap_helpers/settings.js";
import { useDebounceFn } from "@vueuse/core";
import { useGeoreferenced } from "./basemap_helpers/georeferenced.js";

const REBUILD_DELAY_MILLISECONDS = 500;

// Apps opt in with `ogwFront.basemap` in their app.config.ts: without it, no map is built or offered
function readBasemapOption(appConfig: ReturnType<typeof useAppConfig>): boolean {
  // The resolved type holds the layer's literal default (false): widen it to the config input type
  const ogwFront: { basemap?: boolean } | undefined = appConfig.ogwFront;
  return ogwFront?.basemap === true;
}

export const useBasemapStore = defineStore("basemap", () => {
  const appConfig = useAppConfig();
  const enabled = computed(() => readBasemapOption(appConfig));
  const georeferenced = useGeoreferenced();
  const { georeferencedIds, dataBounds, dataKey } = georeferenced;
  const available = computed(() => enabled.value && georeferenced.available.value);
  const layers = useBasemapLayers(georeferencedIds);
  const { shown, maps, opacities, crop, layersParams, applyLayers, applyBasemap } = layers;
  const builds = useBasemapBuilds(layers, dataBounds);
  const { basemapId, grid, attribution, reset } = builds;
  async function rebuild(): Promise<void> {
    if (enabled.value) {
      await builds.rebuild();
    }
  }
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

import { type MapStyle, sortedMaps } from "@ogw_front/utils/basemap_tree";
import type { BasemapLayers } from "./layers.js";
import type { Ref } from "vue";
import { coalesced } from "./viewer.js";
import { everyMap } from "./extent.js";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface BasemapSnapshot {
  maps?: MapStyle[];
  opacities?: Partial<Record<MapStyle, number>>;
  crop?: Partial<Record<MapStyle, boolean>>;
}

interface BasemapSettings {
  setMaps: (newMaps: readonly MapStyle[]) => Promise<void>;
  setOpacity: (mapStyle: MapStyle, value: number) => Promise<void>;
  setCrop: (value: boolean, mapStyles: readonly MapStyle[]) => Promise<void>;
  exportStores: () => Required<BasemapSnapshot>;
  importStores: (snapshot: BasemapSnapshot | undefined) => Promise<void>;
}

// The choices of the user: a change already built only recomposes, the others rebuild
function useBasemapSettings(
  layers: BasemapLayers,
  basemapId: Ref<string | undefined>,
  rebuild: () => Promise<void>,
): BasemapSettings {
  const hybridViewerStore = useHybridViewerStore();
  const { shown, hidden, maps, opacities, crop, built, applyLayers } = layers;

  const recompose = coalesced(async () => {
    const id = basemapId.value;
    if (id !== undefined) {
      await applyLayers(id);
      await hybridViewerStore.remoteRender();
    }
  });

  // No map hides the basemap and keeps the last maps, to show them again. Hidden, the built
  // Basemap stays with every layer invisible: shown again, it only recomposes
  async function setMaps(newMaps: readonly MapStyle[]): Promise<void> {
    if (newMaps.length === 0) {
      hidden.value = true;
    } else {
      shown.value = sortedMaps(newMaps);
      hidden.value = false;
    }
    const allBuilt = maps.value.every((mapStyle) => built.value.includes(mapStyle));
    if (basemapId.value !== undefined && allBuilt) {
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

  function exportStores(): Required<BasemapSnapshot> {
    return { maps: maps.value, opacities: opacities.value, crop: crop.value };
  }

  // Called once the project data is imported. When the data is not displayed yet,
  // The rebuild finds no bounds and the store rebuilds once it is displayed.
  async function importStores(snapshot: BasemapSnapshot | undefined): Promise<void> {
    opacities.value = { ...everyMap(1), ...snapshot?.opacities };
    crop.value = { ...everyMap(false), ...snapshot?.crop };
    await setMaps(sortedMaps(snapshot?.maps ?? ["satellite"]));
  }

  return { setMaps, setOpacity, setCrop, exportStores, importStores };
}

export type { BasemapSnapshot };
export { useBasemapSettings };

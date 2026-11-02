import type { BasemapStyle, MapStyle } from "@ogw_front/utils/basemap_tree";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { sameCrs } from "@ogw_front/utils/crs";
import { useBackStore } from "@ogw_front/stores/back";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

interface BasemapSnapshot {
  style?: BasemapStyle;
  opacities?: Partial<Record<MapStyle, number>>;
  // A project saved with the toolbar tool: one opacity for the single map
  opacity?: number;
  around?: boolean;
}
interface Bounds {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

const REBUILD_DELAY_MILLISECONDS = 500;
const BASEMAP_NAME = "basemap";
const X_MIN = 0;
const X_MAX = 1;
const Y_MIN = 2;
const Y_MAX = 3;
const Z_MAX = 5;

function fullOpacities(value: number): Record<MapStyle, number> {
  return { satellite: value, streets: value, topo: value };
}

// oxlint-disable max-lines-per-function, max-statements
export const useBasemapStore = defineStore("basemap", () => {
  const backStore = useBackStore();
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  const hybridViewerStore = useHybridViewerStore();
  const items = dataStore.refAllItems();

  // The last chosen map: shown again when the basemap is shown again
  const map = ref<MapStyle>("satellite");
  // Shown as soon as the project has a CRS, until the user hides it
  const hidden = ref(false);
  const style = computed<BasemapStyle>(() => (hidden.value ? "none" : map.value));
  const opacities = ref<Record<MapStyle, number>>(fullOpacities(1));
  const opacity = computed(() => (style.value === "none" ? 1 : opacities.value[style.value]));
  // The flat map around the draped top surfaces
  const around = ref(true);
  const basemapId = ref<string | undefined>(undefined);
  const attribution = ref<string | undefined>(undefined);
  const loading = ref(false);
  const crsStore = useCrsStore();
  const crs = computed(() => crsStore.projectCrs);
  // Each build gets a number: a build finishing after a newer one started is discarded
  let lastBuild = 0;
  // Builds up to this number belong to a project the viewer and the back already cleared
  let lastBuildOfPreviousProject = 0;

  // Data without a CRS is still in local coordinates, and data in another CRS than the
  // Project would be misplaced: only the data in the project CRS are under the basemap
  function georeferencedIds(): string[] {
    return (items.value ?? [])
      .filter((item) => sameCrs(item.crs, crs.value))
      .map((item) => item.id);
  }
  // A map needs at least one data in the project CRS to lie under
  const available = computed(() => crs.value !== undefined && georeferencedIds().length > 0);

  // Unscaled polydata bounds: the actor bounds would include the z scale
  function dataBounds(): { bounds: Bounds; z: number } | undefined {
    // The basemap is never in hybridDb: every entry is project data. Data without a CRS is
    // Still in local coordinates and would move the basemap away from the georeferenced data
    const georeferenced = new Set(georeferencedIds());
    const boxes = Object.entries(hybridViewerStore.hybridDb)
      .filter(([id, entry]) => entry !== undefined && georeferenced.has(id))
      .map(([, entry]) => entry?.polydata.getBounds() ?? []);
    if (boxes.length === 0) {
      return undefined;
    }
    return {
      bounds: {
        x_min: Math.min(...boxes.map((box) => box[X_MIN] ?? 0)),
        y_min: Math.min(...boxes.map((box) => box[Y_MIN] ?? 0)),
        x_max: Math.max(...boxes.map((box) => box[X_MAX] ?? 0)),
        y_max: Math.max(...boxes.map((box) => box[Y_MAX] ?? 0)),
      },
      // At the top of the data, like the ground above subsurface data, ready to drape surfaces
      z: Math.max(...boxes.map((box) => box[Z_MAX] ?? 0)),
    };
  }

  async function deleteData(id: string): Promise<void> {
    await backStore.request({
      schema: back_schemas.opengeodeweb_back.basemap.delete,
      params: { id },
    });
  }

  // The viewer lets the mesh go before the back deletes its files
  async function remove(id: string): Promise<void> {
    await dataStore.deregisterObject(id);
    await deleteData(id);
  }

  // Best effort: a basemap left behind is only a leftover, never an error to show twice
  async function discard(build: number, id: string, registered: boolean): Promise<void> {
    if (build <= lastBuildOfPreviousProject) {
      return;
    }
    await (registered ? remove(id) : deleteData(id)).catch(() => {
      // Already reported by the request feedback
    });
  }

  async function clear(): Promise<void> {
    const id = basemapId.value;
    basemapId.value = undefined;
    attribution.value = undefined;
    if (id === undefined) {
      return;
    }
    await remove(id);
    await hybridViewerStore.remoteRender();
  }

  async function applyOpacity(id: string): Promise<void> {
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_opacity,
      params: { id, opacity: opacity.value },
    });
  }

  // The viewer drapes the top surfaces of these data and hides the flat map on request
  async function applyDrape(id: string): Promise<void> {
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_drape,
      params: { id, around: around.value, data_ids: georeferencedIds() },
    });
  }

  // No rebuild: only the flat map around the drape is shown or hidden
  async function setAround(value: boolean): Promise<void> {
    around.value = value;
    if (basemapId.value === undefined) {
      return;
    }
    await applyDrape(basemapId.value);
    await hybridViewerStore.remoteRender();
  }

  // No rebuild: each map keeps its opacity, only the visible one reaches the viewer
  async function setOpacity(mapStyle: MapStyle, value: number): Promise<void> {
    opacities.value = { ...opacities.value, [mapStyle]: value };
    if (mapStyle !== style.value || basemapId.value === undefined) {
      return;
    }
    await applyOpacity(basemapId.value);
    await hybridViewerStore.remoteRender();
  }

  async function display(build: number, extent: { bounds: Bounds; z: number }): Promise<void> {
    if (style.value === "none" || crs.value === undefined) {
      return;
    }
    const response = await backStore.request({
      schema: back_schemas.opengeodeweb_back.basemap.build,
      params: { style: style.value, crs: crs.value, ...extent },
    });
    if (build !== lastBuild) {
      // A newer build started: this result is obsolete
      await discard(build, response.id, false);
      return;
    }
    try {
      await dataStore.registerObject(response.id, BASEMAP_NAME);
      await viewerStore.request({
        schema: viewer_schemas.opengeodeweb_viewer.mesh.apply_basemap,
        params: {
          id: response.id,
          tiles_folder: response.tiles_folder,
          columns: response.columns,
          rows: response.rows,
        },
      });
      await applyDrape(response.id);
      if (opacity.value < 1) {
        await applyOpacity(response.id);
      }
    } catch (error) {
      // The new mesh must not stay registered without anyone tracking it
      await discard(build, response.id, true);
      throw error;
    }
    if (build !== lastBuild) {
      // Superseded while applying: the new basemap must not stay displayed
      await discard(build, response.id, true);
      return;
    }
    const previous = basemapId.value;
    basemapId.value = response.id;
    attribution.value = response.attribution;
    if (previous !== undefined) {
      await discard(build, previous, true);
    }
    // Always render: the first build has no previous basemap whose removal would render
    await hybridViewerStore.remoteRender();
  }

  async function rebuild(): Promise<void> {
    lastBuild += 1;
    const build = lastBuild;
    const extent = dataBounds();
    if (style.value === "none" || crs.value === undefined || extent === undefined) {
      loading.value = false;
      await clear();
      return;
    }
    loading.value = true;
    try {
      await display(build, extent);
    } catch {
      // The request feedback already shows the error: data changes must not repeat it forever
      if (build === lastBuild) {
        hidden.value = true;
        await clear().catch(() => {
          // Already reported by the request feedback
        });
      }
    } finally {
      if (build === lastBuild) {
        loading.value = false;
      }
    }
  }

  // A new project: the viewer and the back were cleared, so nothing is requested
  function reset(): void {
    lastBuild += 1;
    lastBuildOfPreviousProject = lastBuild;
    basemapId.value = undefined;
    attribution.value = undefined;
    loading.value = false;
  }

  // "none" hides the basemap and keeps the last map, to show it again
  async function setStyle(newStyle: BasemapStyle): Promise<void> {
    if (newStyle === "none") {
      hidden.value = true;
    } else {
      map.value = newStyle;
      hidden.value = false;
    }
    await rebuild();
  }

  const scheduleRebuild = useDebounceFn(() => {
    void rebuild();
  }, REBUILD_DELAY_MILLISECONDS);
  // Rebuilt when data is added, removed, converted or aligned (its id or CRS changes)
  watch(
    () => {
      const dataKey = (items.value ?? [])
        .map((item) => `${item.id}:${item.crs?.authority}:${item.crs?.code}`)
        .join(",");
      // Also rebuilt when the georeferenced extent changes: data displayed after a project
      // Import, or moved by an align/convert that keeps the same CRS
      const extentKey = JSON.stringify(dataBounds() ?? "none");
      return `${crs.value?.authority}:${crs.value?.code}|${dataKey}|${extentKey}`;
    },
    () => {
      if (style.value !== "none") {
        void scheduleRebuild();
      }
    },
  );

  function exportStores(): {
    style: BasemapStyle;
    opacities: Record<MapStyle, number>;
    around: boolean;
  } {
    return { style: style.value, opacities: opacities.value, around: around.value };
  }

  // Called once the project data is imported. When the data is not displayed yet,
  // The rebuild finds no bounds and the watch above rebuilds once it is displayed.
  async function importStores(snapshot: BasemapSnapshot | undefined): Promise<void> {
    // A project saved with the toolbar tool had one opacity, and "none" was only its default
    const legacy = snapshot?.opacities === undefined;
    opacities.value = { ...fullOpacities(snapshot?.opacity ?? 1), ...snapshot?.opacities };
    around.value = snapshot?.around ?? true;
    const saved = snapshot?.style ?? "satellite";
    await setStyle(legacy && saved === "none" ? "satellite" : saved);
  }

  return {
    style,
    map,
    opacity,
    opacities,
    around,
    basemapId,
    attribution,
    loading,
    available,
    setStyle,
    setOpacity,
    setAround,
    rebuild,
    reset,
    exportStores,
    importStores,
  };
});

export type { BasemapSnapshot };
export type { BasemapStyle } from "@ogw_front/utils/basemap_tree";

import { MAP_STYLES, type MapStyle, sortedMaps } from "@ogw_front/utils/basemap_tree";
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
  // Visible maps; an Esri project saved satellite, streets or topo
  maps?: string[];
  // An Esri project with a single visible map
  style?: string;
  opacities?: Partial<Record<string, number>>;
  // A project saved with the toolbar tool: one opacity for the single map
  opacity?: number;
  crop?: Partial<Record<MapStyle, boolean>>;
  // An Esri project: the map around the drape, the opposite of the crop
  around?: boolean | Partial<Record<string, boolean>>;
}
interface Bounds {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}
interface Extent {
  bounds: Bounds;
  z: number;
}
interface BuiltMap {
  map: string;
  sources: string[];
}

const REBUILD_DELAY_MILLISECONDS = 500;
const BASEMAP_NAME = "basemap";
const X_MIN = 0;
const X_MAX = 1;
const Y_MIN = 2;
const Y_MAX = 3;
const Z_MAX = 5;
// The Esri maps of older projects, by the open map closest to each
const ESRI_MAPS: Record<string, MapStyle> = {
  satellite: "satellite",
  streets: "plan",
  topo: "plan",
};

function everyMap<Value>(value: Value): Record<MapStyle, Value> {
  return { satellite: value, plan: value, routes: value };
}

function openMap(name: string): MapStyle | undefined {
  return MAP_STYLES.find((style) => style === name) ?? ESRI_MAPS[name];
}

// The value saved for a map, or for the Esri maps it replaces
function savedValue<Value>(
  saved: Partial<Record<string, Value>>,
  mapStyle: MapStyle,
): Value | undefined {
  const esri = Object.keys(ESRI_MAPS).find(
    (name) => ESRI_MAPS[name] === mapStyle && saved[name] !== undefined,
  );
  return saved[mapStyle] ?? (esri === undefined ? undefined : saved[esri]);
}

function importedMaps(snapshot: BasemapSnapshot | undefined): MapStyle[] {
  if (snapshot?.maps !== undefined) {
    return sortedMaps(snapshot.maps.flatMap((name) => openMap(name) ?? []));
  }
  // A project saved with the toolbar tool had one opacity, and "none" was only its default
  const legacy = snapshot?.opacities === undefined;
  const saved = snapshot?.style ?? "satellite";
  if (saved === "none") {
    return legacy ? ["satellite"] : [];
  }
  const mapStyle = openMap(saved);
  return mapStyle === undefined ? [] : [mapStyle];
}

function importedCrop(snapshot: BasemapSnapshot | undefined): Record<MapStyle, boolean> {
  const { around, crop } = snapshot ?? {};
  if (typeof around === "boolean") {
    return everyMap(!around);
  }
  const values = everyMap(false);
  for (const mapStyle of MAP_STYLES) {
    const aroundValue = around === undefined ? undefined : savedValue(around, mapStyle);
    values[mapStyle] = crop?.[mapStyle] ?? (aroundValue === undefined ? false : !aroundValue);
  }
  return values;
}

function importedOpacities(snapshot: BasemapSnapshot | undefined): Record<MapStyle, number> {
  const saved = snapshot?.opacities ?? {};
  const values = everyMap(1);
  for (const mapStyle of MAP_STYLES) {
    values[mapStyle] = savedValue(saved, mapStyle) ?? snapshot?.opacity ?? 1;
  }
  return values;
}

// oxlint-disable max-lines-per-function, max-statements
export const useBasemapStore = defineStore("basemap", () => {
  const backStore = useBackStore();
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  const hybridViewerStore = useHybridViewerStore();

  // The last chosen maps: shown again when the basemap is shown again
  const shown = ref<MapStyle[]>(["satellite"]);
  // Shown as soon as the project has a CRS, until the user hides it
  const hidden = ref(false);
  // The visible maps, from the bottom one to the top one
  const maps = computed<MapStyle[]>(() => (hidden.value ? [] : shown.value));
  const opacities = ref<Record<MapStyle, number>>(everyMap(1));
  // Cropped: only draped on the top surfaces, out of the flat map around
  const crop = ref<Record<MapStyle, boolean>>(everyMap(false));
  const basemapId = ref<string | undefined>(undefined);
  // The maps downloaded in the current basemap: the others need a build
  const built = ref<BuiltMap[]>([]);
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
    return crsStore.crsItems.filter((item) => sameCrs(item.crs, crs.value)).map((item) => item.id);
  }
  // A map needs at least one data in the project CRS to lie under
  const available = computed(() => crs.value !== undefined && georeferencedIds().length > 0);

  // Unscaled polydata bounds: the actor bounds would include the z scale
  function dataBounds(): Extent | undefined {
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
    built.value = [];
    attribution.value = undefined;
    if (id === undefined) {
      return;
    }
    await remove(id);
    await hybridViewerStore.remoteRender();
  }

  function layersParams(): { map: string; visible: boolean; opacity: number; crop: boolean }[] {
    return built.value.flatMap(({ map }) => {
      const mapStyle = openMap(map);
      return mapStyle === undefined
        ? []
        : [
            {
              map,
              visible: maps.value.includes(mapStyle),
              opacity: opacities.value[mapStyle],
              crop: crop.value[mapStyle],
            },
          ];
    });
  }

  // The viewer recomposes its textures: no download, no new mesh
  async function applyLayers(id: string): Promise<void> {
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_layers,
      params: { id, layers: layersParams() },
    });
  }

  // The viewer drapes the top surfaces of these data
  async function applyDrape(id: string): Promise<void> {
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_drape,
      params: { id, data_ids: georeferencedIds() },
    });
  }

  async function recompose(): Promise<void> {
    if (basemapId.value === undefined) {
      return;
    }
    await applyLayers(basemapId.value);
    await hybridViewerStore.remoteRender();
  }

  async function display(build: number, extent: Extent): Promise<void> {
    if (crs.value === undefined) {
      return;
    }
    const requested = [...maps.value];
    const response = await backStore.request({
      schema: back_schemas.opengeodeweb_back.basemap.build,
      params: { maps: requested, crs: crs.value, ...extent },
    });
    if (build !== lastBuild) {
      // A newer build started: this result is obsolete
      await discard(build, response.id, false);
      return;
    }
    const previous = { id: basemapId.value, built: built.value };
    try {
      await dataStore.registerObject(response.id, BASEMAP_NAME);
      // The layers are computed from the maps just built
      built.value = response.maps;
      await viewerStore.request({
        schema: viewer_schemas.opengeodeweb_viewer.mesh.apply_basemap,
        params: {
          id: response.id,
          tiles_folder: response.tiles_folder,
          columns: response.columns,
          rows: response.rows,
          maps: response.maps,
          layers: layersParams(),
        },
      });
      await applyDrape(response.id);
    } catch (error) {
      built.value = previous.built;
      // The new mesh must not stay registered without anyone tracking it
      await discard(build, response.id, true);
      throw error;
    }
    if (build !== lastBuild) {
      built.value = previous.built;
      // Superseded while applying: the new basemap must not stay displayed
      await discard(build, response.id, true);
      return;
    }
    basemapId.value = response.id;
    attribution.value = response.attribution;
    if (previous.id !== undefined) {
      await discard(build, previous.id, true);
    }
    // Always render: the first build has no previous basemap whose removal would render
    await hybridViewerStore.remoteRender();
  }

  async function rebuild(): Promise<void> {
    lastBuild += 1;
    const build = lastBuild;
    const extent = dataBounds();
    if (maps.value.length === 0 || crs.value === undefined || extent === undefined) {
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
    built.value = [];
    attribution.value = undefined;
    loading.value = false;
  }

  // No map hides the basemap and keeps the last maps, to show them again
  async function setMaps(newMaps: readonly MapStyle[]): Promise<void> {
    if (newMaps.length === 0) {
      hidden.value = true;
    } else {
      shown.value = sortedMaps(newMaps);
      hidden.value = false;
    }
    const downloaded = new Set(built.value.map(({ map }) => map));
    const allBuilt = maps.value.every((mapStyle) => downloaded.has(mapStyle));
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

  // No rebuild. Without maps, set for every map, as the switch of the basemap category does
  async function setCrop(
    value: boolean,
    mapStyles: readonly MapStyle[] = MAP_STYLES,
  ): Promise<void> {
    crop.value = {
      ...crop.value,
      ...Object.fromEntries(mapStyles.map((mapStyle) => [mapStyle, value])),
    };
    await recompose();
  }

  const scheduleRebuild = useDebounceFn(() => {
    void rebuild();
  }, REBUILD_DELAY_MILLISECONDS);
  // Rebuilt when data is added, removed, converted or aligned (its id or CRS changes)
  watch(
    () => {
      const dataKey = crsStore.crsItems
        .map((item) => `${item.id}:${item.crs?.authority}:${item.crs?.code}`)
        .join(",");
      // Also rebuilt when the georeferenced extent changes: data displayed after a project
      // Import, or moved by an align/convert that keeps the same CRS
      const extentKey = JSON.stringify(dataBounds() ?? "none");
      return `${crs.value?.authority}:${crs.value?.code}|${dataKey}|${extentKey}`;
    },
    () => {
      if (maps.value.length > 0) {
        void scheduleRebuild();
      }
    },
  );

  function exportStores(): {
    maps: MapStyle[];
    opacities: Record<MapStyle, number>;
    crop: Record<MapStyle, boolean>;
  } {
    return { maps: maps.value, opacities: opacities.value, crop: crop.value };
  }

  // Called once the project data is imported. When the data is not displayed yet,
  // The rebuild finds no bounds and the watch above rebuilds once it is displayed.
  async function importStores(snapshot: BasemapSnapshot | undefined): Promise<void> {
    opacities.value = importedOpacities(snapshot);
    crop.value = importedCrop(snapshot);
    await setMaps(importedMaps(snapshot));
  }

  return {
    maps,
    shown,
    opacities,
    crop,
    basemapId,
    attribution,
    loading,
    available,
    setMaps,
    setOpacity,
    setCrop,
    rebuild,
    reset,
    exportStores,
    importStores,
  };
});

export type { BasemapSnapshot };
export type { BasemapStyle, MapStyle } from "@ogw_front/utils/basemap_tree";

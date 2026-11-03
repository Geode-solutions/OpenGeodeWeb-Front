import {
  type BasemapStyle,
  MAP_STYLES,
  type MapStyle,
  mapLayer,
  sortedMaps,
} from "@ogw_front/utils/basemap_tree";
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
  maps?: MapStyle[];
  // A project saved with a single visible map
  style?: BasemapStyle;
  opacities?: MapRecord<number>;
  // A project saved with the toolbar tool: one opacity for the single map
  opacity?: number;
  // A project saved with a single visible map: one "Map around" for every map
  around?: boolean | MapRecord<boolean>;
}
interface Bounds {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}
// One value per map, for the maps that have one
type MapRecord<Value> = Partial<Record<MapStyle, Value>>;
interface Extent {
  bounds: Bounds;
  z: number;
}

const REBUILD_DELAY_MILLISECONDS = 500;
const BASEMAP_NAME = "basemap";
const ATTRIBUTION_SEPARATOR = " | ";
const X_MIN = 0;
const X_MAX = 1;
const Y_MIN = 2;
const Y_MAX = 3;
const Z_MAX = 5;

function everyMap<Value>(value: Value): Record<MapStyle, Value> {
  return { satellite: value, streets: value, topo: value };
}

function without<Value>(record: MapRecord<Value>, mapStyle: MapStyle): MapRecord<Value> {
  return Object.fromEntries(Object.entries(record).filter(([key]) => key !== mapStyle));
}

function importedMaps(snapshot: BasemapSnapshot | undefined): MapStyle[] {
  if (snapshot?.maps !== undefined) {
    return snapshot.maps;
  }
  // A project saved with the toolbar tool had one opacity, and "none" was only its default
  const legacy = snapshot?.opacities === undefined;
  const saved = snapshot?.style ?? "satellite";
  if (saved === "none") {
    return legacy ? ["satellite"] : [];
  }
  return [saved];
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
  // The flat map around the draped top surfaces: off crops the map to the data
  const around = ref<Record<MapStyle, boolean>>(everyMap(true));
  const basemapIds = ref<MapRecord<string>>({});
  const attributions = ref<MapRecord<string>>({});
  // The visible maps share their providers: each one is credited once
  const attribution = computed(() => {
    const parts = sortedMaps(Object.keys(attributions.value)).flatMap(
      (mapStyle) => attributions.value[mapStyle]?.split(ATTRIBUTION_SEPARATOR) ?? [],
    );
    return parts.length === 0 ? undefined : [...new Set(parts)].join(ATTRIBUTION_SEPARATOR);
  });
  const loadings = ref<MapRecord<boolean>>({});
  const loading = computed(() => Object.values(loadings.value).some(Boolean));
  const crsStore = useCrsStore();
  const crs = computed(() => crsStore.projectCrs);
  // Each build gets a number: a build finishing after a newer one of its map started is discarded
  let builds = 0;
  const lastBuilds: MapRecord<number> = {};
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

  async function clear(mapStyle: MapStyle): Promise<void> {
    const id = basemapIds.value[mapStyle];
    basemapIds.value = without(basemapIds.value, mapStyle);
    attributions.value = without(attributions.value, mapStyle);
    if (id === undefined) {
      return;
    }
    await remove(id);
    await hybridViewerStore.remoteRender();
  }

  async function applyOpacity(mapStyle: MapStyle, id: string): Promise<void> {
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_opacity,
      params: { id, opacity: opacities.value[mapStyle] },
    });
  }

  // The viewer drapes the top surfaces of these data and hides the flat map on request
  async function applyDrape(mapStyle: MapStyle, id: string): Promise<void> {
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_drape,
      params: {
        id,
        around: around.value[mapStyle],
        data_ids: georeferencedIds(),
      },
    });
  }

  // No rebuild: only the flat map around the drape is shown or hidden.
  // Without maps, it is set for every map, as the switch of the basemap category does
  async function setAround(
    value: boolean,
    mapStyles: readonly MapStyle[] = MAP_STYLES,
  ): Promise<void> {
    around.value = {
      ...around.value,
      ...Object.fromEntries(mapStyles.map((mapStyle) => [mapStyle, value])),
    };
    const applied = mapStyles.flatMap((mapStyle) => {
      const id = basemapIds.value[mapStyle];
      return id === undefined ? [] : [applyDrape(mapStyle, id)];
    });
    if (applied.length === 0) {
      return;
    }
    await Promise.all(applied);
    await hybridViewerStore.remoteRender();
  }

  // No rebuild: each map keeps its opacity, only the visible ones reach the viewer
  async function setOpacity(mapStyle: MapStyle, value: number): Promise<void> {
    opacities.value = { ...opacities.value, [mapStyle]: value };
    const id = basemapIds.value[mapStyle];
    if (id === undefined) {
      return;
    }
    await applyOpacity(mapStyle, id);
    await hybridViewerStore.remoteRender();
  }

  async function display(mapStyle: MapStyle, build: number, extent: Extent): Promise<void> {
    if (crs.value === undefined) {
      return;
    }
    const response = await backStore.request({
      schema: back_schemas.opengeodeweb_back.basemap.build,
      params: { style: mapStyle, crs: crs.value, ...extent },
    });
    if (build !== lastBuilds[mapStyle]) {
      // A newer build of this map started: this result is obsolete
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
          // Maps shown together are stacked in a fixed order
          layer: mapLayer(mapStyle),
        },
      });
      await applyDrape(mapStyle, response.id);
      if (opacities.value[mapStyle] < 1) {
        await applyOpacity(mapStyle, response.id);
      }
    } catch (error) {
      // The new mesh must not stay registered without anyone tracking it
      await discard(build, response.id, true);
      throw error;
    }
    if (build !== lastBuilds[mapStyle]) {
      // Superseded while applying: the new basemap must not stay displayed
      await discard(build, response.id, true);
      return;
    }
    const previous = basemapIds.value[mapStyle];
    basemapIds.value = { ...basemapIds.value, [mapStyle]: response.id };
    attributions.value = {
      ...attributions.value,
      [mapStyle]: response.attribution,
    };
    if (previous !== undefined) {
      await discard(build, previous, true);
    }
    // Always render: the first build has no previous basemap whose removal would render
    await hybridViewerStore.remoteRender();
  }

  // The failed map is unchecked: data changes must not repeat its error forever
  function giveUp(mapStyle: MapStyle): void {
    const others = shown.value.filter((other) => other !== mapStyle);
    if (others.length === 0) {
      hidden.value = true;
    } else {
      shown.value = others;
    }
  }

  async function rebuildMap(mapStyle: MapStyle, extent: Extent | undefined): Promise<void> {
    builds += 1;
    const build = builds;
    lastBuilds[mapStyle] = build;
    if (!maps.value.includes(mapStyle) || crs.value === undefined || extent === undefined) {
      loadings.value = { ...loadings.value, [mapStyle]: false };
      await clear(mapStyle);
      return;
    }
    loadings.value = { ...loadings.value, [mapStyle]: true };
    try {
      await display(mapStyle, build, extent);
    } catch {
      // The request feedback already shows the error
      if (build === lastBuilds[mapStyle]) {
        giveUp(mapStyle);
        await clear(mapStyle).catch(() => {
          // Already reported by the request feedback
        });
      }
    } finally {
      if (build === lastBuilds[mapStyle]) {
        loadings.value = { ...loadings.value, [mapStyle]: false };
      }
    }
  }

  // Each map is built, or removed when it is not visible anymore
  async function rebuild(mapStyles: readonly MapStyle[] = MAP_STYLES): Promise<void> {
    const extent = dataBounds();
    await Promise.all(
      mapStyles.map(async (mapStyle) => {
        await rebuildMap(mapStyle, extent);
      }),
    );
  }

  // A new project: the viewer and the back were cleared, so nothing is requested
  function reset(): void {
    builds += 1;
    lastBuildOfPreviousProject = builds;
    // The builds in flight are obsolete
    for (const mapStyle of MAP_STYLES) {
      Reflect.deleteProperty(lastBuilds, mapStyle);
    }
    basemapIds.value = {};
    attributions.value = {};
    loadings.value = {};
  }

  // No map hides the basemap and keeps the last maps, to show them again
  async function setMaps(newMaps: readonly MapStyle[]): Promise<void> {
    if (newMaps.length === 0) {
      hidden.value = true;
    } else {
      shown.value = sortedMaps(newMaps);
      hidden.value = false;
    }
    // The maps already shown stay as they are: only the new ones are built
    await rebuild(
      MAP_STYLES.filter(
        (mapStyle) =>
          !maps.value.includes(mapStyle) ||
          (basemapIds.value[mapStyle] === undefined && loadings.value[mapStyle] !== true),
      ),
    );
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
    around: Record<MapStyle, boolean>;
  } {
    return { maps: maps.value, opacities: opacities.value, around: around.value };
  }

  // Called once the project data is imported. When the data is not displayed yet,
  // The rebuild finds no bounds and the watch above rebuilds once it is displayed.
  async function importStores(snapshot: BasemapSnapshot | undefined): Promise<void> {
    opacities.value = { ...everyMap(snapshot?.opacity ?? 1), ...snapshot?.opacities };
    const savedAround = snapshot?.around ?? true;
    around.value =
      typeof savedAround === "boolean"
        ? everyMap(savedAround)
        : { ...everyMap(true), ...savedAround };
    await setMaps(importedMaps(snapshot));
  }

  return {
    maps,
    shown,
    opacities,
    around,
    basemapIds,
    attributions,
    attribution,
    loading,
    available,
    setMaps,
    setOpacity,
    setAround,
    rebuild,
    reset,
    exportStores,
    importStores,
  };
});

export type { BasemapSnapshot };
export type { BasemapStyle, MapStyle } from "@ogw_front/utils/basemap_tree";

import { type MapStyle, sortedMaps } from "@ogw_front/utils/basemap_tree";
import back_schemas, {
  type BasemapBuildResponse,
  type CRSList,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
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
  opacities?: Partial<Record<MapStyle, number>>;
  crop?: Partial<Record<MapStyle, boolean>>;
}
interface Extent {
  bounds: BasemapBuildResponse["bounds"];
  z: number;
}
// The grid of the basemap shown, and the height it lies at
interface BasemapGrid extends Pick<BasemapBuildResponse, "bounds" | "columns" | "zoom"> {
  z: number;
}
interface Layer {
  map: MapStyle;
  visible: boolean;
  opacity: number;
  crop: boolean;
}

const REBUILD_DELAY_MILLISECONDS = 500;
const BASEMAP_NAME = "basemap";
const X_MIN = 0;
const X_MAX = 1;
const Y_MIN = 2;
const Y_MAX = 3;
const Z_MAX = 5;

function everyMap<Value>(value: Value): Record<MapStyle, Value> {
  return { satellite: value, plan: value, routes: value };
}

function ignoreError(): void {
  // Already reported by the request feedback
}

// oxlint-disable max-lines-per-function, max-statements
export const useBasemapStore = defineStore("basemap", () => {
  const backStore = useBackStore();
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  const hybridViewerStore = useHybridViewerStore();
  const crsStore = useCrsStore();

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
  // The detail store compares its resolution with the screen
  const grid = ref<BasemapGrid | undefined>(undefined);
  // The maps downloaded in the current basemap: the others need a build
  const built = ref<MapStyle[]>([]);
  const attribution = ref<string | undefined>(undefined);
  // Each build gets a number: a build finishing after a newer one started is discarded
  let lastBuild = 0;
  // Builds up to this number belong to a project the viewer and the back already cleared
  let lastBuildOfPreviousProject = 0;

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

  // Unscaled polydata bounds: the actor bounds would include the z scale
  function dataBounds(): Extent | undefined {
    const georeferenced = new Set(georeferencedIds());
    const boxes = Object.entries(hybridViewerStore.hybridDb)
      .filter(([id]) => georeferenced.has(id))
      .map(([, entry]) => entry.polydata.getBounds());
    if (boxes.length === 0) {
      return undefined;
    }
    return {
      bounds: {
        x_min: Math.min(...boxes.map((box) => box[X_MIN])),
        y_min: Math.min(...boxes.map((box) => box[Y_MIN])),
        x_max: Math.max(...boxes.map((box) => box[X_MAX])),
        y_max: Math.max(...boxes.map((box) => box[Y_MAX])),
      },
      // At the top of the data, like the ground above subsurface data, ready to drape surfaces
      z: Math.max(...boxes.map((box) => box[Z_MAX])),
    };
  }

  // Best effort: a map left behind is only a leftover, never an error to show twice.
  // A registered map leaves the viewer before the back deletes its files
  async function discard(id: string, registered: boolean): Promise<void> {
    if (registered) {
      await dataStore.deregisterObject(id).catch(ignoreError);
    }
    await backStore
      .request({ schema: back_schemas.opengeodeweb_back.basemap.delete, params: { id } })
      .catch(ignoreError);
  }

  // A build of a previous project: the viewer and the back already cleared it
  async function discardBuild(build: number, id: string, registered: boolean): Promise<void> {
    if (build > lastBuildOfPreviousProject) {
      await discard(id, registered);
    }
  }

  function forget(): void {
    basemapId.value = undefined;
    grid.value = undefined;
    built.value = [];
    attribution.value = undefined;
  }

  async function clear(): Promise<void> {
    const id = basemapId.value;
    forget();
    if (id === undefined) {
      return;
    }
    await discard(id, true);
    await hybridViewerStore.remoteRender();
  }

  function layersParams(): Layer[] {
    return built.value.map((map) => ({
      map,
      visible: maps.value.includes(map),
      opacity: opacities.value[map],
      crop: crop.value[map],
    }));
  }

  // The viewer recomposes its textures: no download, no new mesh
  async function applyLayers(id: string): Promise<void> {
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_layers,
      params: { id, layers: layersParams() },
    });
  }

  // Registers a built map, shows it with the current layers and drapes the top surfaces of the
  // Georeferenced data. Returns the layers sent: the states changed meanwhile are sent again
  async function applyBasemap(
    response: BasemapBuildResponse,
    name: string,
    detailOf?: string,
  ): Promise<string> {
    await dataStore.registerObject(response.id, name);
    const layers = layersParams();
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.apply_basemap,
      params: {
        id: response.id,
        columns: response.columns,
        rows: response.rows,
        maps: response.maps,
        layers,
        detail_of: detailOf,
      },
    });
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_drape,
      params: { id: response.id, data_ids: georeferencedIds() },
    });
    return JSON.stringify(layers);
  }

  // At most one recomposition runs: changes made meanwhile (a slider dragged) are sent
  // Once, with the latest states, when it returns
  let recomposing: Promise<void> | undefined = undefined;
  let recomposeAgain = false;

  async function recomposeLatest(): Promise<void> {
    recomposeAgain = false;
    const id = basemapId.value;
    if (id === undefined) {
      return;
    }
    await applyLayers(id);
    await hybridViewerStore.remoteRender();
    if (recomposeAgain) {
      await recomposeLatest();
    }
  }

  async function recompose(): Promise<void> {
    if (recomposing !== undefined) {
      recomposeAgain = true;
      await recomposing;
      return;
    }
    recomposing = recomposeLatest();
    try {
      await recomposing;
    } finally {
      recomposing = undefined;
      recomposeAgain = false;
    }
  }

  async function display(build: number, extent: Extent, crs: CRSList): Promise<void> {
    const response = await backStore.request({
      schema: back_schemas.opengeodeweb_back.basemap.build,
      params: { maps: [...maps.value], crs, ...extent },
    });
    if (build !== lastBuild) {
      // A newer build started: this result is obsolete
      await discardBuild(build, response.id, false);
      return;
    }
    const previous = { id: basemapId.value, built: built.value };
    // The layers are computed from the maps just built
    built.value = sortedMaps(response.maps.map(({ map }) => map));
    let sentLayers = "";
    try {
      sentLayers = await applyBasemap(response, BASEMAP_NAME);
    } catch (error) {
      built.value = previous.built;
      // The new mesh must not stay registered without anyone tracking it
      await discardBuild(build, response.id, true);
      throw error;
    }
    if (build !== lastBuild) {
      built.value = previous.built;
      // Superseded while applying: the new basemap must not stay displayed
      await discardBuild(build, response.id, true);
      return;
    }
    basemapId.value = response.id;
    grid.value = {
      bounds: response.bounds,
      zoom: response.zoom,
      columns: response.columns,
      z: extent.z,
    };
    attribution.value = response.attribution;
    if (previous.id !== undefined) {
      await discardBuild(build, previous.id, true);
    }
    // The states changed while the basemap was built: the viewer still has the old ones
    if (JSON.stringify(layersParams()) !== sentLayers) {
      await applyLayers(response.id);
    }
    // Always render: the first build has no previous basemap whose removal would render
    await hybridViewerStore.remoteRender();
  }

  async function rebuild(): Promise<void> {
    lastBuild += 1;
    const build = lastBuild;
    const extent = dataBounds();
    const crs = crsStore.projectCrs;
    if (maps.value.length === 0 || crs === undefined || extent === undefined) {
      await clear();
      return;
    }
    try {
      await display(build, extent, crs);
    } catch {
      // The request feedback already shows the error: data changes must not repeat it forever
      if (build === lastBuild) {
        hidden.value = true;
        await clear().catch(ignoreError);
      }
    }
  }

  // A new project: the viewer and the back were cleared, so nothing is requested
  function reset(): void {
    lastBuild += 1;
    lastBuildOfPreviousProject = lastBuild;
    forget();
  }

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
    discard,
    exportStores,
    importStores,
  };
});

export type { BasemapSnapshot };
export type { MapStyle } from "@ogw_front/utils/basemap_tree";

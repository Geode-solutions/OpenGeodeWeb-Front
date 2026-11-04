import type { ComputedRef, Ref } from "vue";
import { type Layer, ignoreError, useBasemapViewer } from "./viewer.js";
import { type MapStyle, sortedMaps } from "@ogw_front/utils/basemap_tree";
import back_schemas, {
  type BasemapBuildResponse,
  type CRSList,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { Extent } from "./extent.js";
import { useBackStore } from "@ogw_front/stores/back";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// The grid of the basemap shown, and the height it lies at
interface BasemapGrid extends Pick<BasemapBuildResponse, "bounds" | "columns" | "zoom"> {
  z: number;
}

interface BuildContext {
  maps: ComputedRef<MapStyle[]>;
  hidden: Ref<boolean>;
  // The maps downloaded in the current basemap: the others need a build
  built: Ref<MapStyle[]>;
  layersParams: () => Layer[];
  applyLayers: (id: string) => Promise<void>;
  applyBasemap: (response: BasemapBuildResponse, name: string) => Promise<string>;
  dataBounds: () => Extent | undefined;
}

interface BasemapBuilds {
  basemapId: Ref<string | undefined>;
  grid: Ref<BasemapGrid | undefined>;
  attribution: Ref<string | undefined>;
  rebuild: () => Promise<void>;
  reset: () => void;
}

const BASEMAP_NAME = "basemap";

// The basemap downloaded for the visible maps around the data, one build replacing the other
// oxlint-disable max-lines-per-function, max-statements
function useBasemapBuilds(context: BuildContext): BasemapBuilds {
  const { maps, hidden, built, layersParams, applyLayers, applyBasemap, dataBounds } = context;
  const backStore = useBackStore();
  const crsStore = useCrsStore();
  const hybridViewerStore = useHybridViewerStore();
  const { discardMap } = useBasemapViewer();
  const basemapId = ref<string | undefined>(undefined);
  // The detail store compares its resolution with the screen
  const grid = ref<BasemapGrid | undefined>(undefined);
  const attribution = ref<string | undefined>(undefined);
  // Each build gets a number: a build finishing after a newer one started is discarded
  let lastBuild = 0;
  // Builds up to this number belong to a project the viewer and the back already cleared
  let lastBuildOfPreviousProject = 0;
  // The maps of the basemap shown: a build that fails or is superseded gives them back
  let shownMaps: MapStyle[] = [];

  // A build of a previous project: the viewer and the back already cleared it
  async function discardBuild(build: number, id: string, registered: boolean): Promise<void> {
    if (build > lastBuildOfPreviousProject) {
      await discardMap(id, registered);
    }
  }

  function forget(): void {
    basemapId.value = undefined;
    grid.value = undefined;
    built.value = [];
    shownMaps = [];
    attribution.value = undefined;
  }

  async function clear(): Promise<void> {
    const id = basemapId.value;
    forget();
    if (id === undefined) {
      return;
    }
    await discardMap(id, true);
    await hybridViewerStore.remoteRender();
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
    const previousId = basemapId.value;
    // The layers are computed from the maps just built
    const builtMaps = sortedMaps(response.maps.map(({ map }) => map));
    built.value = builtMaps;
    // Only while this build still owns the built maps: a newer build may have set its own
    function giveBackMaps(): void {
      if (built.value === builtMaps) {
        built.value = shownMaps;
      }
    }
    let sentLayers = "";
    try {
      sentLayers = await applyBasemap(response, BASEMAP_NAME);
    } catch (error) {
      giveBackMaps();
      // The new mesh must not stay registered without anyone tracking it
      await discardBuild(build, response.id, true);
      throw error;
    }
    if (build !== lastBuild) {
      giveBackMaps();
      // Superseded while applying: the new basemap must not stay displayed
      await discardBuild(build, response.id, true);
      return;
    }
    basemapId.value = response.id;
    shownMaps = builtMaps;
    const { bounds, zoom, columns } = response;
    grid.value = { bounds, zoom, columns, z: extent.z };
    attribution.value = response.attribution;
    if (previousId !== undefined) {
      await discardBuild(build, previousId, true);
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

  return { basemapId, grid, attribution, rebuild, reset };
}

export type { BasemapGrid };
export { useBasemapBuilds };

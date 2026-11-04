import back_schemas, {
  type BasemapBuildResponse,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { MapStyle } from "@ogw_front/utils/basemap_tree";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

interface Layer {
  map: MapStyle;
  visible: boolean;
  opacity: number;
  crop: boolean;
}

function ignoreError(): void {
  // Already reported by the request feedback
}

interface MapToShow {
  response: BasemapBuildResponse;
  name: string;
  layers: Layer[];
  dataIds: string[];
}

interface BasemapViewer {
  discardMap: (id: string, registered: boolean) => Promise<void>;
  sendLayers: (id: string, layers: Layer[]) => Promise<void>;
  showMap: (map: Readonly<MapToShow>, detailOf?: string) => Promise<void>;
}

// The stores are taken once: a call still running after a project reset reaches its own stores
function useBasemapViewer(): BasemapViewer {
  const backStore = useBackStore();
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();

  // Best effort: a map left behind is only a leftover, never an error to show twice.
  // A registered map leaves the viewer before the back deletes its files
  async function discardMap(id: string, registered: boolean): Promise<void> {
    if (registered) {
      await dataStore.deregisterObject(id).catch(ignoreError);
    }
    await backStore
      .request({ schema: back_schemas.opengeodeweb_back.basemap.delete, params: { id } })
      .catch(ignoreError);
  }

  // The viewer recomposes its textures: no download, no new mesh
  async function sendLayers(id: string, layers: Layer[]): Promise<void> {
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.mesh.basemap_layers,
      params: { id, layers },
    });
  }

  // Registers a built map, shows it with the layers and drapes the top surfaces of the data
  async function showMap(
    { response, name, layers, dataIds }: Readonly<MapToShow>,
    detailOf?: string,
  ): Promise<void> {
    await dataStore.registerObject(response.id, name);
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
      params: { id: response.id, data_ids: dataIds },
    });
  }

  return { discardMap, sendLayers, showMap };
}

// At most one run at a time: calls made meanwhile (a slider dragged) run once more when it
// Returns, with the latest states
function coalesced(run: () => Promise<void>): () => Promise<void> {
  let running: Promise<void> | undefined = undefined;
  let again = false;
  async function latest(): Promise<void> {
    again = false;
    await run();
    if (again) {
      await latest();
    }
  }
  return async () => {
    if (running !== undefined) {
      again = true;
      await running;
      return;
    }
    running = latest();
    try {
      await running;
    } finally {
      running = undefined;
      again = false;
    }
  };
}

export type { Layer };
export { coalesced, ignoreError, useBasemapViewer };

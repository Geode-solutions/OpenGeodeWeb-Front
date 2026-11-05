import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import { releaseViewerDatabase } from "@ogw_front/composables/project_manager_helpers/viewer_session";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Empties the viewer and every store, ready to receive an imported project.
async function resetProject(): Promise<void> {
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  const treeviewStore = useTreeviewStore();
  const hybridViewerStore = useHybridViewerStore();
  const crsStore = useCrsStore();
  const basemapStore = useBasemapStore();

  await viewerStore.ws_connect();

  await releaseViewerDatabase(viewerStore.client);
  const resetVisualizationSchema = viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization;
  const timeout = undefined;
  await viewerStore.request({ schema: resetVisualizationSchema, timeout });

  treeviewStore.clear();
  await dataStore.clear();
  hybridViewerStore.clear();
  crsStore.reset();
  basemapStore.reset();
}

export { resetProject };

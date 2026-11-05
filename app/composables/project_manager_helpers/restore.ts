import type { ProjectSnapshot } from "@ogw_front/composables/project_manager_helpers/types";
import { importProjectToViewer } from "@ogw_front/composables/project_manager_helpers/viewer_session";
import { importWorkflowFromSnapshot } from "@ogw_front/utils/import_workflow";
import { oldestCrs } from "@ogw_front/utils/crs";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";
import { useViewerStore } from "@ogw_front/stores/viewer";

// After every data item is added: on partial data the project CRS would follow them.
// A project saved without a project CRS takes the one of its oldest data, read in the
// Snapshot: the stored items carry the import time as creation date
function restoreCrs(snapshot: ProjectSnapshot): void {
  const crsStore = useCrsStore();
  if (snapshot.crs?.projectCrs === undefined) {
    crsStore.importStores({ projectCrs: oldestCrs(snapshot.data?.items ?? []) });
  } else {
    crsStore.importStores(snapshot.crs);
  }
}

async function restoreData(snapshot: ProjectSnapshot): Promise<void> {
  const dataStore = useDataStore();
  const treeviewStore = useTreeviewStore();
  const hybridViewerStore = useHybridViewerStore();

  treeviewStore.importStores(snapshot.treeview);
  if (snapshot.data !== undefined) {
    await dataStore.importStores(snapshot.data);
  }
  await hybridViewerStore.initHybridViewer();
  await importWorkflowFromSnapshot(snapshot.data?.items ?? []);
}

async function restoreViews(snapshot: ProjectSnapshot): Promise<void> {
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();
  const basemapStore = useBasemapStore();

  restoreCrs(snapshot);
  await basemapStore.importStores(snapshot.basemap);
  await hybridViewerStore.importStores(snapshot.hybridViewer);
  if (snapshot.dataStyle !== undefined) {
    await dataStyleStore.importStores(snapshot.dataStyle);
  }
  await dataStyleStore.applyAllStylesFromState();
}

// Loads a project snapshot into the (already reset) viewer and stores.
async function restoreProject(snapshot: ProjectSnapshot): Promise<void> {
  const viewerStore = useViewerStore();
  const treeviewStore = useTreeviewStore();

  treeviewStore.isImporting = true;

  await importProjectToViewer(viewerStore.client);
  await restoreData(snapshot);
  await restoreViews(snapshot);

  treeviewStore.finalizeImportSelection();
  treeviewStore.isImporting = false;
}

export { restoreProject };

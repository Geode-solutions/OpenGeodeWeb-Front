import back_schemas, {
  type CRSList,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import fileDownload from "js-file-download";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import { type DataStyleSnapshot, useDataStyleStore } from "@ogw_front/stores/data_style";
import { type NewDataItem, useDataStore } from "@ogw_front/stores/data";
import { type TreeviewSnapshot, useTreeviewStore } from "@ogw_front/stores/treeview";
import type { CameraSnapshot } from "@ogw_internal/stores/hybrid_viewer/camera";
import type { ModelComponentRecord } from "@ogw_front/stores/data_helpers/mesh.js";
import type { ModelComponentRelationRecord } from "@ogw_front/stores/data.js";
import { importWorkflowFromSnapshot } from "@ogw_front/utils/import_workflow";
import { oldestCrs } from "@ogw_front/utils/crs";
import { useAppStore } from "@ogw_front/stores/app";
import { useBackStore } from "@ogw_front/stores/back";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

interface ProjectDataSnapshot {
  items: NewDataItem[];
  modelComponents: ModelComponentRecord[];
  modelComponentsRelations: ModelComponentRelationRecord[];
}

interface ProjectSnapshot {
  treeview?: TreeviewSnapshot;
  data?: ProjectDataSnapshot;
  hybridViewer?: CameraSnapshot;
  dataStyle?: DataStyleSnapshot;
  crs?: { projectCrs?: CRSList };
}

async function exportProject(): Promise<{ result: Blob }> {
  const appStore = useAppStore();
  const backStore = useBackStore();
  const feedbackStore = useFeedbackStore();
  const snapshot = await appStore.exportStores();
  const schema = back_schemas.opengeodeweb_back.export_project;
  const defaultName = "project.vease";
  const params = { snapshot, filename: defaultName };
  const result = await backStore.request({ schema, params });
  fileDownload(result, defaultName);
  feedbackStore.add_success("Project exported successfully");
  return { result };
}

async function releaseViewerDatabase(
  client: ReturnType<typeof useViewerStore>["client"],
): Promise<void> {
  if (
    client !== undefined &&
    client.getConnection !== undefined &&
    client.getConnection().getSession !== undefined
  ) {
    await client.getConnection().getSession().call("opengeodeweb_viewer.release_database", [{}]);
  }
}

async function importProjectToViewer(
  client: ReturnType<typeof useViewerStore>["client"],
): Promise<void> {
  if (
    client !== undefined &&
    client.getConnection !== undefined &&
    client.getConnection().getSession !== undefined
  ) {
    await client.getConnection().getSession().call("opengeodeweb_viewer.import_project", [{}]);
  }
}

async function importProject(file: File): Promise<void> {
  const backStore = useBackStore();
  const dataStyleStore = useDataStyleStore();
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  const treeviewStore = useTreeviewStore();
  const hybridViewerStore = useHybridViewerStore();
  const crsStore = useCrsStore();

  await viewerStore.ws_connect();

  await releaseViewerDatabase(viewerStore.client);
  const resetVisualizationSchema = viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization;
  const timeout = undefined;
  await viewerStore.request({ schema: resetVisualizationSchema, timeout });

  treeviewStore.clear();
  await dataStore.clear();
  hybridViewerStore.clear();
  crsStore.reset();

  const importProjectSchema = back_schemas.opengeodeweb_back.import_project;
  const form = new FormData();
  const originalFileName = file.name.length > 0 ? file.name : "project.vease";
  if (!originalFileName.toLowerCase().endsWith(".vease")) {
    throw new Error("Uploaded file must be a .vease");
  }
  form.append("file", file, originalFileName);

  const result = await backStore.request({ schema: importProjectSchema, params: form });
  const snapshot: ProjectSnapshot = result.snapshot;

  treeviewStore.isImporting = true;

  await importProjectToViewer(viewerStore.client);

  treeviewStore.importStores(snapshot.treeview);
  if (snapshot.data !== undefined) {
    await dataStore.importStores(snapshot.data);
  }
  await hybridViewerStore.initHybridViewer();

  const items = snapshot.data?.items ?? [];
  await importWorkflowFromSnapshot(items);
  // After every data item is added: on partial data the project CRS would follow them.
  // A project saved without a project CRS takes the one of its oldest data, read in the
  // Snapshot: the stored items carry the import time as creation date
  crsStore.importStores(
    snapshot.crs?.projectCrs === undefined
      ? { projectCrs: oldestCrs(snapshot.data?.items ?? []) }
      : snapshot.crs,
  );
  await hybridViewerStore.importStores(snapshot.hybridViewer);
  if (snapshot.dataStyle !== undefined) {
    await dataStyleStore.importStores(snapshot.dataStyle);
  }
  await dataStyleStore.applyAllStylesFromState();

  treeviewStore.finalizeImportSelection();
  treeviewStore.isImporting = false;
  const feedbackStore = useFeedbackStore();
  feedbackStore.add_success("Project imported successfully");
}

export { exportProject, importProject };

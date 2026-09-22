import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import fileDownload from "js-file-download";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { type DataStyleSnapshot, useDataStyleStore } from "@ogw_front/stores/data_style";
import { type NewDataItem, useDataStore } from "@ogw_front/stores/data";
import { type TreeviewSnapshot, useTreeviewStore } from "@ogw_front/stores/treeview";
import type { CameraSnapshot } from "@ogw_internal/stores/hybrid_viewer/camera";
import type { ModelComponentRecord } from "@ogw_front/stores/data_helpers/mesh.js";
import type { ModelComponentRelationRecord } from "@ogw_front/stores/data.js";
import { fetchRaw } from "@ogw_shared/utils/fetch_raw";
import { importWorkflowFromSnapshot } from "@ogw_front/utils/import_workflow";
import { useAppStore } from "@ogw_front/stores/app";
import { useBackStore } from "@ogw_front/stores/back";
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
}

// The backend response is an untyped network payload; this is the one place its shape is asserted.
function isImportSnapshotResponse(value: unknown): value is { snapshot?: ProjectSnapshot } {
  return typeof value === "object" && value !== null;
}

function isFileDownloadData(
  value: unknown,
): value is string | ArrayBuffer | ArrayBufferView | Blob {
  return (
    typeof value === "string" ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    value instanceof Blob
  );
}

async function exportProject(): Promise<{ result: unknown }> {
  console.log("[export triggered]");
  const appStore = useAppStore();
  const backStore = useBackStore();
  const feedbackStore = useFeedbackStore();
  const snapshot = await appStore.exportStores();
  const schema = back_schemas.opengeodeweb_back.export_project;
  const defaultName = "project.vease";
  const params = { snapshot, filename: defaultName };
  const result = await fetchRaw({
    route: schema.$id,
    params,
    method: schema.methods[0],
    baseURL: backStore.base_url,
  });

  if (!isFileDownloadData(result)) {
    throw new Error("Unexpected export_project response type");
  }
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

async function importProject(file: Readonly<File>): Promise<void> {
  const backStore = useBackStore();
  const dataStyleStore = useDataStyleStore();
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  const treeviewStore = useTreeviewStore();
  const hybridViewerStore = useHybridViewerStore();

  await viewerStore.ws_connect();

  await releaseViewerDatabase(viewerStore.client);
  const resetVisualizationSchema = viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization;
  const timeout = undefined;
  await viewerStore.request({ schema: resetVisualizationSchema, timeout });

  treeviewStore.clear();
  await dataStore.clear();
  hybridViewerStore.clear();

  const importProjectSchema = back_schemas.opengeodeweb_back.import_project;
  const form = new FormData();
  const originalFileName = file.name.length > 0 ? file.name : "project.vease";
  if (!originalFileName.toLowerCase().endsWith(".vease")) {
    throw new Error("Uploaded file must be a .vease");
  }
  form.append("file", file, originalFileName);

  const result = await fetchRaw({
    route: importProjectSchema.$id,
    params: form,
    method: importProjectSchema.methods[0],
    baseURL: backStore.base_url,
  });
  const snapshot = (isImportSnapshotResponse(result) ? result.snapshot : undefined) ?? {};

  treeviewStore.isImporting = true;

  await importProjectToViewer(viewerStore.client);

  treeviewStore.importStores(snapshot.treeview);
  if (snapshot.data !== undefined) {
    await dataStore.importStores(snapshot.data);
  }
  await hybridViewerStore.initHybridViewer();

  const items = snapshot.data?.items ?? [];
  await importWorkflowFromSnapshot(items);
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

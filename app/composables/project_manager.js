import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import fileDownload from "js-file-download";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { importWorkflowFromSnapshot } from "@ogw_front/utils/import_workflow";

import { useAppStore } from "@ogw_front/stores/app";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";
import { useViewerStore } from "@ogw_front/stores/viewer";

async function exportProject() {
  console.log("[export triggered]");
  const appStore = useAppStore();
  const backStore = useBackStore();
  const feedbackStore = useFeedbackStore();
  const snapshot = await appStore.exportStores();
  const schema = back_schemas.opengeodeweb_back.export_project;
  const defaultName = "project.vease";

  const result = await $fetch(schema.$id, {
    baseURL: backStore.base_url,
    method: schema.methods.find((method) => method !== "OPTIONS"),
    body: { snapshot, filename: defaultName },
  });
  fileDownload(result, defaultName);
  feedbackStore.add_success("Project exported successfully");
  return { result };
}

async function importProject(file) {
  const backStore = useBackStore();
  const dataStyleStore = useDataStyleStore();
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  const treeviewStore = useTreeviewStore();
  const hybridViewerStore = useHybridViewerStore();

  await viewerStore.ws_connect();

  const { client } = viewerStore;
  if (client && client.getConnection && client.getConnection().getSession) {
    await client.getConnection().getSession().call("opengeodeweb_viewer.release_database", [{}]);
  }
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization;
  const timeout = undefined;
  await viewerStore.request({ schema, timeout });

  treeviewStore.clear();
  dataStore.clear();
  hybridViewerStore.clear();

  const schemaImport = back_schemas.opengeodeweb_back.import_project;
  const form = new FormData();
  const originalFileName = file && file.name ? file.name : "project.vease";
  if (!originalFileName.toLowerCase().endsWith(".vease")) {
    throw new Error("Uploaded file must be a .vease");
  }
  form.append("file", file, originalFileName);

  const result = await $fetch(schemaImport.$id, {
    baseURL: backStore.base_url,
    method: "POST",
    body: form,
  });
  const snapshot = result && result.snapshot ? result.snapshot : {};

  treeviewStore.isImporting = true;

  const { client: client2 } = viewerStore;
  if (client2 && client2.getConnection && client2.getConnection().getSession) {
    await client2.getConnection().getSession().call("opengeodeweb_viewer.import_project", [{}]);
  }

  await treeviewStore.importStores(snapshot.treeview);
  await dataStore.importStores(snapshot.data);
  await hybridViewerStore.initHybridViewer();

  const items = snapshot?.data?.items || [];
  await importWorkflowFromSnapshot(items);
  await hybridViewerStore.importStores(snapshot.hybridViewer);
  await dataStyleStore.importStores(snapshot.dataStyle);
  await dataStyleStore.applyAllStylesFromState();

  treeviewStore.finalizeImportSelection();
  treeviewStore.isImporting = false;
  const feedbackStore = useFeedbackStore();
  feedbackStore.add_success("Project imported successfully");
}

export { exportProject, importProject };

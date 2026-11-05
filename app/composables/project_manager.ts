import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import fileDownload from "js-file-download";

import type { ProjectSnapshot } from "@ogw_front/composables/project_manager_helpers/types";
import { resetProject } from "@ogw_front/composables/project_manager_helpers/reset";
import { restoreProject } from "@ogw_front/composables/project_manager_helpers/restore";
import { useAppStore } from "@ogw_front/stores/app";
import { useBackStore } from "@ogw_front/stores/back";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

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

async function importProject(file: File): Promise<void> {
  const backStore = useBackStore();

  await resetProject();

  const importProjectSchema = back_schemas.opengeodeweb_back.import_project;
  const form = new FormData();
  const originalFileName = file.name.length > 0 ? file.name : "project.vease";
  if (!originalFileName.toLowerCase().endsWith(".vease")) {
    throw new Error("Uploaded file must be a .vease");
  }
  form.append("file", file, originalFileName);

  const result = await backStore.request({ schema: importProjectSchema, params: form });
  const snapshot: ProjectSnapshot = result.snapshot;

  await restoreProject(snapshot);

  const feedbackStore = useFeedbackStore();
  feedbackStore.add_success("Project imported successfully");
}

export { exportProject, importProject };

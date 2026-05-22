// oxlint-disable promise/prefer-await-to-then
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";

// Local imports
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

async function importWorkflow(files) {
  const results = await Promise.all(
    files.map(({ filename, geode_object_type }) => importFile(filename, geode_object_type)),
  );
  const hybridViewerStore = useHybridViewerStore();
  hybridViewerStore.remoteRender();
  return results;
}

function buildImportItemFromPayloadApi(value, geode_object_type) {
  return {
    geode_object_type,
    ...value,
  };
}

async function importItem(item) {
  const dataStore = useDataStore();
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();
  const treeviewStore = useTreeviewStore();

  if (item.nb_vertices === 0) {
    const feedbackStore = useFeedbackStore();
    feedbackStore.add_warning(`Pointset "${item.name}" is empty`);
  }

  const registerTask = dataStore.registerObject(item.id);
  const addDataTask = dataStore.addItem(item);
  const addDataComponentsTask =
    item.viewer_type === "model" ? dataStore.addComponents(item) : Promise.resolve();
  const addDataRelationsTask =
    item.viewer_type === "model" ? dataStore.addComponentRelations(item) : Promise.resolve();
  treeviewStore.addItem(item.geode_object_type, item.name, item.id, item.viewer_type);
  const addDataStyleTask = dataStyleStore.addDataStyle(item.id, item.geode_object_type);
  const addViewerTask = addDataTask.then(() => {
    if (item.nb_vertices === 0) {
      return;
    }
    return hybridViewerStore.addItem(item.id);
  });
  const applyStyleTask = Promise.all([registerTask, addDataComponentsTask, addDataStyleTask]).then(
    () => dataStyleStore.applyDefaultStyle(item.id),
  );
  await Promise.all([
    registerTask,
    addDataTask,
    addDataComponentsTask,
    addDataRelationsTask,
    addViewerTask,
    applyStyleTask,
  ]);
  return item.id;
}

async function importFile(filename, geode_object_type) {
  const backStore = useBackStore();
  const response = await backStore.request(back_schemas.opengeodeweb_back.save_viewable_file, {
    geode_object_type,
    filename,
  });

  const item = buildImportItemFromPayloadApi(response, geode_object_type);
  return importItem(item);
}

async function importWorkflowFromSnapshot(items) {
  console.log("[importWorkflowFromSnapshot] start", { count: items?.length });
  const hybridViewerStore = useHybridViewerStore();

  const ids = await Promise.all(items.map((item) => importItem(item)));
  hybridViewerStore.remoteRender();
  console.log("[importWorkflowFromSnapshot] done", { ids });
  return ids;
}

export { importFile, importWorkflow, importWorkflowFromSnapshot, importItem };

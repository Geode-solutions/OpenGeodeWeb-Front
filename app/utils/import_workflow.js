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
  const chunk_size = 5;
  const chunks = [];
  for (let i = 0; i < files.length; i += chunk_size) {
    chunks.push(files.slice(i, i + chunk_size));
  }

  const results = [];
  async function processChunk(chunkIndex) {
    if (chunkIndex >= chunks.length) {
      return;
    }
    const chunk = chunks[chunkIndex];
    const chunk_results = await Promise.all(
      chunk.map(({ filename, geode_object_type }) => importFile(filename, geode_object_type)),
    );
    results.push(...chunk_results);
    await processChunk(chunkIndex + 1);
  }
  await processChunk(0);
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
  const schema = back_schemas.opengeodeweb_back.save_viewable_file;
  const params = {
    geode_object_type,
    filename,
  };
  const response = await backStore.request({ schema, params });
  const item = buildImportItemFromPayloadApi(response, geode_object_type);
  return importItem(item);
}

async function importWorkflowFromSnapshot(items) {
  console.log("[importWorkflowFromSnapshot] start", { count: items?.length });
  const hybridViewerStore = useHybridViewerStore();

  const chunk_size = 5;
  const chunks = [];
  for (let i = 0; i < items.length; i += chunk_size) {
    chunks.push(items.slice(i, i + chunk_size));
  }

  const ids = [];
  async function processChunk(chunkIndex) {
    if (chunkIndex >= chunks.length) {
      return;
    }
    const chunk = chunks[chunkIndex];
    const chunk_ids = await Promise.all(chunk.map((item) => importItem(item)));
    ids.push(...chunk_ids);
    await processChunk(chunkIndex + 1);
  }
  await processChunk(0);
  hybridViewerStore.remoteRender();
  console.log("[importWorkflowFromSnapshot] done", { ids });
  return ids;
}

export { importFile, importWorkflow, importWorkflowFromSnapshot, importItem };

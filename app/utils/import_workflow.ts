// oxlint-disable promise/prefer-await-to-then
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { consola } from "consola";

// Local imports
import type { GeodeObjectType, GeodeObjectTyped } from "@ogw_front/types/identifiers";
import { type LegacyDataId, fromLegacyDataId } from "@ogw_front/utils/legacy_data_id";
import { type NewDataItem, useDataStore } from "@ogw_front/stores/data";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

interface FileToImport extends Readonly<GeodeObjectTyped> {
  readonly filename: string;
}

// NewDataItem has mutable array fields (mesh_components, collection_components), so it can't
// Satisfy prefer-readonly-parameter-types deeply; left unfixed (same pattern as app/plugins/auto_store_register.ts).
async function importDataItem(item: NewDataItem): Promise<string> {
  const dataStore = useDataStore();
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();
  const treeviewStore = useTreeviewStore();
  if (item.nb_vertices === 0) {
    const feedbackStore = useFeedbackStore();
    feedbackStore.add_warning(`"${item.geode_object_type}" with name "${item.name}" is empty`);
  }
  const addDataTask = dataStore.addItem(item);
  const registerTask = addDataTask.then(async () => {
    if (!(await dataStore.isItemViewable(item))) {
      return undefined;
    }
    return dataStore.registerObject(item.data_id, item.name ?? item.data_id);
  });
  let addDataComponentsTask: Promise<string | undefined> = Promise.resolve(undefined);
  let addDataRelationsTask: Promise<string | undefined> = Promise.resolve(undefined);
  if (item.viewer_type === "model") {
    addDataComponentsTask = dataStore.addComponents(item);
    addDataRelationsTask = dataStore.addComponentRelations(item);
  }
  treeviewStore.addItem(
    item.geode_object_type,
    item.name ?? item.data_id,
    item.data_id,
    item.geode_id,
    item.viewer_type,
  );
  const addDataStyleTask = dataStyleStore.addDataStyle(item.data_id, item.geode_object_type);
  const addViewerTask = addDataTask.then(async () => {
    if (!(await dataStore.isItemViewable(item))) {
      return undefined;
    }
    return hybridViewerStore.addItem(item.data_id);
  });
  const applyStyleTask = Promise.all([registerTask, addDataComponentsTask, addDataStyleTask]).then(
    async () => {
      if (await dataStore.isItemViewable(item)) {
        return dataStyleStore.applyDefaultStyle(item.data_id);
      }
      return undefined;
    },
  );
  await Promise.all([
    registerTask,
    addDataTask,
    addDataComponentsTask,
    addDataRelationsTask,
    addViewerTask,
    applyStyleTask,
  ]);
  return item.data_id;
}
// Every item comes through here: from the back-end, which still names its data id `id`, or from a project
async function importItem(imported: LegacyDataId<NewDataItem> | NewDataItem): Promise<string> {
  const id = await importDataItem(fromLegacyDataId(imported));
  return id;
}
async function importFile(filename: string, geode_object_type: GeodeObjectType): Promise<string> {
  const backStore = useBackStore();
  const schema = back_schemas.opengeodeweb_back.save_viewable_file;
  const params = {
    geode_object_type,
    filename,
  };
  const response = await backStore.request({
    schema,
    params,
  });
  // oxlint-disable-next-line no-unsafe-type-assertion -- this is the trusted API boundary; the back-end response shape matches NewDataItem, except for its legacy id.
  return importItem(response as LegacyDataId<NewDataItem>);
}

async function importWorkflow(files: readonly FileToImport[]): Promise<string[]> {
  const hybridViewerStore = useHybridViewerStore();
  // Files are imported concurrently and the viewer only frames the first actor to arrive, so the camera is reset once everything is loaded
  const wasSceneEmpty = Object.keys(hybridViewerStore.hybridDb).length === 0;
  const chunk_size = 5;
  const chunks: FileToImport[][] = [];
  for (let i = 0; i < files.length; i += chunk_size) {
    chunks.push(files.slice(i, i + chunk_size));
  }

  const results: string[] = [];
  const errors: unknown[] = [];
  async function processChunk(chunkIndex: number): Promise<void> {
    if (chunkIndex >= chunks.length) {
      return;
    }
    const chunk = chunks[chunkIndex] ?? [];
    // A failing file does not prevent the other files from being imported
    const chunk_results = await Promise.allSettled(
      chunk.map(async ({ filename, geode_object_type }) => {
        const id = await importFile(filename, geode_object_type);
        return id;
      }),
    );
    for (const result of chunk_results) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        errors.push(result.reason);
      }
    }
    await processChunk(chunkIndex + 1);
  }
  await processChunk(0);
  const isSceneFilled = Object.keys(hybridViewerStore.hybridDb).length > 0;
  if (wasSceneEmpty && isSceneFilled) {
    hybridViewerStore.resetCamera();
  }
  await hybridViewerStore.remoteRender();
  if (errors.length > 0) {
    throw new AggregateError(errors, `${errors.length} file(s) could not be imported`);
  }
  return results;
}

// NewDataItem has mutable array fields (mesh_components, collection_components), so a readonly array of it can't satisfy prefer-readonly-parameter-types deeply; left unfixed (same pattern as app/plugins/auto_store_register.ts).
async function importWorkflowFromSnapshot(
  items: readonly (LegacyDataId<NewDataItem> | NewDataItem)[],
): Promise<string[]> {
  consola.debug("[importWorkflowFromSnapshot] start", { count: items?.length });
  const hybridViewerStore = useHybridViewerStore();
  const chunk_size = 5;
  const chunks: (LegacyDataId<NewDataItem> | NewDataItem)[][] = [];
  for (let i = 0; i < items.length; i += chunk_size) {
    chunks.push(items.slice(i, i + chunk_size));
  }
  const ids: string[] = [];
  async function processChunk(chunkIndex: number): Promise<void> {
    if (chunkIndex >= chunks.length) {
      return;
    }
    const chunk = chunks[chunkIndex] ?? [];
    const chunk_ids = await Promise.all(
      chunk.map(async (item) => {
        const id = await importItem(item);
        return id;
      }),
    );
    ids.push(...chunk_ids);
    await processChunk(chunkIndex + 1);
  }
  await processChunk(0);
  await hybridViewerStore.remoteRender();
  consola.debug("[importWorkflowFromSnapshot] done", {
    ids,
  });
  return ids;
}

// Reloads the viewer object under the same id with its stored style, after the back rewrote its files.
async function reloadObject(
  id: string,
  { rebuildActor = false }: { rebuildActor?: boolean } = {},
): Promise<void> {
  const dataStore = useDataStore();
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();
  const item = await dataStore.item(id);
  await dataStore.deregisterObject(id);
  await dataStore.registerObject(id, item.name ?? id);
  // Only when the geometry moved: the local actor is rebuilt from the stored light viewable
  if (rebuildActor) {
    await hybridViewerStore.addItem(id);
  }
  await dataStyleStore.applyDefaultStyle(id);
  await hybridViewerStore.remoteRender();
}

// The time series only adds attributes to the model, so the viewer object is reloaded.
async function applyTimeSeriesWorkflow(filename: string, id: string): Promise<string> {
  const backStore = useBackStore();
  await backStore.request({
    schema: back_schemas.opengeodeweb_back.apply_time_series,
    params: { id, filename },
  });
  await reloadObject(id);
  return id;
}

export {
  importFile,
  importWorkflow,
  importWorkflowFromSnapshot,
  importItem,
  applyTimeSeriesWorkflow,
  reloadObject,
};

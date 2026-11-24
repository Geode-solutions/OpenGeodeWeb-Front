// oxlint-disable promise/prefer-await-to-then
// Local imports
import { type LegacyDataId, fromLegacyDataId } from "@ogw_front/utils/legacy_data_id";
import { type NewDataItem, useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

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
  if (item.viewer_object_type === "model") {
    addDataComponentsTask = dataStore.addComponents(item);
    addDataRelationsTask = dataStore.addComponentRelations(item);
  }
  treeviewStore.addItem(
    item.geode_object_type,
    item.name ?? item.data_id,
    item.data_id,
    item.geode_id,
    item.viewer_object_type,
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
  const item = fromLegacyDataId(imported);
  const dataId = await useTreeviewStore().untilLoaded(item.data_id, importDataItem(item));
  return dataId;
}

export { importItem };

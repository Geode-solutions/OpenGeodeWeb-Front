// Local imports
import { type LegacyDataId, fromLegacyDataId } from "@ogw_front/utils/legacy_data_id";
import { type NewDataItem, useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

// Steps that need the data stored first, and run only for the data the viewer shows
async function registerWhenViewable(item: NewDataItem, added: Promise<unknown>): Promise<unknown> {
  const dataStore = useDataStore();
  await added;
  if (!(await dataStore.isItemViewable(item))) {
    return undefined;
  }
  return dataStore.registerObject(item.data_id, item.name ?? item.data_id);
}

async function addToViewerWhenViewable(
  item: NewDataItem,
  added: Promise<unknown>,
): Promise<unknown> {
  const dataStore = useDataStore();
  await added;
  if (!(await dataStore.isItemViewable(item))) {
    return undefined;
  }
  return useHybridViewerStore().addItem(item.data_id);
}

async function applyStyleWhenReady(item: NewDataItem, ready: Promise<unknown>): Promise<unknown> {
  await ready;
  if (!(await useDataStore().isItemViewable(item))) {
    return undefined;
  }
  return useDataStyleStore().applyDefaultStyle(item.data_id);
}

// Nothing waits for the relations and the physical properties of a model but the end of its import
async function addModelDetails(item: NewDataItem): Promise<unknown> {
  const dataStore = useDataStore();
  const details = await Promise.all([
    dataStore.addComponentRelations(item),
    // Read from the back for a restored project too: its snapshot does not hold them
    dataStore.addPhysicalProperties(item.data_id),
  ]);
  return details;
}

// NewDataItem has mutable array fields (mesh_components, collection_components), so it can't
// Satisfy prefer-readonly-parameter-types deeply; left unfixed (same pattern as app/plugins/auto_store_register.ts).
async function importDataItem(item: NewDataItem): Promise<string> {
  const dataStore = useDataStore();
  const dataStyleStore = useDataStyleStore();
  const treeviewStore = useTreeviewStore();
  if (item.nb_vertices === 0) {
    const feedbackStore = useFeedbackStore();
    feedbackStore.add_warning(`"${item.geode_object_type}" with name "${item.name}" is empty`);
  }
  const addDataTask = dataStore.addItem(item);
  const registerTask = registerWhenViewable(item, addDataTask);
  let addDataComponentsTask: Promise<unknown> = Promise.resolve(undefined);
  let addModelDetailsTask: Promise<unknown> = Promise.resolve(undefined);
  if (item.viewer_object_type === "model") {
    addDataComponentsTask = dataStore.addComponents(item);
    addModelDetailsTask = addModelDetails(item);
  }
  treeviewStore.addItem(
    item.geode_object_type,
    item.name ?? item.data_id,
    item.data_id,
    item.geode_id,
    item.viewer_object_type,
  );
  const addDataStyleTask = dataStyleStore.addDataStyle(item.data_id, item.geode_object_type);
  const addViewerTask = addToViewerWhenViewable(item, addDataTask);
  const applyStyleTask = applyStyleWhenReady(
    item,
    Promise.all([registerTask, addDataComponentsTask, addDataStyleTask]),
  );
  await Promise.all([
    registerTask,
    addDataTask,
    addDataComponentsTask,
    addModelDetailsTask,
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

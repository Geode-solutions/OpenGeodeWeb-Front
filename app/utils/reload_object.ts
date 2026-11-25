// Local imports
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// Reloads the viewer object under the same id with its stored style, after the back rewrote its files.
async function reloadObject(
  dataId: DataId,
  { rebuildActor = false }: { rebuildActor?: boolean } = {},
): Promise<void> {
  const dataStore = useDataStore();
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();
  const item = await dataStore.item(dataId);
  await dataStore.deregisterObject(dataId);
  await dataStore.registerObject(dataId, item.name ?? dataId);
  // Only when the geometry moved: the local actor is rebuilt from the stored light viewable
  if (rebuildActor) {
    await hybridViewerStore.addItem(dataId);
  }
  await dataStyleStore.applyDefaultStyle(dataId);
  await hybridViewerStore.remoteRender();
}

export { reloadObject };

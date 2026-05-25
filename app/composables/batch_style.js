import { useDataStore } from "@ogw_front/stores/data";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

export function useBatchStyle() {
  const treeviewStore = useTreeviewStore();
  const dataStore = useDataStore();

  async function applyBatchStyle(id, action) {
    const isActive = treeviewStore.activeItems.includes(id);
    if (!isActive || treeviewStore.activeItems.length <= 1) {
      await action(id);
      return;
    }

    try {
      const currentItem = await dataStore.item(id);
      const targetType = currentItem.geode_object_type;

      const promises = treeviewStore.activeItems.map(async (selectedId) => {
        try {
          const item = await dataStore.item(selectedId);
          if (item && item.geode_object_type === targetType) {
            await action(selectedId);
          }
        } catch (error) {
          console.error("Failed to apply batch style to item", selectedId, error);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to fetch current item for batch style", id, error);
      await action(id);
    }
  }

  return { applyBatchStyle };
}

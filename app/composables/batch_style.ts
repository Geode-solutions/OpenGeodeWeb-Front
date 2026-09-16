import { useDataStore } from "@ogw_front/stores/data";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

export function useBatchStyle(): { applyBatchStyle: typeof applyBatchStyle } {
  const treeviewStore = useTreeviewStore();
  const dataStore = useDataStore();

  async function applyBatchStyle(
    id: string,
    action: (id: string) => Promise<unknown>,
  ): Promise<void> {
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
          if (item.geode_object_type === targetType) {
            await action(selectedId);
          }
        } catch {
          // Ignore items that fail to load; batch style continues for the rest.
        }
      });

      await Promise.all(promises);
    } catch {
      await action(id);
    }
  }

  return { applyBatchStyle };
}

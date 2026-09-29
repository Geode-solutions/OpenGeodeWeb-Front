import { useDataStore } from "@ogw_front/stores/data";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

let forcedTargets: readonly string[] | undefined = undefined;

function runWithBatchTargets(targets: readonly string[], styleChange: () => void): void {
  const previous = forcedTargets;
  forcedTargets = targets;
  try {
    styleChange();
  } finally {
    forcedTargets = previous;
  }
}

async function applyActionOn(
  targets: readonly string[],
  action: (id: string) => Promise<unknown>,
): Promise<void> {
  await Promise.all(
    targets.map(async (targetId) => {
      await action(targetId);
    }),
  );
}

function menuGroupTargets(id: string): string[] | undefined {
  const { targetIds } = useMenuStore().current_meta_data;
  return targetIds?.includes(id) ? targetIds : undefined;
}

function useBatchStyle(): { applyBatchStyle: typeof applyBatchStyle } {
  const treeviewStore = useTreeviewStore();
  const dataStore = useDataStore();

  async function applyBatchStyle(
    id: string,
    action: (id: string) => Promise<unknown>,
  ): Promise<void> {
    if (forcedTargets !== undefined) {
      await applyActionOn(forcedTargets, action);
      return;
    }

    const groupTargets = menuGroupTargets(id);
    if (groupTargets) {
      await applyActionOn(groupTargets, action);
      return;
    }

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

export { menuGroupTargets, runWithBatchTargets, useBatchStyle };

import {
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
  computed,
  inject,
  provide,
  toValue,
} from "vue";
import type { DataId } from "@ogw_front/types/identifiers";
import { useDataStore } from "@ogw_front/stores/data";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

type AttributeRange = [number, number];
type RangesPerData = ReadonlyMap<string, AttributeRange>;

const BATCH_GROUP_KEY: InjectionKey<ComputedRef<string[]>> = Symbol("batch_group");

function provideBatchGroup(targetIds: () => string[]): void {
  provide(BATCH_GROUP_KEY, computed(targetIds));
}

function injectBatchGroup(): ComputedRef<string[]> {
  return inject(BATCH_GROUP_KEY, () => computed(() => []), true);
}

function groupTargetsOf(targetIds: string[], dataId: DataId): string[] | undefined {
  return targetIds.includes(dataId) ? targetIds : undefined;
}

function useBatchGroup(dataId: MaybeRefOrGetter<DataId>): ComputedRef<string[] | undefined> {
  const group = injectBatchGroup();
  return computed(() => groupTargetsOf(group.value, toValue(dataId)));
}

async function applyRangesPerData(
  ranges: RangesPerData,
  setRange: (dataId: DataId, minimum: number, maximum: number) => unknown,
): Promise<void> {
  await Promise.all(
    [...ranges].map(async ([targetId, [minimum, maximum]]) => {
      await setRange(targetId, minimum, maximum);
    }),
  );
}

async function applyActionOn(
  targets: readonly string[],
  action: (dataId: DataId) => Promise<unknown>,
): Promise<void> {
  await Promise.all(
    targets.map(async (targetId) => {
      await action(targetId);
    }),
  );
}

function useBatchStyle(): { applyBatchStyle: typeof applyBatchStyle } {
  const treeviewStore = useTreeviewStore();
  const dataStore = useDataStore();
  const group = injectBatchGroup();

  async function applyBatchStyle(
    dataId: DataId,
    action: (dataId: DataId) => Promise<unknown>,
  ): Promise<void> {
    const groupTargets = groupTargetsOf(group.value, dataId);
    if (groupTargets) {
      await applyActionOn(groupTargets, action);
      return;
    }

    const isActive = treeviewStore.activeItems.includes(dataId);
    if (!isActive || treeviewStore.activeItems.length <= 1) {
      await action(dataId);
      return;
    }

    try {
      const currentItem = await dataStore.item(dataId);
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
      await action(dataId);
    }
  }

  return { applyBatchStyle };
}

export { BATCH_GROUP_KEY, applyRangesPerData, provideBatchGroup, useBatchGroup, useBatchStyle };
export type { AttributeRange, RangesPerData };

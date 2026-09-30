import {
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
  computed,
  inject,
  provide,
  toValue,
} from "vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

type AttributeRange = [number, number];
type BatchRange = readonly (number | undefined)[];

interface BatchGroup {
  targetIds: ComputedRef<string[]>;
  rangesPerData: WeakMap<BatchRange, ReadonlyMap<string, AttributeRange>>;
}

const BATCH_GROUP_KEY: InjectionKey<BatchGroup> = Symbol("batch_group");

function createBatchGroup(targetIds: () => string[]): BatchGroup {
  return { targetIds: computed(targetIds), rangesPerData: new WeakMap() };
}

function provideBatchGroup(targetIds: () => string[]): void {
  provide(BATCH_GROUP_KEY, createBatchGroup(targetIds));
}

function injectBatchGroup(): BatchGroup {
  return inject(BATCH_GROUP_KEY, () => createBatchGroup(() => []), true);
}

function groupTargetsOf(group: BatchGroup, id: string): string[] | undefined {
  const targetIds = group.targetIds.value;
  return targetIds.includes(id) ? targetIds : undefined;
}

function useBatchGroup(id: MaybeRefOrGetter<string>): {
  targetIds: ComputedRef<string[] | undefined>;
  withRangesPerData: (range: BatchRange, ranges: ReadonlyMap<string, AttributeRange>) => BatchRange;
} {
  const group = injectBatchGroup();
  const targetIds = computed(() => groupTargetsOf(group, toValue(id)));

  function withRangesPerData(
    range: BatchRange,
    ranges: ReadonlyMap<string, AttributeRange>,
  ): BatchRange {
    group.rangesPerData.set(range, ranges);
    return range;
  }

  return { targetIds, withRangesPerData };
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

function useBatchStyle(): {
  applyBatchStyle: typeof applyBatchStyle;
  applyBatchRange: typeof applyBatchRange;
} {
  const treeviewStore = useTreeviewStore();
  const dataStore = useDataStore();
  const group = injectBatchGroup();

  async function applyBatchStyle(
    id: string,
    action: (id: string) => Promise<unknown>,
  ): Promise<void> {
    const groupTargets = groupTargetsOf(group, id);
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

  async function applyBatchRange(
    id: string,
    range: BatchRange,
    setRange: (id: string, minimum: number, maximum: number) => unknown,
  ): Promise<void> {
    const rangesPerData = group.rangesPerData.get(range);
    await applyBatchStyle(id, async (targetId: string) => {
      const [minimum, maximum] =
        rangesPerData === undefined ? range : (rangesPerData.get(targetId) ?? range);
      if (minimum === undefined || maximum === undefined) {
        return;
      }
      await setRange(targetId, minimum, maximum);
    });
  }

  return { applyBatchStyle, applyBatchRange };
}

export { BATCH_GROUP_KEY, createBatchGroup, provideBatchGroup, useBatchGroup, useBatchStyle };
export type { AttributeRange, BatchRange };

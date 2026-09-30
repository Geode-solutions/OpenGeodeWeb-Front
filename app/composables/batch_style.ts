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
type BatchRange = readonly (number | undefined)[] | Map<string, AttributeRange>;

const BATCH_GROUP_KEY: InjectionKey<ComputedRef<string[] | undefined>> = Symbol("batch_group");

function provideBatchGroup(targetIds: () => string[] | undefined): void {
  provide(BATCH_GROUP_KEY, computed(targetIds));
}

function groupTargetsOf(targetIds: string[] | undefined, id: string): string[] | undefined {
  return targetIds?.includes(id) === true ? targetIds : undefined;
}

function useBatchGroup(id: MaybeRefOrGetter<string>): ComputedRef<string[] | undefined> {
  const group = inject(BATCH_GROUP_KEY, undefined);
  return computed(() => groupTargetsOf(group?.value, toValue(id)));
}

function rangeOf(range: BatchRange | undefined, targetId: string): readonly (number | undefined)[] {
  if (range instanceof Map) {
    return range.get(targetId) ?? [];
  }
  return range ?? [];
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
  const group = inject(BATCH_GROUP_KEY, undefined);

  async function applyBatchStyle(
    id: string,
    action: (id: string) => Promise<unknown>,
  ): Promise<void> {
    const groupTargets = groupTargetsOf(group?.value, id);
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
    range: BatchRange | undefined,
    setRange: (id: string, minimum: number, maximum: number) => unknown,
  ): Promise<void> {
    await applyBatchStyle(id, async (targetId: string) => {
      const [minimum, maximum] = rangeOf(range, targetId);
      if (minimum === undefined || maximum === undefined) {
        return;
      }
      await setRange(targetId, minimum, maximum);
    });
  }

  return { applyBatchStyle, applyBatchRange };
}

export { BATCH_GROUP_KEY, provideBatchGroup, useBatchGroup, useBatchStyle };
export type { AttributeRange, BatchRange };

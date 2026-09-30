import {
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
  computed,
  inject,
  provide,
  toValue,
} from "vue";
import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

type AttributeRange = [number, number];

interface BatchGroup {
  targetIds: string[];
  ranges: Map<string, AttributeRange>;
}

const BATCH_GROUP_KEY: InjectionKey<ComputedRef<BatchGroup | undefined>> = Symbol("batch_group");

function createBatchGroup(
  targetIds: () => string[] | undefined,
): ComputedRef<BatchGroup | undefined> {
  return computed(() => {
    const ids = targetIds();
    return ids ? { targetIds: ids, ranges: new Map() } : undefined;
  });
}

function provideBatchGroup(targetIds: () => string[] | undefined): void {
  provide(BATCH_GROUP_KEY, createBatchGroup(targetIds));
}

function injectBatchGroup(): ComputedRef<BatchGroup | undefined> | undefined {
  return inject(BATCH_GROUP_KEY, undefined);
}

function groupTargetsOf(group: BatchGroup | undefined, id: string): string[] | undefined {
  return group?.targetIds.includes(id) === true ? group.targetIds : undefined;
}

function useBatchGroup(id: MaybeRefOrGetter<string>): {
  targetIds: ComputedRef<string[] | undefined>;
  ranges: ComputedRef<Map<string, AttributeRange> | undefined>;
} {
  const group = injectBatchGroup();
  const targetIds = computed(() => groupTargetsOf(group?.value, toValue(id)));
  const ranges = computed(() => (targetIds.value ? group?.value?.ranges : undefined));
  return { targetIds, ranges };
}

async function requestForTargets<TResponse>(
  schema: JsonRpcSchema,
  targetIds: readonly string[],
): Promise<Map<string, TResponse>> {
  const backStore = useBackStore();
  const responses = await Promise.all(
    targetIds.map(async (targetId) => {
      // oxlint-disable-next-line no-unsafe-type-assertion -- this is the trusted API boundary.
      const response = (await backStore.request({ schema, params: { id: targetId } })) as TResponse;
      return [targetId, response] as const;
    }),
  );
  return new Map(responses);
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
    range: AttributeRange,
    setRange: (id: string, minimum: number, maximum: number) => unknown,
  ): Promise<void> {
    await applyBatchStyle(id, async (targetId: string) => {
      const [minimum, maximum] = group?.value?.ranges.get(targetId) ?? range;
      await setRange(targetId, minimum, maximum);
    });
  }

  return { applyBatchStyle, applyBatchRange };
}

export {
  BATCH_GROUP_KEY,
  createBatchGroup,
  provideBatchGroup,
  requestForTargets,
  useBatchGroup,
  useBatchStyle,
};
export type { AttributeRange };

import { type DataItem, useDataStore } from "@ogw_front/stores/data";
import type { EffectScope, MaybeRefOrGetter, ShallowRef } from "vue";
import type { DataId } from "@ogw_front/types/identifiers";

// Live view of a data item whose id can change: tree labels are reused by the virtual list,
// And the info card shows whichever object the menu was last opened on.
export function useLiveDataItem(
  dataId: MaybeRefOrGetter<DataId | undefined>,
): ShallowRef<DataItem | undefined> {
  const dataStore = useDataStore();
  const item = shallowRef<DataItem | undefined>(undefined);
  let itemScope: EffectScope | undefined = undefined;

  watch(
    () => toValue(dataId),
    (newId) => {
      itemScope?.stop();
      itemScope = undefined;
      item.value = undefined;
      if (newId === undefined) {
        return;
      }
      itemScope = effectScope();
      itemScope.run(() => {
        const liveItem = dataStore.refItem(newId);
        watch(
          liveItem,
          (value) => {
            item.value = value;
          },
          { immediate: true },
        );
      });
    },
    { immediate: true },
  );
  onScopeDispose(() => itemScope?.stop());

  return item;
}

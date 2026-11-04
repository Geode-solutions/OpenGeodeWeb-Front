import { type MaybeRefOrGetter, type WritableComputedRef, computed, toValue } from "vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// A style model applied to the whole batch of the data, then rendered
function useBatchStyleModel<Value>(
  id: MaybeRefOrGetter<string>,
  getter: (id: string) => Value | undefined,
  setter: (id: string, value: Value) => Promise<unknown>,
): WritableComputedRef<Value | undefined> {
  const hybridViewerStore = useHybridViewerStore();
  const { applyBatchStyle } = useBatchStyle();

  async function applyValue(value: Value): Promise<void> {
    await applyBatchStyle(toValue(id), async (targetId: string) => {
      await setter(targetId, value);
    });
    await hybridViewerStore.remoteRender();
  }

  return computed<Value | undefined>({
    get: () => getter(toValue(id)),
    // Vue's WritableComputedOptions setter is strictly `(v: T) => void`: the async write is delegated.
    set: (newValue: Value | undefined): void => {
      if (newValue === undefined) {
        return;
      }
      /* oxlint-disable-next-line promise/prefer-await-to-then -- setter cannot be async; see comment above. */
      applyValue(newValue).catch(() => undefined);
    },
  });
}

export { useBatchStyleModel };

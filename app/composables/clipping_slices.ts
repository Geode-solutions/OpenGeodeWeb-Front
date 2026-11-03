import {
  DEFAULT_SLICE_AXIS,
  SLICE_AXES,
  type SliceAxis,
  areAllGrids,
} from "@ogw_front/utils/slice";
import type { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Slice {
  id: number;
  axis: SliceAxis;
  index: number;
}

interface SliceList {
  sliceEnabled: Ref<boolean>;
  slices: Ref<Slice[]>;
  addSlice: () => void;
  removeSlice: (index: number) => void;
  resetSlices: () => void;
}

interface SliceSyncParams {
  slices: Ref<Slice[]>;
  sliceMaxIndices: Ref<[number, number, number]>;
  isAllGrid: ComputedRef<boolean>;
  isSliceActive: ComputedRef<boolean>;
  targetIds: ComputedRef<string[]>;
  getUntargetedIds: () => string[];
  hybridViewerStore: ReturnType<typeof useHybridViewerStore>;
}

interface ClippingSlicesParams {
  allItems: ComputedRef<{ id: string; geode_object_type: string }[]>;
  targetIds: ComputedRef<string[]>;
  getUntargetedIds: () => string[];
  newItemId: () => number;
  hybridViewerStore: ReturnType<typeof useHybridViewerStore>;
}

interface ClippingSlices extends SliceList {
  sliceMaxIndices: Ref<[number, number, number]>;
  isAllGrid: ComputedRef<boolean>;
  isSliceActive: ComputedRef<boolean>;
  applySlices: () => Promise<void>;
  removeSlices: (allIds: string[]) => Promise<void>;
}

function useSliceList(newItemId: () => number): SliceList {
  const sliceEnabled = ref<boolean>(false);
  const slices = ref<Slice[]>([{ id: newItemId(), axis: DEFAULT_SLICE_AXIS, index: 0 }]);

  function addSlice(): void {
    const lastSlice = slices.value.at(-1);
    slices.value.push({
      id: newItemId(),
      axis: lastSlice ? SLICE_AXES[lastSlice.axis].next : DEFAULT_SLICE_AXIS,
      index: 0,
    });
  }

  function removeSlice(index: number): void {
    slices.value.splice(index, 1);
  }

  function resetSlices(): void {
    sliceEnabled.value = false;
    slices.value = [{ id: newItemId(), axis: DEFAULT_SLICE_AXIS, index: 0 }];
  }

  return { sliceEnabled, slices, addSlice, removeSlice, resetSlices };
}

// Runs the tasks one after the other, whatever the outcome of the previous one
function createSliceQueue(): (task: () => Promise<void>) => Promise<void> {
  let pendingSlices: Promise<void> = Promise.resolve();

  return async (task) => {
    const previous = pendingSlices;
    pendingSlices = (async (): Promise<void> => {
      await Promise.allSettled([previous]);
      await task();
    })();
    await pendingSlices;
  };
}

function useSliceSync(params: SliceSyncParams): {
  applySlices: () => Promise<void>;
  removeSlices: (allIds: string[]) => Promise<void>;
} {
  const { slices, sliceMaxIndices, isAllGrid, isSliceActive, targetIds, hybridViewerStore } =
    params;
  const queueSliceTask = createSliceQueue();
  let areSlicesApplied = false;

  async function sendSlices(): Promise<void> {
    if (!isAllGrid.value && !areSlicesApplied) {
      return;
    }
    const isActive = isSliceActive.value;
    const untargetedIds = params.getUntargetedIds();
    if (targetIds.value.length > 0) {
      const maxIndices = await hybridViewerStore.setSlice(
        targetIds.value,
        isActive ? slices.value.map(({ axis, index }) => ({ axis, index })) : [],
      );
      if (isAllGrid.value) {
        sliceMaxIndices.value = maxIndices;
      }
      if (isActive) {
        for (const slice of slices.value) {
          slice.index = Math.min(slice.index, maxIndices[slice.axis]);
        }
      }
    }
    if (areSlicesApplied && untargetedIds.length > 0) {
      await hybridViewerStore.setSlice(untargetedIds, []);
    }
    areSlicesApplied = isActive;
  }

  async function applySlices(): Promise<void> {
    await queueSliceTask(sendSlices);
  }

  async function removeSlices(allIds: string[]): Promise<void> {
    await queueSliceTask(async () => {
      if (areSlicesApplied) {
        await hybridViewerStore.setSlice(allIds, []);
        areSlicesApplied = false;
      }
    });
  }

  return { applySlices, removeSlices };
}

// The slices applied to the targeted grids
function useClippingSlices(params: ClippingSlicesParams): ClippingSlices {
  const { allItems, targetIds, getUntargetedIds, newItemId, hybridViewerStore } = params;
  const list = useSliceList(newItemId);
  const sliceMaxIndices = ref<[number, number, number]>([0, 0, 0]);
  const isAllGrid = computed<boolean>(() => areAllGrids(allItems.value, targetIds.value));
  const isSliceActive = computed<boolean>(() => isAllGrid.value && list.sliceEnabled.value);
  const sync = useSliceSync({
    slices: list.slices,
    sliceMaxIndices,
    isAllGrid,
    isSliceActive,
    targetIds,
    getUntargetedIds,
    hybridViewerStore,
  });

  return { ...list, ...sync, sliceMaxIndices, isAllGrid, isSliceActive };
}

export { useClippingSlices };

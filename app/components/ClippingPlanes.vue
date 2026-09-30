<script setup lang="ts">
import { DEBOUNCE_DELAY, DEFAULT_NORMALS } from "@ogw_front/utils/clipping_planes";
import {
  DEFAULT_SLICE_AXIS,
  NEXT_SLICE_AXIS,
  type SliceAxis,
  areAllGrids,
} from "@ogw_front/utils/slice";
import ClippingPlaneCard from "@ogw_front/components/ClippingPlaneCard.vue";
import SliceCard from "@ogw_front/components/SliceCard.vue";
import ToolPanel from "@ogw_front/components/ToolPanel.vue";
import { useClippingPlanesWidget } from "@ogw_front/composables/clipping_planes_widget";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  escapeFunction?: () => void;
}

const { escapeFunction = undefined } = defineProps<Props>();

const show = defineModel<boolean>("show", { default: false });
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();
const targetAllVisible = ref<boolean>(true);
const selectedDatasetIds = ref<string[]>([]);
const planes = ref<{ origin?: number[]; normal: number[] }[]>([
  { origin: undefined, normal: [1, 0, 0] },
]);
const allItems = dataStore.refAllItems();
const sliceEnabled = ref<boolean>(false);
const slices = ref<{ axis: SliceAxis; index: number }[]>([{ axis: DEFAULT_SLICE_AXIS, index: 0 }]);
const sliceMaxIndices = ref<[number, number, number]>([0, 0, 0]);
const targetIds = computed<string[]>(() =>
  targetAllVisible.value ? allItems.value.map((item) => item.id) : selectedDatasetIds.value,
);
const isAllGrid = computed<boolean>(() => areAllGrids(allItems.value, targetIds.value));
const isSliceActive = computed<boolean>(() => isAllGrid.value && sliceEnabled.value);
const availableDatasets = computed<{ title: string; value: string }[]>(() =>
  allItems.value.map((item) => ({
    title: item.name || item.id,
    value: item.id,
  })),
);
const widgetContainer = useTemplateRef("widgetContainer");
let debouncedApply: ((...args: unknown[]) => void) | undefined = undefined;
let areSlicesApplied = false;
let pendingSlices: Promise<void> = Promise.resolve();

const {
  getSceneCenter,
  syncWidgets,
  syncLocalCamera,
  cleanupLocalWidget,
  initLocalWidget,
  updateWidgetPlacement,
  isFromWidget,
  setFromWidget,
} = useClippingPlanesWidget({
  planes,
  targetAllVisible,
  selectedDatasetIds,
  allItems,
  hybridViewerStore,
  debouncedApply: (...args: unknown[]) => debouncedApply?.(...args),
});

function getUntargetedIds(): string[] {
  return allItems.value.map((item) => item.id).filter((id) => !targetIds.value.includes(id));
}

async function applyClippingPlanes(): Promise<void> {
  if (allItems.value.length === 0) {
    return;
  }
  const center = getSceneCenter();
  const untargetedIds = getUntargetedIds();
  const planesData = planes.value.map((plane) => ({
    origin: (plane.origin || center).map(Number),
    normal: plane.normal.map(Number),
  }));
  if (targetIds.value.length > 0) {
    await hybridViewerStore.setClippingPlanes(
      targetIds.value,
      isSliceActive.value ? [] : planesData,
    );
  }
  if (untargetedIds.length > 0) {
    await hybridViewerStore.setClippingPlanes(untargetedIds, []);
  }
}

async function sendSlices(): Promise<void> {
  if (!isAllGrid.value && !areSlicesApplied) {
    return;
  }
  const isActive = isSliceActive.value;
  const untargetedIds = getUntargetedIds();
  if (targetIds.value.length > 0) {
    const maxIndices = await hybridViewerStore.setSlice(
      targetIds.value,
      isActive ? slices.value : [],
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

function queueSliceTask(task: () => Promise<void>): Promise<void> {
  const previous = pendingSlices;
  pendingSlices = (async (): Promise<void> => {
    await Promise.allSettled([previous]);
    await task();
  })();
  return pendingSlices;
}

function applySlices(): Promise<void> {
  return queueSliceTask(sendSlices);
}

async function applyAll(): Promise<void> {
  await applyClippingPlanes();
  await applySlices();
}

debouncedApply = useDebounceFn(() => applyClippingPlanes(), DEBOUNCE_DELAY);
const debouncedApplySlices = useDebounceFn(() => applySlices(), DEBOUNCE_DELAY);

function addPlane(): void {
  // Index is always in-bounds (modulo the fixed-size list); the fallbacks only
  // Satisfy noUncheckedIndexedAccess and are never hit at runtime.
  const normal = DEFAULT_NORMALS[planes.value.length % DEFAULT_NORMALS.length] ??
    DEFAULT_NORMALS[0] ?? [1, 0, 0];
  planes.value.push({ origin: getSceneCenter(), normal });
}

function removePlane(index: number): void {
  planes.value.splice(index, 1);
}

function addSlice(): void {
  const lastSlice = slices.value.at(-1);
  slices.value.push({
    axis: lastSlice ? NEXT_SLICE_AXIS[lastSlice.axis] : DEFAULT_SLICE_AXIS,
    index: 0,
  });
}

function removeSlice(index: number): void {
  slices.value.splice(index, 1);
}

function flipNormal(plane: { normal: number[] }): void {
  plane.normal = plane.normal.map((component) => -component);
  syncWidgets();
  applyClippingPlanes();
}

async function resetClippingPlanes(): Promise<void> {
  setFromWidget(true);
  planes.value = [{ origin: undefined, normal: [1, 0, 0] }];
  sliceEnabled.value = false;
  slices.value = [{ axis: DEFAULT_SLICE_AXIS, index: 0 }];
  updateWidgetPlacement({ isReset: true });
  setFromWidget(false);
  await applyAll();
}

async function removeClippingPlanes(): Promise<void> {
  const allIds = allItems.value.map((item) => item.id);
  await hybridViewerStore.setClippingPlanes(allIds, []);
  await queueSliceTask(async () => {
    if (areSlicesApplied) {
      await hybridViewerStore.setSlice(allIds, []);
      areSlicesApplied = false;
    }
  });
}

watch(widgetContainer, (container) => {
  if (container) {
    initLocalWidget(container.$el || container);
  }
});

watch(
  planes,
  () => {
    if (isFromWidget()) {
      return;
    }
    syncWidgets();
    debouncedApply();
  },
  { deep: true },
);

watch(show, (visible) => {
  if (visible) {
    updateWidgetPlacement({ isReset: true });
    applyAll();
  }
});

watch(
  [targetAllVisible, selectedDatasetIds],
  () => {
    if (show.value) {
      updateWidgetPlacement({ isReset: true });
      applyAll();
    }
  },
  { deep: true },
);

watch(sliceEnabled, () => {
  if (show.value) {
    applyAll();
  }
});

watch(
  slices,
  () => {
    if (show.value) {
      debouncedApplySlices();
    }
  },
  { deep: true },
);

watch(allItems, () => {
  if (show.value) {
    updateWidgetPlacement({ isReset: true });
    applyAll();
  }
});

watch(
  () => Object.values(hybridViewerStore.hybridDb).filter((entry) => entry && entry.actor).length,
  (actorCount) => {
    if (show.value && actorCount > 0) {
      updateWidgetPlacement({ isReset: true });
      applyAll();
    }
  },
);

watch(() => hybridViewerStore.camera_options, syncLocalCamera, { deep: true });

onBeforeUnmount(cleanupLocalWidget);
</script>

<template>
  <ToolPanel
    v-model="show"
    title="Clipping Planes"
    :width="360"
    :click-outside="false"
    :escapeFunction="escapeFunction"
  >
    <v-card-text class="pa-3 max-panel-height overflow-y-auto">
      <v-sheet
        v-show="!isSliceActive"
        ref="widgetContainer"
        height="180"
        color="transparent"
        class="rounded-lg mb-3 overflow-hidden"
      />
      <v-switch
        v-model="targetAllVisible"
        data-testid="targetAllVisibleSwitch"
        label="Apply to all visible datasets"
        color="primary"
        density="compact"
        hide-details
        class="mb-2 text-caption"
      />

      <v-select
        v-if="!targetAllVisible"
        v-model="selectedDatasetIds"
        data-testid="selectedDatasetsSelect"
        :items="availableDatasets"
        label="Select datasets"
        multiple
        chips
        closable-chips
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3 text-caption"
      />

      <v-divider class="my-2" />

      <template v-if="isAllGrid">
        <v-switch
          v-model="sliceEnabled"
          data-testid="sliceSwitch"
          label="Slice"
          color="primary"
          density="compact"
          hide-details
          class="mb-2 text-caption"
        />
        <template v-if="sliceEnabled">
          <v-row align="center" justify="space-between" no-gutters class="mb-2">
            <v-col class="text-caption font-weight-bold">Slices ({{ slices.length }})</v-col>
            <v-col cols="auto">
              <v-btn
                data-testid="addSliceButton"
                size="x-small"
                variant="tonal"
                color="primary"
                icon="mdi-plus"
                @click="addSlice"
              />
            </v-col>
          </v-row>
          <SliceCard
            v-for="(slice, idx) in slices"
            :key="idx"
            :slice="slice"
            :index="idx"
            :max-index="sliceMaxIndices[slice.axis]"
            @remove="removeSlice(idx)"
          />
        </template>
        <v-divider class="my-2" />
      </template>

      <template v-if="!isSliceActive">
        <v-row align="center" justify="space-between" no-gutters class="mb-2">
          <v-col class="text-caption font-weight-bold">Planes ({{ planes.length }})</v-col>
          <v-col cols="auto">
            <v-btn
              data-testid="addPlaneButton"
              size="x-small"
              variant="tonal"
              color="primary"
              icon="mdi-plus"
              @click="addPlane"
            />
          </v-col>
        </v-row>

        <ClippingPlaneCard
          v-for="(plane, idx) in planes"
          :key="idx"
          :plane="plane"
          :index="idx"
          @remove="removePlane(idx)"
          @flip-normal="flipNormal(plane)"
        />
      </template>
    </v-card-text>

    <template #actions>
      <v-card-actions class="justify-space-between px-3 pb-3 pt-0">
        <v-btn
          data-testid="removeClippingPlanesButton"
          variant="text"
          size="small"
          color="error"
          class="text-caption text-none"
          @click="removeClippingPlanes"
        >
          Remove Clipping
        </v-btn>
        <v-btn
          data-testid="resetClippingPlanesButton"
          variant="tonal"
          size="small"
          color="secondary"
          class="text-caption text-none"
          @click="resetClippingPlanes"
        >
          Reset
        </v-btn>
      </v-card-actions>
    </template>
  </ToolPanel>
</template>

<style scoped>
.max-panel-height {
  max-height: 520px;
}
</style>

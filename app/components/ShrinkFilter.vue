<script setup>
import ToolPanel from "@ogw_front/components/ToolPanel";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const DEFAULT_SHRINK_VALUE = 0.8;
const MAX_SHRINK_VALUE = 1;
const DEBOUNCE_DELAY = 100;

const show = defineModel("show", { type: Boolean, default: false });
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();
const targetAllVisible = ref(true);
const selectedDatasetIds = ref([]);
const shrinkFactor = ref(DEFAULT_SHRINK_VALUE);

const allItems = dataStore.refAllItems();
const availableDatasets = computed(() =>
  allItems.value.map((item) => ({ title: item.name || item.id, value: item.id })),
);

const debouncedApply = useDebounceFn(() => applyShrink(), DEBOUNCE_DELAY);

async function applyShrink() {
  const allIds = allItems.value.map((item) => item.id);
  if (allIds.length === 0) {
    return;
  }
  const targetIds = targetAllVisible.value ? allIds : selectedDatasetIds.value;
  const untargetedIds = allIds.filter((id) => !targetIds.includes(id));

  if (targetIds.length > 0) {
    await hybridViewerStore.setShrink(targetIds, Number(shrinkFactor.value));
  }
  if (untargetedIds.length > 0) {
    await hybridViewerStore.setShrink(untargetedIds, MAX_SHRINK_VALUE);
  }
}

async function resetShrink() {
  shrinkFactor.value = DEFAULT_SHRINK_VALUE;
  await applyShrink();
}

async function removeShrink() {
  shrinkFactor.value = MAX_SHRINK_VALUE;
  const allIds = allItems.value.map((item) => item.id);
  if (allIds.length > 0) {
    await hybridViewerStore.setShrink(allIds, MAX_SHRINK_VALUE);
  }
}

watch(shrinkFactor, () => {
  debouncedApply();
});

watch(show, (visible) => {
  if (visible) {
    applyShrink();
  }
});

watch(
  [targetAllVisible, selectedDatasetIds],
  () => {
    if (show.value) {
      applyShrink();
    }
  },
  { deep: true },
);

watch(allItems, () => {
  if (show.value) {
    applyShrink();
  }
});

watch(
  () => Object.values(hybridViewerStore.hybridDb).filter((entry) => entry && entry.actor).length,
  (actorCount) => {
    if (show.value && actorCount > 0) {
      applyShrink();
    }
  },
);
</script>

<template>
  <ToolPanel v-model="show" title="Shrink Filter" :width="340" :click-outside="false">
    <v-card-text class="pa-3 max-panel-height overflow-y-auto overflow-x-hidden">
      <v-switch
        v-model="targetAllVisible"
        data-testid="shrinkTargetAllVisibleSwitch"
        label="Apply to all visible datasets"
        color="primary"
        density="compact"
        hide-details
        class="mb-2 text-caption"
      />

      <v-select
        v-if="!targetAllVisible"
        v-model="selectedDatasetIds"
        data-testid="shrinkSelectedDatasetsSelect"
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

      <v-divider class="my-3" />

      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-caption font-weight-bold">Shrink Factor</span>
        <span class="text-caption text-primary font-weight-bold">
          {{ (shrinkFactor * 100).toFixed(0) }}% ({{ shrinkFactor.toFixed(2) }})
        </span>
      </div>

      <v-slider
        v-model="shrinkFactor"
        data-testid="shrinkFactorSlider"
        min="0.0"
        max="1.0"
        step="0.01"
        color="primary"
        track-color="grey-lighten-2"
        density="compact"
        hide-details
        class="my-2 px-1"
      />
    </v-card-text>

    <template #actions>
      <v-card-actions class="justify-space-between px-3 pb-3 pt-0">
        <v-btn
          data-testid="removeShrinkButton"
          variant="text"
          size="small"
          color="error"
          class="text-caption text-none"
          @click="removeShrink"
        >
          Remove Shrink
        </v-btn>
        <v-btn
          data-testid="resetShrinkButton"
          variant="tonal"
          size="small"
          color="secondary"
          class="text-caption text-none"
          @click="resetShrink"
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

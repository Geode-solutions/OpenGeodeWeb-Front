<script setup lang="ts">
import ToolPanel from "@ogw_front/components/ToolPanel.vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const DEFAULT_EXPLODE_VALUE = 0.5;
const MIN_EXPLODE_VALUE = 0;
const MAX_EXPLODE_VALUE = 2;
const DEBOUNCE_DELAY = 100;

interface Props {
  escapeFunction?: () => void;
}

const { escapeFunction = undefined } = defineProps<Props>();

const show = defineModel<boolean>("show", { default: false });
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();
const targetAllVisible = ref<boolean>(true);
const selectedDatasetIds = ref<string[]>([]);
const explodeFactor = ref<number>(DEFAULT_EXPLODE_VALUE);

const allItems = dataStore.refAllItems();
const availableDatasets = computed<{ title: string; value: string }[]>(() =>
  allItems.value.map((item) => ({
    title: item.name || item.id,
    value: item.id,
  })),
);

async function applyExplode(): Promise<void> {
  const allIds = allItems.value.map((item) => item.id);
  if (allIds.length === 0) {
    return;
  }
  const targetIds = targetAllVisible.value ? allIds : selectedDatasetIds.value;
  const untargetedIds = allIds.filter((id) => !targetIds.includes(id));

  if (targetIds.length > 0) {
    await hybridViewerStore.setExplode(targetIds, Number(explodeFactor.value));
  }
  if (untargetedIds.length > 0) {
    await hybridViewerStore.setExplode(untargetedIds, MIN_EXPLODE_VALUE);
  }
}

const debouncedApply = useDebounceFn(() => applyExplode(), DEBOUNCE_DELAY);

async function resetExplode(): Promise<void> {
  explodeFactor.value = DEFAULT_EXPLODE_VALUE;
  await applyExplode();
}

async function removeExplode(): Promise<void> {
  explodeFactor.value = MIN_EXPLODE_VALUE;
  const allIds = allItems.value.map((item) => item.id);
  if (allIds.length > 0) {
    await hybridViewerStore.setExplode(allIds, MIN_EXPLODE_VALUE);
  }
}

watch(explodeFactor, () => {
  debouncedApply();
});

watch(show, (visible) => {
  if (visible) {
    applyExplode();
  }
});

watch(
  [targetAllVisible, selectedDatasetIds],
  () => {
    if (show.value) {
      applyExplode();
    }
  },
  { deep: true },
);

watch(allItems, () => {
  if (show.value) {
    applyExplode();
  }
});

watch(
  () => Object.values(hybridViewerStore.hybridDb).filter((entry) => entry && entry.actor).length,
  (actorCount) => {
    if (show.value && actorCount > 0) {
      applyExplode();
    }
  },
);
</script>

<template>
  <ToolPanel
    v-model="show"
    title="Exploded View"
    :width="340"
    :click-outside="false"
    :escapeFunction="escapeFunction"
  >
    <v-card-text class="pa-3 max-panel-height overflow-y-auto overflow-x-hidden">
      <v-switch
        v-model="targetAllVisible"
        data-testid="explodeTargetAllVisibleSwitch"
        label="Apply to all visible datasets"
        color="primary"
        density="compact"
        hide-details
        class="mb-2 text-caption"
      />

      <v-select
        v-if="!targetAllVisible"
        v-model="selectedDatasetIds"
        data-testid="explodeSelectedDatasetsSelect"
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
        <span class="text-caption font-weight-bold">Explode Factor</span>
        <span class="text-caption text-primary font-weight-bold">
          {{ explodeFactor.toFixed(2) }}
        </span>
      </div>

      <v-slider
        v-model="explodeFactor"
        data-testid="explodeFactorSlider"
        :min="MIN_EXPLODE_VALUE"
        :max="MAX_EXPLODE_VALUE"
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
          data-testid="removeExplodeButton"
          variant="text"
          size="small"
          color="error"
          class="text-caption text-none"
          @click="removeExplode"
        >
          Remove Explode
        </v-btn>
        <v-btn
          data-testid="resetExplodeButton"
          variant="tonal"
          size="small"
          color="secondary"
          class="text-caption text-none"
          @click="resetExplode"
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

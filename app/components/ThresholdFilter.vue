<script setup lang="ts">
import type { Threshold, ThresholdAttribute } from "@ogw_internal/stores/hybrid_viewer/filters";
import type { AttributeSource } from "@ogw_front/utils/threshold";
import ThresholdCard from "@ogw_front/components/ThresholdCard.vue";
import ToolPanel from "@ogw_front/components/ToolPanel.vue";
import { fetchSources } from "@ogw_front/utils/threshold_sources";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const DEBOUNCE_DELAY = 100;

interface Props {
  escapeFunction?: () => void;
}

const { escapeFunction = undefined } = defineProps<Props>();

const show = defineModel<boolean>("show", { default: false });
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();
const selectedDatasetId = ref<string>();
const sources = ref<AttributeSource[]>([]);
const thresholds = computed<Threshold[]>(() => {
  if (!selectedDatasetId.value) {
    return [];
  }
  return hybridViewerStore.getThresholds(selectedDatasetId.value);
});
const cards = useTemplateRef("cards");

const allItems = dataStore.refAllItems();
const availableDatasets = computed<{ title: string; value: string }[]>(() =>
  allItems.value.map((item) => ({
    title: item.name || item.id,
    value: item.id,
  })),
);

async function applyThresholds(): Promise<void> {
  if (!selectedDatasetId.value) {
    return;
  }
  await hybridViewerStore.setThreshold(
    [selectedDatasetId.value],
    thresholds.value
      .map((threshold) => threshold.thresholdAttribute)
      .filter((attribute): attribute is ThresholdAttribute => attribute !== undefined),
  );
}

const debouncedApply = useDebounceFn(() => applyThresholds(), DEBOUNCE_DELAY);

function addThreshold(): void {
  if (selectedDatasetId.value) {
    hybridViewerStore.addThreshold(selectedDatasetId.value);
  }
}

function removeThreshold(index: number): void {
  if (selectedDatasetId.value) {
    hybridViewerStore.removeThreshold(selectedDatasetId.value, index);
  }
}

async function clearThresholds(id: string): Promise<void> {
  hybridViewerStore.removeThresholds(id);
  await hybridViewerStore.setThreshold([id], []);
}

async function resetRanges(): Promise<void> {
  await Promise.all((cards.value ?? []).map((card) => card?.resetRange()));
}

async function removeThresholds(): Promise<void> {
  if (selectedDatasetId.value) {
    await clearThresholds(selectedDatasetId.value);
    hybridViewerStore.addThreshold(selectedDatasetId.value);
  }
}

watch(selectedDatasetId, async (id, previousId) => {
  if (previousId) {
    await clearThresholds(previousId);
  }
  if (id) {
    sources.value = await fetchSources(dataStore, id);
  } else {
    sources.value = [];
  }
  if (id && hybridViewerStore.getThresholds(id).length === 0) {
    hybridViewerStore.addThreshold(id);
  }
});

watch(
  thresholds,
  () => {
    debouncedApply();
  },
  { deep: true },
);

watch(show, (visible) => {
  if (visible) {
    applyThresholds();
  }
});
</script>

<template>
  <ToolPanel
    v-model="show"
    data-testid="thresholdFilterPanel"
    title="Threshold Filter"
    :width="340"
    :click-outside="false"
    :escapeFunction="escapeFunction"
  >
    <v-card-text class="pa-3 max-panel-height overflow-y-auto overflow-x-hidden">
      <v-select
        v-model="selectedDatasetId"
        data-testid="thresholdDatasetSelect"
        :items="availableDatasets"
        label="Select a dataset"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3 text-caption"
      />

      <template v-if="selectedDatasetId">
        <v-divider class="my-2" />
        <v-row align="center" justify="space-between" no-gutters class="mb-2">
          <v-col class="text-caption font-weight-bold">Thresholds ({{ thresholds.length }})</v-col>
          <v-col cols="auto">
            <v-btn
              data-testid="addThresholdButton"
              size="x-small"
              variant="tonal"
              color="primary"
              icon="mdi-plus"
              @click="addThreshold"
            />
          </v-col>
        </v-row>

        <ThresholdCard
          v-for="(threshold, idx) in thresholds"
          :key="threshold.id"
          ref="cards"
          :threshold="threshold"
          :dataset-id="selectedDatasetId"
          :sources="sources"
          :index="idx"
          @remove="removeThreshold(idx)"
        />
      </template>
    </v-card-text>

    <template #actions>
      <v-card-actions class="justify-space-between px-3 pb-3 pt-0">
        <v-btn
          data-testid="removeThresholdButton"
          variant="text"
          size="small"
          color="error"
          class="text-caption text-none"
          @click="removeThresholds"
        >
          Remove all thresholds
        </v-btn>
        <v-btn
          data-testid="resetThresholdButton"
          variant="tonal"
          size="small"
          color="secondary"
          class="text-caption text-none"
          @click="resetRanges"
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

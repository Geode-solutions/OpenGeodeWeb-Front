<script setup lang="ts">
import type { DisplayText, FilterFactor, Label, TestId, Title } from "@ogw_front/types/ui";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { DatasetOption } from "@ogw_front/types/props/components_tools";
import ToolPanel from "@ogw_front/components/ToolPanel.vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// The bounds, default and neutral values of a factor
interface FactorRange {
  min: FilterFactor;
  max: FilterFactor;
  defaultValue: FilterFactor;
  neutralValue: FilterFactor;
}

interface Props {
  title: Title;
  label: Label;
  testIdPrefix: TestId;
  setFactor: (ids: DataId[], factor: FilterFactor) => Promise<void>;
  factorRange: FactorRange;
  formatValue?: (value: FilterFactor) => DisplayText;
  escapeFunction: () => void;
}

const DEBOUNCE_DELAY = 100;

const {
  title,
  label,
  testIdPrefix,
  setFactor,
  factorRange,
  formatValue = (value: FilterFactor): DisplayText => value.toFixed(2),
  escapeFunction,
} = defineProps<Props>();

const capitalizedPrefix = computed<TestId>(
  () => `${testIdPrefix.charAt(0).toUpperCase()}${testIdPrefix.slice(1)}`,
);
const show = defineModel<boolean>("show", { default: false });
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();
const targetAllVisible = ref<boolean>(true);
const selectedDatasetIds = ref<DataId[]>([]);
const factor = ref<FilterFactor>(factorRange.defaultValue);

const allItems = computed(() => dataStore.registeredItems);
const availableDatasets = computed<DatasetOption[]>(() =>
  allItems.value.map((item) => ({
    title: item.name || item.data_id,
    value: item.data_id,
  })),
);

let appliedFactor: FilterFactor | undefined = undefined;

async function applyFactor(): Promise<void> {
  appliedFactor = factor.value;
  const allIds = allItems.value.map((item) => item.data_id);
  if (allIds.length === 0) {
    return;
  }
  const targetIds = targetAllVisible.value ? allIds : selectedDatasetIds.value;
  const untargetedIds = allIds.filter((dataId) => !targetIds.includes(dataId));

  if (targetIds.length > 0) {
    await setFactor(targetIds, Number(factor.value));
  }
  if (untargetedIds.length > 0) {
    await setFactor(untargetedIds, factorRange.neutralValue);
  }
}

const debouncedApply = useDebounceFn(() => applyFactor(), DEBOUNCE_DELAY);

async function resetFactor(): Promise<void> {
  factor.value = factorRange.defaultValue;
  await applyFactor();
}

async function removeFactor(): Promise<void> {
  factor.value = factorRange.neutralValue;
  await applyFactor();
}

watch(factor, (value) => {
  if (value !== appliedFactor) {
    debouncedApply();
  }
});

watch(show, (visible) => {
  if (visible) {
    applyFactor();
  }
});

watch(
  [targetAllVisible, selectedDatasetIds],
  () => {
    if (show.value) {
      applyFactor();
    }
  },
  { deep: true },
);

watch(allItems, () => {
  if (show.value) {
    applyFactor();
  }
});

watch(
  () => Object.values(hybridViewerStore.hybridDb).filter((entry) => entry && entry.actor).length,
  (actorCount) => {
    if (show.value && actorCount > 0) {
      applyFactor();
    }
  },
);
</script>

<template>
  <ToolPanel
    v-model="show"
    :title="title"
    :width="340"
    :click-outside="false"
    :escapeFunction="escapeFunction"
  >
    <v-card-text class="pa-3 max-panel-height overflow-y-auto overflow-x-hidden">
      <v-switch
        v-model="targetAllVisible"
        :data-testid="`${testIdPrefix}TargetAllVisibleSwitch`"
        label="Apply to all visible datasets"
        color="primary"
        density="compact"
        hide-details
        class="mb-2 text-caption"
      />

      <v-select
        v-if="!targetAllVisible"
        v-model="selectedDatasetIds"
        :data-testid="`${testIdPrefix}SelectedDatasetsSelect`"
        :items="availableDatasets"
        :item-props="() => ({ 'data-testid': `${testIdPrefix}SelectedDatasetsOption` })"
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
        <span class="text-caption font-weight-bold">{{ label }}</span>
        <span class="text-caption text-primary font-weight-bold">
          {{ formatValue(factor) }}
        </span>
      </div>

      <v-slider
        v-model="factor"
        :data-testid="`${testIdPrefix}FactorSlider`"
        :min="factorRange.min"
        :max="factorRange.max"
        step="0.01"
        color="primary"
        density="compact"
        hide-details
        class="my-2 px-1"
      />
    </v-card-text>

    <template #actions>
      <v-card-actions class="justify-space-between px-3 pb-3 pt-0">
        <v-btn
          :data-testid="`remove${capitalizedPrefix}Button`"
          variant="text"
          size="small"
          color="error"
          class="text-caption text-none"
          @click="removeFactor"
        >
          Remove {{ capitalizedPrefix }}
        </v-btn>
        <v-btn
          :data-testid="`reset${capitalizedPrefix}Button`"
          variant="tonal"
          size="small"
          color="secondary"
          class="text-caption text-none"
          @click="resetFactor"
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

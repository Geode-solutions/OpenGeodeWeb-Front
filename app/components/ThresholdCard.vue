<script setup lang="ts">
import type { AttributeInfo, AttributeSource } from "@ogw_front/utils/threshold";
import { attributeArrayName, getAttributeRange } from "@ogw_front/utils/attributes";
import type { ThresholdAttribute } from "@ogw_internal/stores/hybrid_viewer/filters";
import ViewerOptionsAttributeRangeSelector from "@ogw_front/components/Viewer/Options/AttributeRangeSelector.vue";
import { fetchAttributeRange } from "@ogw_front/utils/attribute_range";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStyleStore } from "@ogw_front/stores/data_style";

interface Props {
  datasetId: string;
  sources: AttributeSource[];
  index: number;
}

const { datasetId, sources, index } = defineProps<Props>();

interface Emits {
  remove: [];
}

const emit = defineEmits<Emits>();

const threshold = defineModel<ThresholdAttribute | undefined>("threshold");
const backStore = useBackStore();
const dataStyleStore = useDataStyleStore();
const selectedSourceIndex = ref<number>();
const attributes = ref<AttributeInfo[]>([]);
const attributeName = ref<string>();
const attributeItem = ref<number>(0);
const minimum = ref<number>();
const maximum = ref<number>();

const availableSources = computed<{ title: string; value: number }[]>(() =>
  sources.map((source, sourceIndex) => ({
    title: source.title,
    value: sourceIndex,
  })),
);
const currentSource = computed<AttributeSource | undefined>(
  () => sources[selectedSourceIndex.value ?? -1],
);
const currentAttribute = computed<AttributeInfo | undefined>(() =>
  attributes.value.find((attribute) => attribute.attribute_name === attributeName.value),
);
const currentTimeStep = computed<number | undefined>(() => {
  if (!currentSource.value || !currentAttribute.value?.time_steps?.length) {
    return undefined;
  }
  const step =
    dataStyleStore.attributeTimeStep(
      datasetId,
      currentSource.value.timeStepKey,
      attributeName.value,
    ) ?? 0;
  return Math.min(step, currentAttribute.value.time_steps.length - 1);
});
const itemOptions = computed<{ title: string; value: number }[]>(() =>
  Array.from({ length: currentAttribute.value?.nb_items ?? 0 }, (_, itemIndex) => ({
    title: `Item ${itemIndex + 1}`,
    value: itemIndex,
  })),
);
const currentThreshold = computed<ThresholdAttribute | undefined>(() => {
  if (
    !currentSource.value ||
    !attributeName.value ||
    minimum.value === undefined ||
    maximum.value === undefined ||
    minimum.value > maximum.value
  ) {
    return undefined;
  }
  return {
    name: attributeArrayName(attributeName.value, currentTimeStep.value),
    location: currentSource.value.location,
    item: attributeItem.value,
    minimum: minimum.value,
    maximum: maximum.value,
  };
});

async function resetRange(): Promise<void> {
  const source = currentSource.value;
  const name = attributeName.value;
  if (!source || name === undefined) {
    return;
  }
  const range = await fetchAttributeRange(source.schemas.range, source.params, name);
  if (name !== attributeName.value) {
    return;
  }
  const { min, max } = getAttributeRange(range, attributeItem.value);
  minimum.value = min;
  maximum.value = max;
}

watch(selectedSourceIndex, async () => {
  attributeName.value = undefined;
  attributes.value = [];
  const source = currentSource.value;
  if (!source) {
    return;
  }
  const response = (await backStore.request({
    schema: source.schemas.names,
    params: source.params,
  })) as { attributes: AttributeInfo[] };
  attributes.value = response.attributes;
});

watch(attributeName, async () => {
  attributeItem.value = 0;
  await resetRange();
});

watch(attributeItem, async () => {
  await resetRange();
});

watch(currentThreshold, (value) => {
  threshold.value = value;
});

defineExpose({ resetRange });
</script>

<template>
  <v-card
    data-testid="thresholdCard"
    variant="outlined"
    class="pa-2 mb-3 rounded-lg border-opacity-50"
  >
    <v-row align="center" justify="space-between" no-gutters class="mb-2">
      <v-col cols="auto">
        <v-chip size="x-small" variant="flat" color="primary" class="font-weight-bold">
          Threshold #{{ index + 1 }}
        </v-chip>
      </v-col>
      <v-col cols="auto">
        <v-btn
          data-testid="removeThresholdCardButton"
          icon="mdi-trash-can-outline"
          size="x-small"
          variant="text"
          color="error"
          @click="emit('remove')"
        />
      </v-col>
    </v-row>

    <v-select
      v-model="selectedSourceIndex"
      data-testid="thresholdAttributeTypeSelect"
      :items="availableSources"
      label="Select an attribute type"
      variant="outlined"
      density="compact"
      hide-details
      class="mb-3 text-caption"
    />

    <v-select
      v-if="selectedSourceIndex !== undefined"
      v-model="attributeName"
      data-testid="thresholdAttributeSelect"
      :items="attributes.map((attribute) => attribute.attribute_name)"
      label="Select an attribute"
      variant="outlined"
      density="compact"
      hide-details
      class="mb-3 text-caption"
    />

    <v-select
      v-if="currentAttribute && currentAttribute.nb_items > 1"
      v-model="attributeItem"
      data-testid="thresholdItemSelect"
      :items="itemOptions"
      label="Select an item"
      variant="outlined"
      density="compact"
      hide-details
      class="mb-3 text-caption"
    />

    <template v-if="attributeName">
      <span class="text-caption font-weight-bold">Range</span>
      <ViewerOptionsAttributeRangeSelector
        v-model:minimum="minimum"
        v-model:maximum="maximum"
        class="mt-2"
        @reset="resetRange"
      />
    </template>
  </v-card>
</template>

<script setup>
import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar.vue";
import { useBackStore } from "@ogw_front/stores/back";

const backStore = useBackStore();

const attributeName = defineModel("attributeName", { type: String });
const attributeItem = defineModel("attributeItem", { type: Number });
const range = defineModel("range", { type: Array });
const colorMap = defineModel("colorMap", { type: String });

const { id, componentId, schema } = defineProps({
  id: { type: String, required: true },
  componentId: { type: String, default: undefined },
  schema: { type: Object, required: true },
});

const attributes = ref([]);

const rangeMin = computed({
  get: () => (range.value ? range.value[0] : undefined),
  set: (val) => {
    const currentMax = range.value ? range.value[1] : undefined;
    let newMin = val;
    if (currentMax !== undefined && val > currentMax) {
      newMin = currentMax;
    }
    range.value = [newMin, currentMax];
  },
});
const rangeMax = computed({
  get: () => (range.value ? range.value[1] : undefined),
  set: (val) => {
    const currentMin = range.value ? range.value[0] : undefined;
    let newMax = val;
    if (currentMin !== undefined && val < currentMin) {
      newMax = currentMin;
    }
    range.value = [currentMin, newMax];
  },
});

const currentAttribute = computed(() =>
  attributes.value.find((attr) => attr.attribute_name === attributeName.value),
);

const componentItems = computed(() => {
  if (!currentAttribute.value) {
    return [];
  }
  return Array.from({ length: currentAttribute.value.nb_items }, (_, index) => ({
    title: `Item ${index + 1}`,
    value: index,
  }));
});

function resetRange() {
  if (currentAttribute.value) {
    const comp = attributeItem.value ?? 0;
    range.value = [
      currentAttribute.value.min_values[comp],
      currentAttribute.value.max_values[comp],
    ];
  }
}

function getAttributes() {
  if (schema.properties.component_id && componentId === undefined) {
    return;
  }
  const params = { id };
  if (componentId !== undefined) {
    params.component_id = componentId;
  }
  backStore.request(
    { schema, params },
    {
      response_function: (response) => {
        attributes.value = response.attributes;
      },
    },
  );
}

onMounted(() => {
  getAttributes();
});

watch(
  () => [id, componentId, schema],
  () => {
    getAttributes();
  },
);

watch(
  () => [attributeName.value, attributes.value],
  () => {
    if (
      attributeName.value &&
      attributes.value.length > 0 &&
      (range.value === undefined || range.value[0] === undefined || colorMap.value === undefined)
    ) {
      resetRange();
      if (colorMap.value === undefined) {
        colorMap.value = "batlow";
      }
    }
  },
);

watch([attributeName, attributeItem], () => {
  resetRange();
});
</script>

<template>
  <v-select
    data-testid="attributeSelector"
    v-model="attributeName"
    :items="attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    density="compact"
    label="Select an attribute"
    hide-details
  />
  <v-select
    v-if="currentAttribute && currentAttribute.nb_items > 1"
    data-testid="itemSelector"
    v-model="attributeItem"
    :items="componentItems"
    item-title="title"
    item-value="value"
    density="compact"
    label="Select an item"
    class="mt-3"
    hide-details
  />
  <ViewerOptionsAttributeColorBar
    v-if="attributeName"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="colorMap"
    @reset="resetRange"
  />
</template>

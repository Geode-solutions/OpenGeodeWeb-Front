<script setup>
import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar.vue";
import { useBackStore } from "@ogw_front/stores/back";

const backStore = useBackStore();

const attributeName = defineModel("attributeName", { type: String });
const attributeItem = defineModel("attributeItem", { type: Number });
const attributeRange = defineModel("attributeRange", { type: Array });
const attributeColorMap = defineModel("attributeColorMap", { type: String });

const { id, componentId, schema } = defineProps({
  id: { type: String, required: true },
  componentId: { type: String, default: undefined },
  schema: { type: Object, required: true },
});

const attributes = ref([]);

const rangeMin = computed({
  get: () => (attributeRange.value ? attributeRange.value[0] : undefined),
  set: (val) => {
    const currentMax = attributeRange.value ? attributeRange.value[1] : undefined;
    let newMin = val;
    if (currentMax !== undefined && val > currentMax) {
      newMin = currentMax;
    }
    attributeRange.value = [newMin, currentMax];
  },
});
const rangeMax = computed({
  get: () => (attributeRange.value ? attributeRange.value[1] : undefined),
  set: (val) => {
    const currentMin = attributeRange.value ? attributeRange.value[0] : undefined;
    let newMax = val;
    if (currentMin !== undefined && val < currentMin) {
      newMax = currentMin;
    }
    attributeRange.value = [currentMin, newMax];
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
    attributeRange.value = [
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
      (attributeRange.value === undefined ||
        attributeRange.value[0] === undefined ||
        attributeColorMap.value === undefined)
    ) {
      resetRange();
      if (attributeColorMap.value === undefined) {
        attributeColorMap.value = "batlow";
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
    v-model:colorMap="attributeColorMap"
    @reset="resetRange"
  />
</template>

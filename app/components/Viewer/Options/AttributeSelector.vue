<script setup lang="ts">
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar.vue";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import { getAttributeRange } from "@ogw_front/utils/attributes";
import { useBackStore } from "@ogw_front/stores/back";

const backStore = useBackStore();

const attributeName = defineModel("attributeName", { type: String });
const attributeItem = defineModel("attributeItem", { type: Number });
const attributeRange = defineModel("attributeRange", { type: Array });
const attributeColorMap = defineModel("attributeColorMap", { type: String });
const attributeNoDataColor = defineModel("attributeNoDataColor", { type: Object });

const { id, componentIds, schema } = defineProps({
  id: { type: String, required: true },
  componentIds: { type: Array, default: undefined },
  schema: { type: Object, required: true },
});

const attributes = ref([]);

const currentAttribute = computed(() =>
  attributes.value.find((attr) => attr.attribute_name === attributeName.value),
);
const cssNoDataColor = computed(() => {
  const { red, green, blue, alpha } = attributeNoDataColor.value ?? DEFAULT_NO_DATA_COLOR;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
});
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
    const { min, max } = getAttributeRange(currentAttribute.value, comp);
    attributeRange.value = [min, max];
  }
}

function hasSelectedComponent(components) {
  return Array.isArray(components) && components.length > 0;
}

function getAttributes() {
  const requiresComponent = schema.properties.component_ids !== undefined;
  if (requiresComponent && !hasSelectedComponent(componentIds)) {
    return;
  }

  const params = { id };
  if (requiresComponent) {
    params.component_ids = componentIds;
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
  () => [id, componentIds, schema],
  () => {
    getAttributes();
  },
);

watch([attributeName, attributeItem, currentAttribute], () => {
  if (attributeColorMap.value === undefined) {
    attributeColorMap.value = "batlow";
  }
  if (attributeNoDataColor.value === undefined) {
    attributeNoDataColor.value = DEFAULT_NO_DATA_COLOR;
  }
  if (!attributeRange.value || attributeRange.value[0] === undefined) {
    resetRange();
  }
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
  <div
    v-if="currentAttribute && currentAttribute.no_data"
    class="text-caption text-high-emphasis mt-1 d-flex align-center ga-1"
    data-testid="noDataInfo"
  >
    <v-icon icon="mdi-information-outline" size="14" color="info" />
    <span>Contains unmapped elements</span>
    <v-menu :close-on-content-click="false">
      <template #activator="{ props }">
        <button
          v-bind="props"
          type="button"
          class="color-picker-rect-btn ml-1"
          :style="{ backgroundColor: cssNoDataColor }"
          v-tooltip="'Change unmapped elements color'"
          data-testid="noDataColorBtn"
        />
      </template>
      <v-card class="pa-2">
        <ViewerOptionsColorPicker v-model="attributeNoDataColor" disabled-alpha />
      </v-card>
    </v-menu>
  </div>
  <ViewerOptionsAttributeColorBar
    v-if="attributeName"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="attributeColorMap"
    @reset="resetRange"
  />
</template>

<style scoped>
.color-picker-rect-btn {
  width: 26px;
  height: 15px;
  border-radius: 3px;
  border: 2px solid rgba(255, 255, 255, 0.912);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.color-picker-rect-btn:hover {
  border-color: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}
</style>

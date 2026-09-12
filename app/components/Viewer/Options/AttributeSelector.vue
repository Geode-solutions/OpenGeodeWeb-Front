<script setup lang="ts">
import type { PropType } from "vue";
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar.vue";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import { getAttributeRange } from "@ogw_front/utils/attributes";
import { useBackStore } from "@ogw_front/stores/back";
import type { JsonRpcSchema } from "#shared/utils/types.js";

const backStore = useBackStore();

const attributeName = defineModel("attributeName", { type: String });
const attributeItem = defineModel("attributeItem", { type: Number });
const attributeRange = defineModel("attributeRange", { type: Array });
const attributeColorMap = defineModel("attributeColorMap", { type: String });
const attributeNoDataColor = defineModel("attributeNoDataColor", { type: Object });

const { id, componentIds, schema } = defineProps({
  id: { type: String, required: true },
  componentIds: { type: Array, default: undefined },
  schema: { type: Object as PropType<JsonRpcSchema>, required: true },
});

interface AttributeInfo {
  attribute_name: string;
  nb_items: number;
  no_data?: boolean;
  [key: string]: unknown;
}

const attributes = ref<AttributeInfo[]>([]);

const currentAttribute = computed(() =>
  attributes.value.find((attr) => attr.attribute_name === attributeName.value),
);
const cssNoDataColor = computed(() => {
  const { red, green, blue, alpha } = attributeNoDataColor.value ?? DEFAULT_NO_DATA_COLOR;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
});
const rangeMin = computed<number | undefined>({
  get: () => {
    const range = attributeRange.value as number[] | undefined;
    return range ? range[0] : undefined;
  },
  set: (val: number | undefined) => {
    if (val === undefined) {
      return;
    }
    const range = attributeRange.value as number[] | undefined;
    const currentMax = range ? range[1] : undefined;
    let newMin = val;
    if (typeof currentMax === "number" && val > currentMax) {
      newMin = currentMax;
    }
    attributeRange.value = [newMin, currentMax];
  },
});
const rangeMax = computed<number | undefined>({
  get: () => {
    const range = attributeRange.value as number[] | undefined;
    return range ? range[1] : undefined;
  },
  set: (val: number | undefined) => {
    if (val === undefined) {
      return;
    }
    const range = attributeRange.value as number[] | undefined;
    const currentMin = range ? range[0] : undefined;
    let newMax = val;
    if (typeof currentMin === "number" && val < currentMin) {
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
    // GetAttributeRange's parameter type (AttributeRangeSource) isn't exported;
    // AttributeInfo's index signature covers its optional min/max fields at
    // Runtime (they come from the same backend attribute response shape).
    const { min, max } = getAttributeRange(
      currentAttribute.value as unknown as Parameters<typeof getAttributeRange>[0],
      comp,
    );
    attributeRange.value = [min, max];
  }
}

function hasSelectedComponent(components: unknown) {
  return Array.isArray(components) && components.length > 0;
}

function getAttributes() {
  const schemaProperties = schema.properties as Record<string, unknown> | undefined;
  const requiresComponent = schemaProperties?.component_ids !== undefined;
  if (requiresComponent && !hasSelectedComponent(componentIds)) {
    return;
  }

  const params: { id: string; component_ids?: unknown } = { id };
  if (requiresComponent) {
    params.component_ids = componentIds;
  }

  backStore.request(
    { schema, params },
    {
      response_function: (response: unknown) => {
        attributes.value = (response as { attributes: AttributeInfo[] }).attributes;
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

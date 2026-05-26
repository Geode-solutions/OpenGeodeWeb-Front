<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

import BlocksOptions from "./BlocksOptions.vue";
import CornersOptions from "./CornersOptions.vue";
import LinesOptions from "./LinesOptions.vue";
import SurfacesOptions from "./SurfacesOptions.vue";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const dataStore = useDataStore();
const treeviewStore = useTreeviewStore();

function getBatchComponentIds(currentId) {
  const { activeItems } = treeviewStore;
  if (activeItems.includes(currentId) && activeItems.length > 1) {
    return activeItems;
  }
  return [currentId];
}

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});

const modelId = computed(() => itemProps.meta_data.modelId || itemProps.id);
const componentId = computed(() => itemProps.meta_data.pickedComponentId);
const selection = computed(() => dataStyleStore.visibleMeshComponents(modelId.value).value || []);
const componentType = ref(undefined);

watch(
  () => [modelId.value, componentId.value, itemProps.meta_data.viewer_type, itemProps.meta_data.modelComponentType],
  async () => {
    componentType.value = undefined;
    if (itemProps.meta_data.viewer_type === "model_component_type") {
      componentType.value = itemProps.meta_data.modelComponentType;
    } else if (componentId.value && modelId.value) {
      const currentModelId = modelId.value;
      const currentCompId = componentId.value;
      const type = await dataStore.meshComponentType(currentModelId, currentCompId);
      if (modelId.value === currentModelId && componentId.value === currentCompId && itemProps.meta_data.viewer_type !== "model_component_type") {
        componentType.value = type;
      }
    }
  },
  { immediate: true }
);

const targetComponentIds = ref([]);
watch(
  () => [modelId.value, componentType.value],
  async () => {
    targetComponentIds.value = [];
    if (componentType.value && modelId.value) {
      const currentModelId = modelId.value;
      const currentType = componentType.value;
      const ids = await dataStore.getMeshComponentGeodeIds(currentModelId, currentType);
      if (modelId.value === currentModelId && componentType.value === currentType) {
        targetComponentIds.value = ids;
      }
    }
  },
  { immediate: true }
);

const modelVisibility = computed({
  get: () => dataStyleStore.modelVisibility(modelId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelVisibility(modelId.value, newValue);
    hybridViewerStore.remoteRender();
  },
});

const colorModes = [
  { title: "Constant", value: "constant" },
  { title: "Random", value: "random" },
];

const modelComponentsColorMode = ref("constant");

const modelComponentsColor = computed({
  get: () => {
    if (selection.value.length > 0) {
      return dataStyleStore.getModelComponentColor(modelId.value, selection.value[0]);
    }
    return { red: 255, green: 255, blue: 255 };
  },
  set: async (color) => {
    if (selection.value.length > 0) {
      await dataStyleStore.setModelComponentsColor(
        modelId.value,
        selection.value,
        color,
        modelComponentsColorMode.value,
      );
      hybridViewerStore.remoteRender();
    }
  },
});

watch(modelComponentsColorMode, async (colorMode) => {
  if (colorMode === "random" && selection.value.length > 0) {
    await dataStyleStore.setModelComponentsColor(
      modelId.value,
      selection.value,
      undefined,
      colorMode,
    );
    hybridViewerStore.remoteRender();
  }
});
</script>

<template>
  <v-sheet class="model-style-card" color="transparent">
    <OptionsSection title="Model Options">
      <VisibilitySwitch v-model="modelVisibility" />
    </OptionsSection>

    <OptionsSection v-if="!componentType && !componentId" title="Components Options" class="mt-6">
      <v-label class="text-caption mb-1 mt-2">Color Mode</v-label>
      <v-select
        v-model="modelComponentsColorMode"
        :items="colorModes"
        density="compact"
        hide-details
        class="mb-3"
        variant="outlined"
      />

      <template v-if="modelComponentsColorMode === 'constant'">
        <v-label class="text-caption mb-1">Color</v-label>
        <ViewerOptionsColorPicker v-model="modelComponentsColor" />
      </template>
    </OptionsSection>

    <BlocksOptions
      v-if="componentType === 'Block'"
      :modelId="modelId"
      :componentId="componentId"
      :targetComponentIds="targetComponentIds"
      :selection="selection"
    />
    <SurfacesOptions
      v-else-if="componentType === 'Surface'"
      :modelId="modelId"
      :componentId="componentId"
      :targetComponentIds="targetComponentIds"
      :selection="selection"
    />
    <LinesOptions
      v-else-if="componentType === 'Line'"
      :modelId="modelId"
      :componentId="componentId"
      :targetComponentIds="targetComponentIds"
      :selection="selection"
    />
    <CornersOptions
      v-else-if="componentType === 'Corner'"
      :modelId="modelId"
      :componentId="componentId"
      :targetComponentIds="targetComponentIds"
      :selection="selection"
    />
  </v-sheet>
</template>

<style scoped>
.model-style-card {
  padding-top: 20px;
  overflow-x: hidden;
}
</style>

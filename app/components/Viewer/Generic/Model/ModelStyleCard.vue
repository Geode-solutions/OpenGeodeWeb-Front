<script setup>
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useDataStore } from "@ogw_front/stores/data";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const dataStore = useDataStore();

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});

const modelId = computed(() => itemProps.meta_data.modelId || itemProps.id);
const componentId = computed(() => itemProps.meta_data.pickedComponentId);

const component_type = ref(null);

watchEffect(async () => {
  if (itemProps.meta_data.viewer_type === "model_component_type") {
    component_type.value = itemProps.meta_data.modelComponentType;
  } else if (componentId.value && modelId.value) {
    const type = await dataStore.meshComponentType(modelId.value, componentId.value);
    component_type.value = type || null;
  } else {
    component_type.value = null;
  }
});

const modelVisibility = computed({
  get: () => dataStyleStore.modelVisibility(modelId.value),
  set: (value) => {
    dataStyleStore.setModelVisibility(modelId.value, value);
    hybridViewerStore.remoteRender();
  },
});

const componentColor = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.getModelComponentColor(modelId.value, componentId.value)
      : undefined,
  set: (newValue) => {
    if (componentId.value) {
      dataStyleStore.setModelComponentsColor(modelId.value, [componentId.value], newValue);
      hybridViewerStore.remoteRender();
    }
  },
});

const modelComponentTypeColor = computed({
  get: () =>
    component_type.value
      ? dataStyleStore.getModelComponentTypeColor(modelId.value, component_type.value)
      : undefined,
  set: (newValue) => {
    if (component_type.value) {
      dataStyleStore.setModelComponentTypeColor(modelId.value, component_type.value, newValue);
      hybridViewerStore.remoteRender();
    }
  },
});

const modelComponentTypeLabel = computed(() => {
  if (!component_type.value) return "";
  return `${component_type.value}s Options`;
});
</script>

<template>
  <div class="model-style-card">
    <div class="options-section">
      <div class="section-badge">Model Options</div>
      <v-container class="pa-2">
        <VisibilitySwitch v-model="modelVisibility" />
      </v-container>
    </div>

    <div v-if="component_type" class="options-section mt-6">
      <div class="section-badge">{{ modelComponentTypeLabel }}</div>
      <v-container class="pa-2">
        <div class="text-caption mb-1">Color</div>
        <ViewerOptionsColorPicker v-model="modelComponentTypeColor" />
      </v-container>
    </div>

    <div v-if="componentId" class="options-section mt-6">
      <div class="section-badge">Component Options</div>
      <v-container class="pa-2">
        <div class="text-caption mb-1">Color</div>
        <ViewerOptionsColorPicker v-model="componentColor" />
      </v-container>
    </div>
  </div>
</template>

<style scoped>
.model-style-card {
  padding-top: 20px;
  overflow-x: hidden;
}

.options-section {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 8px 8px 8px;
}

.section-badge {
  position: absolute;
  top: -12px;
  left: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 2px 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.v-theme--light .options-section {
  border-color: rgba(0, 0, 0, 0.12);
}

.v-theme--light .section-badge {
  background-color: white;
  color: #444;
  border-color: rgba(0, 0, 0, 0.12);
}
</style>

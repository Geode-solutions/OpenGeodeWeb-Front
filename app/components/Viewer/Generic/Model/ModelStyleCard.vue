<script setup>
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const dataStore = useDataStore();

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});

const modelId = computed(() => itemProps.meta_data.modelId || itemProps.id);
const componentId = computed(() => itemProps.meta_data.pickedComponentId);
const selection = dataStyleStore.visibleMeshComponents(modelId);
const component_type = ref(undefined);

const modelCollapsed = ref(false);
const typeCollapsed = ref(false);
const componentCollapsed = ref(false);

watchEffect(async () => {
  if (itemProps.meta_data.viewer_type === "model_component_type") {
    component_type.value = itemProps.meta_data.modelComponentType;
  } else if (componentId.value && modelId.value) {
    component_type.value = await dataStore.meshComponentType(modelId.value, componentId.value);
  } else {
    component_type.value = undefined;
  }
});

function styleComputed(getter, setter) {
  return computed({
    get: getter,
    set: async (newValue) => {
      await setter(newValue);
      hybridViewerStore.remoteRender();
    },
  });
}

const modelVisibility = styleComputed(
  () => dataStyleStore.modelVisibility(modelId.value),
  (isVisible) => dataStyleStore.setModelVisibility(modelId.value, isVisible),
);

const modelComponentTypeVisibility = styleComputed(
  () => selection.value.includes(component_type.value),
  (isVisible) =>
    dataStyleStore.setModelComponentTypeVisibility(modelId.value, component_type.value, isVisible),
);

const componentVisibility = styleComputed(
  () => selection.value.includes(componentId.value),
  (isVisible) =>
    dataStyleStore.setModelComponentsVisibility(modelId.value, [componentId.value], isVisible),
);

const componentColor = styleComputed(
  () =>
    componentId.value
      ? dataStyleStore.getModelComponentEffectiveColor(
          modelId.value,
          componentId.value,
          component_type.value,
        )
      : undefined,
  (color) =>
    componentId.value &&
    dataStyleStore.setModelComponentsColor(modelId.value, [componentId.value], color),
);

const modelComponentTypeColor = styleComputed(
  () =>
    component_type.value
      ? dataStyleStore.getModelComponentTypeColor(modelId.value, component_type.value)
      : undefined,
  (color) =>
    component_type.value &&
    dataStyleStore.setModelComponentTypeColor(modelId.value, component_type.value, color),
);

const modelComponentTypeColorMode = styleComputed(
  () =>
    component_type.value
      ? dataStyleStore.getModelComponentTypeColorMode(modelId.value, component_type.value)
      : "constant",
  (colorMode) =>
    component_type.value &&
    dataStyleStore.setModelComponentTypeColorMode(modelId.value, component_type.value, colorMode),
);

const componentColorMode = styleComputed(
  () =>
    componentId.value
      ? dataStyleStore.getModelComponentColorMode(modelId.value, componentId.value)
      : "constant",
  (colorMode) =>
    componentId.value &&
    dataStyleStore.setModelComponentColorMode(modelId.value, componentId.value, colorMode),
);

const colorModes = [
  { title: "Constant", value: "constant" },
  { title: "Random", value: "random" },
];

const modelComponentTypeLabel = computed(() =>
  component_type.value ? `${component_type.value}s Options` : "",
);
</script>

<template>
  <div class="model-style-card">
    <div class="options-section">
      <div class="section-badge" @click="modelCollapsed = !modelCollapsed">
        Model Options
        <v-icon class="collapse-icon" :class="{ rotated: modelCollapsed }" size="12">
          mdi-chevron-down
        </v-icon>
      </div>
      <v-container v-show="!modelCollapsed" class="pa-2">
        <VisibilitySwitch v-model="modelVisibility" />
      </v-container>
    </div>

    <div v-if="component_type" class="options-section mt-6">
      <div class="section-badge" @click="typeCollapsed = !typeCollapsed">
        {{ modelComponentTypeLabel }}
        <v-icon class="collapse-icon" :class="{ rotated: typeCollapsed }" size="12">
          mdi-chevron-down
        </v-icon>
      </div>
      <v-container v-show="!typeCollapsed" class="pa-2">
        <VisibilitySwitch v-model="modelComponentTypeVisibility" />
        <div class="text-caption mb-1 mt-2">Color Mode</div>
        <v-select
          v-model="modelComponentTypeColorMode"
          :items="colorModes"
          density="compact"
          hide-details
          class="mb-3"
          variant="outlined"
        />

        <template v-if="modelComponentTypeColorMode === 'constant'">
          <div class="text-caption mb-1">Color</div>
          <ViewerOptionsColorPicker v-model="modelComponentTypeColor" />
        </template>
      </v-container>
    </div>

    <div v-if="componentId" class="options-section mt-6">
      <div class="section-badge" @click="componentCollapsed = !componentCollapsed">
        Component Options
        <v-icon class="collapse-icon" :class="{ rotated: componentCollapsed }" size="12">
          mdi-chevron-down
        </v-icon>
      </div>
      <v-container v-show="!componentCollapsed" class="pa-2">
        <VisibilitySwitch v-model="componentVisibility" />
        <div class="text-caption mb-1 mt-2">Color Mode</div>
        <v-select
          v-model="componentColorMode"
          :items="colorModes"
          density="compact"
          hide-details
          class="mb-3"
          variant="outlined"
        />

        <template v-if="componentColorMode === 'constant'">
          <div class="text-caption mb-1">Color</div>
          <ViewerOptionsColorPicker v-model="componentColor" />
        </template>
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
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.section-badge:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.collapse-icon {
  transition: transform 0.2s ease;
}

.collapse-icon.rotated {
  transform: rotate(-90deg);
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

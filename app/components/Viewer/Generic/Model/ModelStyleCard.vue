<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
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
const componentType = ref(undefined);

watchEffect(async () => {
  if (itemProps.meta_data.viewer_type === "model_component_type") {
    componentType.value = itemProps.meta_data.modelComponentType;
  } else if (componentId.value && modelId.value) {
    componentType.value = await dataStore.meshComponentType(modelId.value, componentId.value);
  } else {
    componentType.value = undefined;
  }
});

const modelVisibility = computed({
  get: () => dataStyleStore.modelVisibility(modelId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelVisibility(modelId.value, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVisibility = computed({
  get: () => selection.value.includes(componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(
      modelId.value,
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const componentVisibility = computed({
  get: () => selection.value.includes(componentId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsVisibility(modelId.value, [componentId.value], newValue);
    hybridViewerStore.remoteRender();
  },
});

const componentColor = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.getModelComponentEffectiveColor(
          modelId.value,
          componentId.value,
          componentType.value,
        )
      : undefined,
  set: async (color) => {
    if (componentId.value) {
      await dataStyleStore.setModelComponentsColor(modelId.value, [componentId.value], color);
      hybridViewerStore.remoteRender();
    }
  },
});

const modelComponentTypeColor = computed({
  get: () =>
    componentType.value
      ? dataStyleStore.getModelComponentTypeColor(modelId.value, componentType.value)
      : undefined,
  set: async (color) => {
    if (componentType.value) {
      await dataStyleStore.setModelComponentTypeColor(modelId.value, componentType.value, color);
      hybridViewerStore.remoteRender();
    }
  },
});

const modelComponentTypeColorMode = computed({
  get: () => dataStyleStore.getModelComponentTypeColorMode(modelId.value, componentType.value),
  set: async (colorMode) => {
    if (componentType.value) {
      await dataStyleStore.setModelComponentTypeColorMode(
        modelId.value,
        componentType.value,
        colorMode,
      );
      hybridViewerStore.remoteRender();
    }
  },
});

const componentColorMode = computed({
  get: () => dataStyleStore.getModelComponentColorMode(modelId.value, componentId.value),
  set: async (colorMode) => {
    if (componentId.value) {
      await dataStyleStore.setModelComponentColorMode(modelId.value, componentId.value, colorMode);
      hybridViewerStore.remoteRender();
    }
  },
});

const colorModes = [
  { title: "Constant", value: "constant" },
  { title: "Random", value: "random" },
];

const modelComponentTypeLabel = computed(() =>
  componentType.value ? `${componentType.value}s Options` : "",
);
</script>

<template>
  <div class="model-style-card">
    <OptionsSection title="Model Options">
      <VisibilitySwitch v-model="modelVisibility" />
    </OptionsSection>

    <OptionsSection v-if="componentType" :title="modelComponentTypeLabel" class="mt-6">
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
    </OptionsSection>

    <OptionsSection v-if="componentId" title="Component Options" class="mt-6">
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
    </OptionsSection>
  </div>
</template>

<style scoped>
.model-style-card {
  padding-top: 20px;
  overflow-x: hidden;
}
</style>

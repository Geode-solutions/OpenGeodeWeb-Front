<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

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
const selection = dataStyleStore.visibleMeshComponents(modelId.value);
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
    const targetTypes = getBatchComponentIds(componentType.value);
    const promises = targetTypes.map((type) =>
      dataStyleStore.setModelComponentTypeVisibility(modelId.value, type, newValue)
    );
    await Promise.all(promises);
    hybridViewerStore.remoteRender();
  },
});

const componentVisibility = computed({
  get: () => selection.value.includes(componentId.value),
  set: async (newValue) => {
    const targetIds = getBatchComponentIds(componentId.value);
    await dataStyleStore.setModelComponentsVisibility(modelId.value, targetIds, newValue);
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
      const targetIds = getBatchComponentIds(componentId.value);
      await dataStyleStore.setModelComponentsColor(modelId.value, targetIds, color);
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
      const targetTypes = getBatchComponentIds(componentType.value);
      const promises = targetTypes.map((type) =>
        dataStyleStore.setModelComponentTypeColor(modelId.value, type, color)
      );
      await Promise.all(promises);
      hybridViewerStore.remoteRender();
    }
  },
});

const modelComponentTypeColorMode = computed({
  get: () => dataStyleStore.getModelComponentTypeColorMode(modelId.value, componentType.value),
  set: async (colorMode) => {
    if (componentType.value) {
      const targetTypes = getBatchComponentIds(componentType.value);
      const promises = targetTypes.map((type) =>
        dataStyleStore.setModelComponentTypeColorMode(modelId.value, type, colorMode)
      );
      await Promise.all(promises);
      hybridViewerStore.remoteRender();
    }
  },
});

const componentColorMode = computed({
  get: () => dataStyleStore.getModelComponentColorMode(modelId.value, componentId.value),
  set: async (colorMode) => {
    if (componentId.value) {
      const targetIds = getBatchComponentIds(componentId.value);
      const promises = targetIds.map((id) =>
        dataStyleStore.setModelComponentColorMode(modelId.value, id, colorMode)
      );
      await Promise.all(promises);
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

    <OptionsSection v-if="componentType" :title="modelComponentTypeLabel" class="mt-6">
      <VisibilitySwitch v-model="modelComponentTypeVisibility" />
      <v-label class="text-caption mb-1 mt-2">Color Mode</v-label>
      <v-select
        v-model="modelComponentTypeColorMode"
        :items="colorModes"
        density="compact"
        hide-details
        class="mb-3"
        variant="outlined"
      />

      <template v-if="modelComponentTypeColorMode === 'constant'">
        <v-label class="text-caption mb-1">Color</v-label>
        <ViewerOptionsColorPicker v-model="modelComponentTypeColor" />
      </template>
    </OptionsSection>

    <OptionsSection v-if="componentId" title="Component Options" class="mt-6">
      <VisibilitySwitch v-model="componentVisibility" />
      <v-label class="text-caption mb-1 mt-2">Color Mode</v-label>
      <v-select
        v-model="componentColorMode"
        :items="colorModes"
        density="compact"
        hide-details
        class="mb-3"
        variant="outlined"
      />

      <template v-if="componentColorMode === 'constant'">
        <v-label class="text-caption mb-1">Color</v-label>
        <ViewerOptionsColorPicker v-model="componentColor" />
      </template>
    </OptionsSection>
  </v-sheet>
</template>

<style scoped>
.model-style-card {
  padding-top: 20px;
  overflow-x: hidden;
}
</style>

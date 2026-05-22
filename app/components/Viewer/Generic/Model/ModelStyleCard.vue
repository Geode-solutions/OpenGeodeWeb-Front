<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelColoringOptions } from "@ogw_front/composables/useModelColoringOptions";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const dataStore = useDataStore();

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

// ─── Visibility ───────────────────────────────────────────────────────────────
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

const globalOpts = reactive(
  useModelColoringOptions({
    modelId,
    selection,
  }),
);

const typeOpts = reactive(
  useModelColoringOptions({
    modelId,
    componentType,
  }),
);

const compOpts = reactive(
  useModelColoringOptions({
    modelId,
    componentId,
  }),
);

function getCapabilities(type) {
  if (type === "Block") {
    return {
      vertex: { available: true, hasColorMap: true },
      polyhedron: { available: true, hasColorMap: true },
    };
  } else if (type === "Surface") {
    return {
      vertex: { available: true, hasColorMap: true },
      polygon: { available: true, hasColorMap: true },
    };
  } else if (type === "Line") {
    return {
      vertex: { available: true, hasColorMap: true },
      edge: { available: true, hasColorMap: true },
    };
  } else if (type === "Corner") {
    return {
      vertex: { available: true, hasColorMap: true },
    };
  }
  return {
    vertex: { available: true, hasColorMap: true },
    cell: { available: true, hasColorMap: true },
    edge: { available: true, hasColorMap: true },
    polygon: { available: true, hasColorMap: true },
    polyhedron: { available: true, hasColorMap: true },
  };
}

const modelComponentTypeLabel = computed(() =>
  componentType.value ? `${componentType.value}s Options` : "",
);
</script>

<template>
  <v-sheet class="model-style-card" color="transparent">
    <!-- Model-level visibility -->
    <OptionsSection title="Model Options">
      <VisibilitySwitch v-model="modelVisibility" />
    </OptionsSection>

    <!-- Global: all visible components -->
    <OptionsSection title="Components Options" class="mt-6">
      <ViewerOptionsColoringTypeSelector
        :id="modelId"
        :isModel="true"
        v-model:coloring_style_key="globalOpts.coloringStyleKey"
        v-model:color="globalOpts.color"
        v-model:color_mode="globalOpts.colorMode"
        v-model:vertex_attribute_name="globalOpts.vertex.name"
        v-model:vertex_attribute_range="globalOpts.vertex.range"
        v-model:vertex_attribute_color_map="globalOpts.vertex.colorMap"
        v-model:cell_attribute_name="globalOpts.cell.name"
        v-model:cell_attribute_range="globalOpts.cell.range"
        v-model:cell_attribute_color_map="globalOpts.cell.colorMap"
        v-model:edge_attribute_name="globalOpts.edge.name"
        v-model:edge_attribute_range="globalOpts.edge.range"
        v-model:edge_attribute_color_map="globalOpts.edge.colorMap"
        v-model:polygon_attribute_name="globalOpts.polygon.name"
        v-model:polygon_attribute_range="globalOpts.polygon.range"
        v-model:polygon_attribute_color_map="globalOpts.polygon.colorMap"
        v-model:polyhedron_attribute_name="globalOpts.polyhedron.name"
        v-model:polyhedron_attribute_range="globalOpts.polyhedron.range"
        v-model:polyhedron_attribute_color_map="globalOpts.polyhedron.colorMap"
        :capabilities="getCapabilities(undefined)"
      />
    </OptionsSection>

    <!-- Type-level: e.g. "Surfaces Options" -->
    <OptionsSection v-if="componentType" :title="modelComponentTypeLabel" class="mt-6">
      <VisibilitySwitch v-model="modelComponentTypeVisibility" />
      <div v-if="modelComponentTypeVisibility" class="mt-4">
        <ViewerOptionsColoringTypeSelector
          :id="modelId"
          :isModel="true"
          v-model:coloring_style_key="typeOpts.coloringStyleKey"
          v-model:color="typeOpts.color"
          v-model:color_mode="typeOpts.colorMode"
          v-model:vertex_attribute_name="typeOpts.vertex.name"
          v-model:vertex_attribute_range="typeOpts.vertex.range"
          v-model:vertex_attribute_color_map="typeOpts.vertex.colorMap"
          v-model:cell_attribute_name="typeOpts.cell.name"
          v-model:cell_attribute_range="typeOpts.cell.range"
          v-model:cell_attribute_color_map="typeOpts.cell.colorMap"
          v-model:edge_attribute_name="typeOpts.edge.name"
          v-model:edge_attribute_range="typeOpts.edge.range"
          v-model:edge_attribute_color_map="typeOpts.edge.colorMap"
          v-model:polygon_attribute_name="typeOpts.polygon.name"
          v-model:polygon_attribute_range="typeOpts.polygon.range"
          v-model:polygon_attribute_color_map="typeOpts.polygon.colorMap"
          v-model:polyhedron_attribute_name="typeOpts.polyhedron.name"
          v-model:polyhedron_attribute_range="typeOpts.polyhedron.range"
          v-model:polyhedron_attribute_color_map="typeOpts.polyhedron.colorMap"
          :capabilities="getCapabilities(componentType)"
          :componentType="componentType"
        />
      </div>
    </OptionsSection>

    <!-- Component-level: specific component -->
    <OptionsSection v-if="componentId" title="Component Options" class="mt-6">
      <VisibilitySwitch v-model="componentVisibility" />
      <div v-if="componentVisibility" class="mt-4">
        <ViewerOptionsColoringTypeSelector
          :id="modelId"
          :isModel="true"
          v-model:coloring_style_key="compOpts.coloringStyleKey"
          v-model:color="compOpts.color"
          v-model:color_mode="compOpts.colorMode"
          v-model:vertex_attribute_name="compOpts.vertex.name"
          v-model:vertex_attribute_range="compOpts.vertex.range"
          v-model:vertex_attribute_color_map="compOpts.vertex.colorMap"
          v-model:cell_attribute_name="compOpts.cell.name"
          v-model:cell_attribute_range="compOpts.cell.range"
          v-model:cell_attribute_color_map="compOpts.cell.colorMap"
          v-model:edge_attribute_name="compOpts.edge.name"
          v-model:edge_attribute_range="compOpts.edge.range"
          v-model:edge_attribute_color_map="compOpts.edge.colorMap"
          v-model:polygon_attribute_name="compOpts.polygon.name"
          v-model:polygon_attribute_range="compOpts.polygon.range"
          v-model:polygon_attribute_color_map="compOpts.polygon.colorMap"
          v-model:polyhedron_attribute_name="compOpts.polyhedron.name"
          v-model:polyhedron_attribute_range="compOpts.polyhedron.range"
          v-model:polyhedron_attribute_color_map="compOpts.polyhedron.colorMap"
          :capabilities="getCapabilities(componentType)"
          :componentId="componentId"
          :componentType="componentType"
        />
      </div>
    </OptionsSection>
  </v-sheet>
</template>

<style scoped>
.model-style-card {
  padding-top: 20px;
  overflow-x: hidden;
}
</style>

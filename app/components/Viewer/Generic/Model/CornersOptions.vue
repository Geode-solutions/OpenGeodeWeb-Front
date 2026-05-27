<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const { modelId, cornerId, targetCornerIds } = defineProps({
  modelId: { type: String, required: true },
  cornerId: { type: String, default: undefined },
  targetCornerIds: { type: Array, required: true },
});

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

// Visibility
const modelComponentTypeVisibility = computed({
  get: () => dataStyleStore.modelComponentTypeVisibility(modelId, "Corner"),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(modelId, "Corner", newValue);
    hybridViewerStore.remoteRender();
  },
});

const componentVisibility = computed({
  get: () => dataStyleStore.modelComponentVisibility(modelId, cornerId),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsVisibility(modelId, [cornerId], newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const modelComponentTypeColor = computed({
  get: () => dataStyleStore.getModelComponentTypeColor(modelId, "Corner"),
  set: async (color) => {
    await dataStyleStore.setModelComponentTypeColor(modelId, "Corner", color);
    hybridViewerStore.remoteRender();
  },
});

const componentColor = computed({
  get: () => dataStyleStore.getModelComponentEffectiveColor(modelId, cornerId, "Corner"),
  set: async (color) => {
    if (cornerId) {
      await dataStyleStore.setModelComponentsColor(modelId, [cornerId], color);
      hybridViewerStore.remoteRender();
    }
  },
});

const modelComponentTypeColorMode = computed({
  get: () => dataStyleStore.getModelComponentTypeColorMode(modelId, "Corner"),
  set: async (colorMode) => {
    await dataStyleStore.setModelComponentTypeColorMode(modelId, "Corner", colorMode);
    hybridViewerStore.remoteRender();
  },
});

const componentColorMode = computed({
  get: () => dataStyleStore.getModelComponentColorMode(modelId, cornerId),
  set: async (colorMode) => {
    if (cornerId) {
      await dataStyleStore.setModelComponentColorMode(modelId, cornerId, colorMode);
      hybridViewerStore.remoteRender();
    }
  },
});

// Group Attributes
const modelComponentTypeVertexAttributeName = computed({
  get: () => dataStyleStore.modelCornersVertexAttributeName(modelId, targetCornerIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeName(modelId, targetCornerIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVertexAttributeRange = computed({
  get: () => dataStyleStore.modelCornersVertexAttributeRange(modelId, targetCornerIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeRange(
      modelId,
      targetCornerIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelCornersVertexAttributeColorMap(modelId, targetCornerIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeColorMap(modelId, targetCornerIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed({
  get: () => dataStyleStore.modelCornersVertexAttributeName(modelId, cornerId),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeName(modelId, [cornerId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed({
  get: () => dataStyleStore.modelCornersVertexAttributeRange(modelId, cornerId),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeRange(
      modelId,
      [cornerId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelCornersVertexAttributeColorMap(modelId, cornerId),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeColorMap(modelId, [cornerId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const capabilities = {
  color: { available: true },
  textures: { available: false },
  vertex: { available: true },
  edge: { available: false },
  cell: { available: false },
  polygon: { available: false },
  polyhedron: { available: false },
};

const vertexSchema = back_schemas.opengeodeweb_back.model_component_vertex_attribute_names;
</script>

<template>
  <div>
    <OptionsSection title="Corners Options" class="mt-6">
      <VisibilitySwitch v-model="modelComponentTypeVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="targetCornerIds[0]"
            v-model:coloring_style_key="modelComponentTypeColorMode"
            v-model:color="modelComponentTypeColor"
            v-model:vertex_attribute_name="modelComponentTypeVertexAttributeName"
            v-model:vertex_attribute_range="modelComponentTypeVertexAttributeRange"
            v-model:vertex_attribute_color_map="modelComponentTypeVertexAttributeColorMap"
            :capabilities="capabilities"
            :schemas="{ vertex: vertexSchema }"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>

    <OptionsSection v-if="cornerId" title="Component Options" class="mt-6">
      <VisibilitySwitch v-model="componentVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="cornerId"
            v-model:coloring_style_key="componentColorMode"
            v-model:color="componentColor"
            v-model:vertex_attribute_name="vertexAttributeName"
            v-model:vertex_attribute_range="vertexAttributeRange"
            v-model:vertex_attribute_color_map="vertexAttributeColorMap"
            :capabilities="capabilities"
            :schemas="{ vertex: vertexSchema }"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>
  </div>
</template>

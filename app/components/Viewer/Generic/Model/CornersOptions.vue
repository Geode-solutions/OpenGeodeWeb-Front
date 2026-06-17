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
console.log("CornersOptions setup!");
const hybridViewerStore = useHybridViewerStore();

// Visibility
const cornersVisibility = computed({
  get: () => dataStyleStore.modelComponentTypeVisibility(modelId, "Corner"),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(modelId, "Corner", newValue);
    hybridViewerStore.remoteRender();
  },
});

const cornerVisibility = computed({
  get: () => dataStyleStore.modelCornerVisibility(modelId, cornerId),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVisibility(modelId, [cornerId], newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const cornersColor = computed({
  get: () => dataStyleStore.modelComponentTypeColor(modelId, "Corner"),
  set: async (color) => {
    await dataStyleStore.setModelComponentTypeColor(modelId, "Corner", color);
    hybridViewerStore.remoteRender();
  },
});

const cornerColor = computed({
  get: () => dataStyleStore.modelCornerColor(modelId, cornerId),
  set: async (color) => {
    await dataStyleStore.setModelCornersColor(modelId, [cornerId], color);
    hybridViewerStore.remoteRender();
  },
});

const cornersActiveColoring = computed({
  get: () => dataStyleStore.getModelComponentTypeActiveColoring(modelId, "Corner"),
  set: async (coloringType) => {
    await dataStyleStore.setModelComponentTypeActiveColoring(modelId, "Corner", coloringType);
    hybridViewerStore.remoteRender();
  },
});

const cornerActiveColoring = computed({
  get: () => dataStyleStore.modelCornerActiveColoring(modelId, cornerId),
  set: async (coloringType) => {
    await dataStyleStore.setModelCornersActiveColoring(modelId, [cornerId], coloringType);
    hybridViewerStore.remoteRender();
  },
});

// Group Attributes
const cornersVertexAttributeName = computed({
  get: () => dataStyleStore.modelCornersVertexAttributeName(modelId, targetCornerIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeName(modelId, targetCornerIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const cornersVertexAttributeRange = computed({
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

const cornersVertexAttributeColorMap = computed({
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
  <OptionsSection title="Corners Options" class="mt-4">
    <VisibilitySwitch data-testid="modelCornersVisibilitySwitch" v-model="cornersVisibility" />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentId="targetCornerIds[0]"
      v-model:coloring_style_key="cornersActiveColoring"
      v-model:color="cornersColor"
      v-model:vertex_attribute_name="cornersVertexAttributeName"
      v-model:vertex_attribute_range="cornersVertexAttributeRange"
      v-model:vertex_attribute_color_map="cornersVertexAttributeColorMap"
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema }"
      :allowRandom="true"
    />
  </OptionsSection>

  <OptionsSection v-if="cornerId" title="Component Options" class="mt-4">
    <VisibilitySwitch v-model="cornerVisibility" />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentId="cornerId"
      v-model:coloring_style_key="cornerActiveColoring"
      v-model:color="cornerColor"
      v-model:vertex_attribute_name="vertexAttributeName"
      v-model:vertex_attribute_range="vertexAttributeRange"
      v-model:vertex_attribute_color_map="vertexAttributeColorMap"
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema }"
      :allowRandom="true"
    />
  </OptionsSection>
</template>

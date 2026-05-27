<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const { modelId, lineId, targetLineIds } = defineProps({
  modelId: { type: String, required: true },
  lineId: { type: String, default: undefined },
  targetLineIds: { type: Array, required: true },
});

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

// Visibility
const modelComponentTypeVisibility = computed({
  get: () => dataStyleStore.modelComponentTypeVisibility(modelId, "Line"),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(modelId, "Line", newValue);
    hybridViewerStore.remoteRender();
  },
});

const componentVisibility = computed({
  get: () => dataStyleStore.modelComponentVisibility(modelId, lineId),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsVisibility(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const modelComponentTypeColor = computed({
  get: () => dataStyleStore.getModelComponentTypeColor(modelId, "Line"),
  set: async (color) => {
    await dataStyleStore.setModelComponentTypeColor(modelId, "Line", color);
    hybridViewerStore.remoteRender();
  },
});

const componentColor = computed({
  get: () => dataStyleStore.getModelComponentEffectiveColor(modelId, lineId, "Line"),
  set: async (color) => {
    if (lineId) {
      await dataStyleStore.setModelComponentsColor(modelId, [lineId], color);
      hybridViewerStore.remoteRender();
    }
  },
});

const modelComponentTypeColorMode = computed({
  get: () => dataStyleStore.getModelComponentTypeColorMode(modelId, "Line"),
  set: async (colorMode) => {
    await dataStyleStore.setModelComponentTypeColorMode(modelId, "Line", colorMode);
    hybridViewerStore.remoteRender();
  },
});

const componentColorMode = computed({
  get: () => dataStyleStore.getModelComponentColorMode(modelId, lineId),
  set: async (colorMode) => {
    if (lineId) {
      await dataStyleStore.setModelComponentColorMode(modelId, lineId, colorMode);
      hybridViewerStore.remoteRender();
    }
  },
});

// Group Attributes
const modelComponentTypeVertexAttributeName = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeName(modelId, targetLineIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeName(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVertexAttributeRange = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeRange(modelId, targetLineIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeRange(
      modelId,
      targetLineIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeColorMap(modelId, targetLineIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeColorMap(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeEdgeAttributeName = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeName(modelId, targetLineIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeName(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeEdgeAttributeRange = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeRange(modelId, targetLineIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeRange(
      modelId,
      targetLineIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeEdgeAttributeColorMap = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeColorMap(modelId, targetLineIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeColorMap(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeName(modelId, lineId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeName(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeRange(modelId, lineId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeRange(
      modelId,
      [lineId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeColorMap(modelId, lineId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeColorMap(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeName = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeName(modelId, lineId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeName(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeRange = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeRange(modelId, lineId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeRange(
      modelId,
      [lineId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeColorMap = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeColorMap(modelId, lineId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeColorMap(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const capabilities = {
  color: { available: true },
  textures: { available: false },
  vertex: { available: true },
  edge: { available: true },
  cell: { available: false },
  polygon: { available: false },
  polyhedron: { available: false },
};

const vertexSchema = back_schemas.opengeodeweb_back.model_component_vertex_attribute_names;
const edgeSchema = back_schemas.opengeodeweb_back.model_component_edge_attribute_names;
</script>

<template>
  <div>
    <OptionsSection title="Lines Options" class="mt-6">
      <VisibilitySwitch v-model="modelComponentTypeVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="targetLineIds[0]"
            v-model:coloring_style_key="modelComponentTypeColorMode"
            v-model:color="modelComponentTypeColor"
            v-model:vertex_attribute_name="modelComponentTypeVertexAttributeName"
            v-model:vertex_attribute_range="modelComponentTypeVertexAttributeRange"
            v-model:vertex_attribute_color_map="modelComponentTypeVertexAttributeColorMap"
            v-model:edge_attribute_name="modelComponentTypeEdgeAttributeName"
            v-model:edge_attribute_range="modelComponentTypeEdgeAttributeRange"
            v-model:edge_attribute_color_map="modelComponentTypeEdgeAttributeColorMap"
            :capabilities="capabilities"
            :schemas="{ vertex: vertexSchema, edge: edgeSchema }"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>

    <OptionsSection v-if="lineId" title="Component Options" class="mt-6">
      <VisibilitySwitch v-model="componentVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="lineId"
            v-model:coloring_style_key="componentColorMode"
            v-model:color="componentColor"
            v-model:vertex_attribute_name="vertexAttributeName"
            v-model:vertex_attribute_range="vertexAttributeRange"
            v-model:vertex_attribute_color_map="vertexAttributeColorMap"
            v-model:edge_attribute_name="edgeAttributeName"
            v-model:edge_attribute_range="edgeAttributeRange"
            v-model:edge_attribute_color_map="edgeAttributeColorMap"
            :capabilities="capabilities"
            :schemas="{ vertex: vertexSchema, edge: edgeSchema }"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>
  </div>
</template>

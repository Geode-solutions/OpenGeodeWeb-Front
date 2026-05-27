<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const { modelId, componentId, targetComponentIds } = defineProps({
  modelId: { type: String, required: true },
  componentId: { type: String, default: undefined },
  targetComponentIds: { type: Array, required: true },
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
  get: () => dataStyleStore.modelComponentVisibility(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsVisibility(modelId, [componentId], newValue);
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
  get: () => dataStyleStore.getModelComponentEffectiveColor(modelId, componentId, "Line"),
  set: async (color) => {
    if (componentId) {
      await dataStyleStore.setModelComponentsColor(modelId, [componentId], color);
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
  get: () => dataStyleStore.getModelComponentColorMode(modelId, componentId),
  set: async (colorMode) => {
    if (componentId) {
      await dataStyleStore.setModelComponentColorMode(modelId, componentId, colorMode);
      hybridViewerStore.remoteRender();
    }
  },
});

// Group Attributes
const modelComponentTypeVertexAttributeName = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeName(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeName(modelId, targetComponentIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVertexAttributeRange = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeRange(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeRange(
      modelId,
      targetComponentIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeColorMap(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeColorMap(
      modelId,
      targetComponentIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeEdgeAttributeName = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeName(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeName(modelId, targetComponentIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeEdgeAttributeRange = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeRange(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeRange(
      modelId,
      targetComponentIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeEdgeAttributeColorMap = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeColorMap(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeColorMap(modelId, targetComponentIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeName(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeName(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeRange(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeRange(
      modelId,
      [componentId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeColorMap(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeColorMap(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeName = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeName(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeName(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeRange = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeRange(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeRange(
      modelId,
      [componentId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeColorMap = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeColorMap(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeColorMap(modelId, [componentId], newValue);
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
            :componentId="targetComponentIds[0]"
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

    <OptionsSection v-if="componentId" title="Component Options" class="mt-6">
      <VisibilitySwitch v-model="componentVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="componentId"
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

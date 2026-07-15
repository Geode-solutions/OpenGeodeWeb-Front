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
const linesVisibility = computed({
  get: () => dataStyleStore.modelComponentTypeVisibility(modelId, "Line"),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(modelId, "Line", newValue);
    hybridViewerStore.remoteRender();
  },
});

const lineVisibility = computed({
  get: () => dataStyleStore.modelLineVisibility(modelId, lineId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVisibility(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const linesColor = computed({
  get: () => dataStyleStore.modelComponentTypeColor(modelId, "Line"),
  set: async (color) => {
    await dataStyleStore.setModelComponentTypeColor(modelId, "Line", color);
    hybridViewerStore.remoteRender();
  },
});

const lineColor = computed({
  get: () => dataStyleStore.modelLineColor(modelId, lineId),
  set: async (color) => {
    await dataStyleStore.setModelLinesColor(modelId, [lineId], color);
    hybridViewerStore.remoteRender();
  },
});

const linesActiveColoring = computed({
  get: () => dataStyleStore.getModelComponentTypeActiveColoring(modelId, "Line"),
  set: async (coloringType) => {
    await dataStyleStore.setModelComponentTypeActiveColoring(modelId, "Line", coloringType);
    hybridViewerStore.remoteRender();
  },
});

const lineActiveColoring = computed({
  get: () => dataStyleStore.modelLineActiveColoring(modelId, lineId),
  set: async (coloringType) => {
    await dataStyleStore.setModelLinesActiveColoring(modelId, [lineId], coloringType);
    hybridViewerStore.remoteRender();
  },
});

// Group Attributes
const linesVertexAttributeName = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeName(modelId, targetLineIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeName(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesVertexAttributeItem = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeItem(modelId, targetLineIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeItem(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesVertexAttributeValue = computed({
  get: () => ({
    name: linesVertexAttributeName.value,
    item: linesVertexAttributeItem.value,
  }),
  set: (newValue) => {
    if (newValue.name !== linesVertexAttributeName.value) {
      linesVertexAttributeName.value = newValue.name;
    } else if (newValue.item !== linesVertexAttributeItem.value) {
      linesVertexAttributeItem.value = newValue.item;
    }
  },
});

const linesVertexAttributeRange = computed({
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

const linesVertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeColorMap(modelId, targetLineIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeColorMap(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeName = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeName(modelId, targetLineIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeName(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeItem = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeItem(modelId, targetLineIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeItem(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeValue = computed({
  get: () => ({
    name: linesEdgeAttributeName.value,
    item: linesEdgeAttributeItem.value,
  }),
  set: (newValue) => {
    if (newValue.name !== linesEdgeAttributeName.value) {
      linesEdgeAttributeName.value = newValue.name;
    } else if (newValue.item !== linesEdgeAttributeItem.value) {
      linesEdgeAttributeItem.value = newValue.item;
    }
  },
});

const linesEdgeAttributeRange = computed({
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

const linesEdgeAttributeColorMap = computed({
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

const vertexAttributeItem = computed({
  get: () => dataStyleStore.modelLinesVertexAttributeItem(modelId, lineId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeItem(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeValue = computed({
  get: () => ({
    name: vertexAttributeName.value,
    item: vertexAttributeItem.value,
  }),
  set: (newValue) => {
    if (newValue.name !== vertexAttributeName.value) {
      vertexAttributeName.value = newValue.name;
    } else if (newValue.item !== vertexAttributeItem.value) {
      vertexAttributeItem.value = newValue.item;
    }
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

const edgeAttributeItem = computed({
  get: () => dataStyleStore.modelLinesEdgeAttributeItem(modelId, lineId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeItem(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeValue = computed({
  get: () => ({
    name: edgeAttributeName.value,
    item: edgeAttributeItem.value,
  }),
  set: (newValue) => {
    if (newValue.name !== edgeAttributeName.value) {
      edgeAttributeName.value = newValue.name;
    } else if (newValue.item !== edgeAttributeItem.value) {
      edgeAttributeItem.value = newValue.item;
    }
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
  <OptionsSection title="Lines Options" class="mt-4">
    <VisibilitySwitch data-testid="modelLinesVisibilitySwitch" v-model="linesVisibility" />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentId="targetLineIds[0]"
      v-model:coloring_style_key="linesActiveColoring"
      v-model:color="linesColor"
      v-model:vertex_attribute_name="linesVertexAttributeValue"
      v-model:vertex_attribute_range="linesVertexAttributeRange"
      v-model:vertex_attribute_color_map="linesVertexAttributeColorMap"
      v-model:edge_attribute_name="linesEdgeAttributeValue"
      v-model:edge_attribute_range="linesEdgeAttributeRange"
      v-model:edge_attribute_color_map="linesEdgeAttributeColorMap"
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema, edge: edgeSchema }"
      :allowRandom="true"
    />
  </OptionsSection>

  <OptionsSection v-if="lineId" title="Component Options" class="mt-4">
    <VisibilitySwitch v-model="lineVisibility" />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentId="lineId"
      v-model:coloring_style_key="lineActiveColoring"
      v-model:color="lineColor"
      v-model:vertex_attribute_name="vertexAttributeValue"
      v-model:vertex_attribute_range="vertexAttributeRange"
      v-model:vertex_attribute_color_map="vertexAttributeColorMap"
      v-model:edge_attribute_name="edgeAttributeValue"
      v-model:edge_attribute_range="edgeAttributeRange"
      v-model:edge_attribute_color_map="edgeAttributeColorMap"
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema, edge: edgeSchema }"
      :allowRandom="true"
    />
  </OptionsSection>
</template>

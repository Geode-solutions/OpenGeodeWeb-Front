<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const { modelId, blockId, targetBlockIds } = defineProps({
  modelId: { type: String, required: true },
  blockId: { type: String, default: undefined },
  targetBlockIds: { type: Array, required: true },
});

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

// Visibility
const blocksVisibility = computed({
  get: () => dataStyleStore.modelComponentTypeVisibility(modelId, "Block"),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(modelId, "Block", newValue);
    hybridViewerStore.remoteRender();
  },
});

const blockVisibility = computed({
  get: () => dataStyleStore.modelBlockVisibility(modelId, blockId),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVisibility(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const blocksColor = computed({
  get: () => dataStyleStore.modelComponentTypeColor(modelId, "Block"),
  set: async (color) => {
    await dataStyleStore.setModelComponentTypeColor(modelId, "Block", color);
    hybridViewerStore.remoteRender();
  },
});

const blockColor = computed({
  get: () => dataStyleStore.modelBlockColor(modelId, blockId),
  set: async (color) => {
    if (blockId) {
      await dataStyleStore.setModelBlocksColor(modelId, [blockId], color);
      hybridViewerStore.remoteRender();
    }
  },
});

const blocksColorMode = computed({
  get: () => dataStyleStore.getModelComponentTypeColorMode(modelId, "Block"),
  set: async (colorMode) => {
    await dataStyleStore.setModelComponentTypeColorMode(modelId, "Block", colorMode);
    hybridViewerStore.remoteRender();
  },
});

const blockColorMode = computed({
  get: () => dataStyleStore.modelBlockColorMode(modelId, blockId),
  set: async (colorMode) => {
    if (blockId) {
      await dataStyleStore.setModelBlockColorMode(modelId, blockId, colorMode);
      hybridViewerStore.remoteRender();
    }
  },
});

// Group Attributes
const blocksVertexAttributeName = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeName(modelId, targetBlockIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeName(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const blocksVertexAttributeRange = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeRange(modelId, targetBlockIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeRange(
      modelId,
      targetBlockIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const blocksVertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeColorMap(modelId, targetBlockIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeColorMap(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const blocksPolyhedronAttributeName = computed({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeName(modelId, targetBlockIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeName(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const blocksPolyhedronAttributeRange = computed({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeRange(modelId, targetBlockIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeRange(
      modelId,
      targetBlockIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const blocksPolyhedronAttributeColorMap = computed({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeColorMap(modelId, targetBlockIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeColorMap(
      modelId,
      targetBlockIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeName(modelId, blockId),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeName(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeRange(modelId, blockId),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeRange(
      modelId,
      [blockId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeColorMap(modelId, blockId),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeColorMap(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeName = computed({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeName(modelId, blockId),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeName(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeRange = computed({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeRange(modelId, blockId),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeRange(
      modelId,
      [blockId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeColorMap = computed({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeColorMap(modelId, blockId),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeColorMap(modelId, [blockId], newValue);
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
  polyhedron: { available: true },
};

const vertexSchema = back_schemas.opengeodeweb_back.model_component_vertex_attribute_names;
const polyhedronSchema = back_schemas.opengeodeweb_back.model_component_polyhedron_attribute_names;
</script>

<template>
  <div>
    <OptionsSection title="Blocks Options" class="mt-6">
      <VisibilitySwitch v-model="blocksVisibility" />
      <ViewerOptionsColoringTypeSelector
        :id="modelId"
        :componentId="targetBlockIds[0]"
        v-model:coloring_style_key="blocksColorMode"
        v-model:color="blocksColor"
        v-model:vertex_attribute_name="blocksVertexAttributeName"
        v-model:vertex_attribute_range="blocksVertexAttributeRange"
        v-model:vertex_attribute_color_map="blocksVertexAttributeColorMap"
        v-model:polyhedron_attribute_name="blocksPolyhedronAttributeName"
        v-model:polyhedron_attribute_range="blocksPolyhedronAttributeRange"
        v-model:polyhedron_attribute_color_map="blocksPolyhedronAttributeColorMap"
        :capabilities="capabilities"
        :schemas="{ vertex: vertexSchema, polyhedron: polyhedronSchema }"
        :allowRandom="true"
      />
    </OptionsSection>

    <OptionsSection v-if="blockId" title="Component Options" class="mt-6">
      <VisibilitySwitch v-model="blockVisibility" />
      <ViewerOptionsColoringTypeSelector
        :id="modelId"
        :componentId="blockId"
        v-model:coloring_style_key="blockColorMode"
        v-model:color="blockColor"
        v-model:vertex_attribute_name="vertexAttributeName"
        v-model:vertex_attribute_range="vertexAttributeRange"
        v-model:vertex_attribute_color_map="vertexAttributeColorMap"
        v-model:polyhedron_attribute_name="polyhedronAttributeName"
        v-model:polyhedron_attribute_range="polyhedronAttributeRange"
        v-model:polyhedron_attribute_color_map="polyhedronAttributeColorMap"
        :capabilities="capabilities"
        :schemas="{ vertex: vertexSchema, polyhedron: polyhedronSchema }"
        :allowRandom="true"
      />
    </OptionsSection>
  </div>
</template>

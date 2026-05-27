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
const modelComponentTypeVisibility = computed({
  get: () => dataStyleStore.modelComponentTypeVisibility(modelId, "Block"),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(modelId, "Block", newValue);
    hybridViewerStore.remoteRender();
  },
});

const componentVisibility = computed({
  get: () => dataStyleStore.modelComponentVisibility(modelId, blockId),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsVisibility(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const modelComponentTypeColor = computed({
  get: () => dataStyleStore.getModelComponentTypeColor(modelId, "Block"),
  set: async (color) => {
    await dataStyleStore.setModelComponentTypeColor(modelId, "Block", color);
    hybridViewerStore.remoteRender();
  },
});

const componentColor = computed({
  get: () => dataStyleStore.getModelComponentEffectiveColor(modelId, blockId, "Block"),
  set: async (color) => {
    if (blockId) {
      await dataStyleStore.setModelComponentsColor(modelId, [blockId], color);
      hybridViewerStore.remoteRender();
    }
  },
});

const modelComponentTypeColorMode = computed({
  get: () => dataStyleStore.getModelComponentTypeColorMode(modelId, "Block"),
  set: async (colorMode) => {
    await dataStyleStore.setModelComponentTypeColorMode(modelId, "Block", colorMode);
    hybridViewerStore.remoteRender();
  },
});

const componentColorMode = computed({
  get: () => dataStyleStore.getModelComponentColorMode(modelId, blockId),
  set: async (colorMode) => {
    if (blockId) {
      await dataStyleStore.setModelComponentColorMode(modelId, blockId, colorMode);
      hybridViewerStore.remoteRender();
    }
  },
});

// Group Attributes
const modelComponentTypeVertexAttributeName = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeName(modelId, targetBlockIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeName(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVertexAttributeRange = computed({
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

const modelComponentTypeVertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeColorMap(modelId, targetBlockIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeColorMap(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypePolyhedronAttributeName = computed({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeName(modelId, targetBlockIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeName(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypePolyhedronAttributeRange = computed({
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

const modelComponentTypePolyhedronAttributeColorMap = computed({
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
      <VisibilitySwitch v-model="modelComponentTypeVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="targetBlockIds[0]"
            v-model:coloring_style_key="modelComponentTypeColorMode"
            v-model:color="modelComponentTypeColor"
            v-model:vertex_attribute_name="modelComponentTypeVertexAttributeName"
            v-model:vertex_attribute_range="modelComponentTypeVertexAttributeRange"
            v-model:vertex_attribute_color_map="modelComponentTypeVertexAttributeColorMap"
            v-model:polyhedron_attribute_name="modelComponentTypePolyhedronAttributeName"
            v-model:polyhedron_attribute_range="modelComponentTypePolyhedronAttributeRange"
            v-model:polyhedron_attribute_color_map="modelComponentTypePolyhedronAttributeColorMap"
            :capabilities="capabilities"
            :schemas="{ vertex: vertexSchema, polyhedron: polyhedronSchema }"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>

    <OptionsSection v-if="blockId" title="Component Options" class="mt-6">
      <VisibilitySwitch v-model="componentVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="blockId"
            v-model:coloring_style_key="componentColorMode"
            v-model:color="componentColor"
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
        </v-col>
      </v-row>
    </OptionsSection>
  </div>
</template>

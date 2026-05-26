<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const { modelId, componentId, targetComponentIds, selection } = defineProps({
  modelId: { type: String, required: true },
  componentId: { type: String, default: undefined },
  targetComponentIds: { type: Array, required: true },
  selection: { type: Array, required: true },
});

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

// Visibility
const modelComponentTypeVisibility = computed({
  get: () => selection.includes("Block"),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(modelId, "Block", newValue);
    hybridViewerStore.remoteRender();
  },
});

const componentVisibility = computed({
  get: () => selection.includes(componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsVisibility(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color / Color Mode
const modelComponentTypeColor = computed({
  get: () => dataStyleStore.getModelComponentTypeColor(modelId, "Block"),
  set: async (color) => {
    await dataStyleStore.setModelComponentTypeColor(modelId, "Block", color);
    hybridViewerStore.remoteRender();
  },
});

const componentColor = computed({
  get: () =>
    componentId
      ? dataStyleStore.getModelComponentEffectiveColor(modelId, componentId, "Block")
      : undefined,
  set: async (color) => {
    if (componentId) {
      await dataStyleStore.setModelComponentsColor(modelId, [componentId], color);
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
  get: () => dataStyleStore.getModelComponentColorMode(modelId, componentId),
  set: async (colorMode) => {
    if (componentId) {
      await dataStyleStore.setModelComponentColorMode(modelId, componentId, colorMode);
      hybridViewerStore.remoteRender();
    }
  },
});

// Group Attributes
const typeVertexAttrName = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelBlocksVertexAttributeName(modelId, targetComponentIds[0])
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeName(modelId, targetComponentIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const typeVertexAttrRange = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelBlocksVertexAttributeRange(modelId, targetComponentIds[0])
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeRange(
      modelId,
      targetComponentIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const typeVertexAttrColorMap = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelBlocksVertexAttributeColorMap(modelId, targetComponentIds[0])
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeColorMap(
      modelId,
      targetComponentIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const typePolyhedronAttrName = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelBlocksPolyhedronAttributeName(modelId, targetComponentIds[0])
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeName(
      modelId,
      targetComponentIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const typePolyhedronAttrRange = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelBlocksPolyhedronAttributeRange(modelId, targetComponentIds[0])
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeRange(
      modelId,
      targetComponentIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const typePolyhedronAttrColorMap = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelBlocksPolyhedronAttributeColorMap(modelId, targetComponentIds[0])
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeColorMap(
      modelId,
      targetComponentIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const compVertexAttrName = computed({
  get: () =>
    componentId ? dataStyleStore.modelBlocksVertexAttributeName(modelId, componentId) : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeName(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const compVertexAttrRange = computed({
  get: () =>
    componentId
      ? dataStyleStore.modelBlocksVertexAttributeRange(modelId, componentId)
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeRange(
      modelId,
      [componentId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const compVertexAttrColorMap = computed({
  get: () =>
    componentId
      ? dataStyleStore.modelBlocksVertexAttributeColorMap(modelId, componentId)
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeColorMap(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const compPolyhedronAttrName = computed({
  get: () =>
    componentId
      ? dataStyleStore.modelBlocksPolyhedronAttributeName(modelId, componentId)
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeName(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const compPolyhedronAttrRange = computed({
  get: () =>
    componentId
      ? dataStyleStore.modelBlocksPolyhedronAttributeRange(modelId, componentId)
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeRange(
      modelId,
      [componentId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const compPolyhedronAttrColorMap = computed({
  get: () =>
    componentId
      ? dataStyleStore.modelBlocksPolyhedronAttributeColorMap(modelId, componentId)
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeColorMap(
      modelId,
      [componentId],
      newValue,
    );
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

const vertexSchema = computed(
  () => back_schemas.opengeodeweb_back.model_component_vertex_attribute_names,
);

const polyhedronSchema = computed(
  () => back_schemas.opengeodeweb_back.model_component_polyhedron_attribute_names,
);
</script>

<template>
  <div>
    <OptionsSection title="Blocks Options" class="mt-6">
      <VisibilitySwitch v-model="modelComponentTypeVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="targetComponentIds[0]"
            v-model:coloring_style_key="modelComponentTypeColorMode"
            v-model:color="modelComponentTypeColor"
            v-model:vertex_attribute_name="typeVertexAttrName"
            v-model:vertex_attribute_range="typeVertexAttrRange"
            v-model:vertex_attribute_color_map="typeVertexAttrColorMap"
            v-model:polyhedron_attribute_name="typePolyhedronAttrName"
            v-model:polyhedron_attribute_range="typePolyhedronAttrRange"
            v-model:polyhedron_attribute_color_map="typePolyhedronAttrColorMap"
            :capabilities="capabilities"
            :vertexSchema="vertexSchema"
            :polyhedronSchema="polyhedronSchema"
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
            v-model:vertex_attribute_name="compVertexAttrName"
            v-model:vertex_attribute_range="compVertexAttrRange"
            v-model:vertex_attribute_color_map="compVertexAttrColorMap"
            v-model:polyhedron_attribute_name="compPolyhedronAttrName"
            v-model:polyhedron_attribute_range="compPolyhedronAttrRange"
            v-model:polyhedron_attribute_color_map="compPolyhedronAttrColorMap"
            :capabilities="capabilities"
            :vertexSchema="vertexSchema"
            :polyhedronSchema="polyhedronSchema"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>
  </div>
</template>

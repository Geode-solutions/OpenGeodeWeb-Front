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
    if (cornerId) {
      await dataStyleStore.setModelCornersColor(modelId, [cornerId], color);
      hybridViewerStore.remoteRender();
    }
  },
});

const cornersColorMode = computed({
  get: () => dataStyleStore.getModelComponentTypeColorMode(modelId, "Corner"),
  set: async (colorMode) => {
    await dataStyleStore.setModelComponentTypeColorMode(modelId, "Corner", colorMode);
    hybridViewerStore.remoteRender();
  },
});

const cornerColorMode = computed({
  get: () => dataStyleStore.modelCornerColorMode(modelId, cornerId),
  set: async (colorMode) => {
    if (cornerId) {
      await dataStyleStore.setModelCornerColorMode(modelId, cornerId, colorMode);
      hybridViewerStore.remoteRender();
    }
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
  <div>
    <OptionsSection title="Corners Options" class="mt-6">
      <VisibilitySwitch v-model="cornersVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="targetCornerIds[0]"
            v-model:coloring_style_key="cornersColorMode"
            v-model:color="cornersColor"
            v-model:vertex_attribute_name="cornersVertexAttributeName"
            v-model:vertex_attribute_range="cornersVertexAttributeRange"
            v-model:vertex_attribute_color_map="cornersVertexAttributeColorMap"
            :capabilities="capabilities"
            :schemas="{ vertex: vertexSchema }"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>

    <OptionsSection v-if="cornerId" title="Component Options" class="mt-6">
      <VisibilitySwitch v-model="cornerVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="cornerId"
            v-model:coloring_style_key="cornerColorMode"
            v-model:color="cornerColor"
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

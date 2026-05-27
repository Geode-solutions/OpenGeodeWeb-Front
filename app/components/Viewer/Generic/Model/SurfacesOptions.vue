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
  get: () => dataStyleStore.modelComponentTypeVisibility(modelId, "Surface"),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(modelId, "Surface", newValue);
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
  get: () => dataStyleStore.getModelComponentTypeColor(modelId, "Surface"),
  set: async (color) => {
    await dataStyleStore.setModelComponentTypeColor(modelId, "Surface", color);
    hybridViewerStore.remoteRender();
  },
});

const componentColor = computed({
  get: () => dataStyleStore.getModelComponentEffectiveColor(modelId, componentId, "Surface"),
  set: async (color) => {
    if (componentId) {
      await dataStyleStore.setModelComponentsColor(modelId, [componentId], color);
      hybridViewerStore.remoteRender();
    }
  },
});

const modelComponentTypeColorMode = computed({
  get: () => dataStyleStore.getModelComponentTypeColorMode(modelId, "Surface"),
  set: async (colorMode) => {
    await dataStyleStore.setModelComponentTypeColorMode(modelId, "Surface", colorMode);
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
  get: () => dataStyleStore.modelSurfacesVertexAttributeName(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeName(modelId, targetComponentIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVertexAttributeRange = computed({
  get: () => dataStyleStore.modelSurfacesVertexAttributeRange(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeRange(
      modelId,
      targetComponentIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelSurfacesVertexAttributeColorMap(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeColorMap(
      modelId,
      targetComponentIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypePolygonAttributeName = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeName(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeName(
      modelId,
      targetComponentIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypePolygonAttributeRange = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeRange(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeRange(
      modelId,
      targetComponentIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypePolygonAttributeColorMap = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeColorMap(modelId, targetComponentIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeColorMap(
      modelId,
      targetComponentIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed({
  get: () => dataStyleStore.modelSurfacesVertexAttributeName(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeName(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed({
  get: () => dataStyleStore.modelSurfacesVertexAttributeRange(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeRange(
      modelId,
      [componentId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelSurfacesVertexAttributeColorMap(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeColorMap(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polygonAttributeName = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeName(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeName(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polygonAttributeRange = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeRange(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeRange(
      modelId,
      [componentId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const polygonAttributeColorMap = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeColorMap(modelId, componentId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeColorMap(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const capabilities = {
  color: { available: true },
  textures: { available: false },
  vertex: { available: true },
  edge: { available: false },
  cell: { available: false },
  polygon: { available: true },
  polyhedron: { available: false },
};

const vertexSchema = back_schemas.opengeodeweb_back.model_component_vertex_attribute_names;
const polygonSchema = back_schemas.opengeodeweb_back.model_component_polygon_attribute_names;
</script>

<template>
  <div>
    <OptionsSection title="Surfaces Options" class="mt-6">
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
            v-model:polygon_attribute_name="modelComponentTypePolygonAttributeName"
            v-model:polygon_attribute_range="modelComponentTypePolygonAttributeRange"
            v-model:polygon_attribute_color_map="modelComponentTypePolygonAttributeColorMap"
            :capabilities="capabilities"
            :schemas="{ vertex: vertexSchema, polygon: polygonSchema }"
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
            v-model:polygon_attribute_name="polygonAttributeName"
            v-model:polygon_attribute_range="polygonAttributeRange"
            v-model:polygon_attribute_color_map="polygonAttributeColorMap"
            :capabilities="capabilities"
            :schemas="{ vertex: vertexSchema, polygon: polygonSchema }"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>
  </div>
</template>

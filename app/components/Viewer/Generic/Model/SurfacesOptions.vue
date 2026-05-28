<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const { modelId, surfaceId, targetSurfaceIds } = defineProps({
  modelId: { type: String, required: true },
  surfaceId: { type: String, default: undefined },
  targetSurfaceIds: { type: Array, required: true },
});

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

// Visibility
const surfacesVisibility = computed({
  get: () => dataStyleStore.modelComponentTypeVisibility(modelId, "Surface"),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(modelId, "Surface", newValue);
    hybridViewerStore.remoteRender();
  },
});

const surfaceVisibility = computed({
  get: () => dataStyleStore.modelSurfaceVisibility(modelId, surfaceId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVisibility(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const surfacesColor = computed({
  get: () => dataStyleStore.modelComponentTypeColor(modelId, "Surface"),
  set: async (color) => {
    await dataStyleStore.setModelComponentTypeColor(modelId, "Surface", color);
    hybridViewerStore.remoteRender();
  },
});

const surfaceColor = computed({
  get: () => dataStyleStore.modelSurfaceColor(modelId, surfaceId),
  set: async (color) => {
    if (surfaceId) {
      await dataStyleStore.setModelSurfacesColor(modelId, [surfaceId], color);
      hybridViewerStore.remoteRender();
    }
  },
});

const surfacesColorMode = computed({
  get: () => dataStyleStore.getModelComponentTypeColorMode(modelId, "Surface"),
  set: async (colorMode) => {
    await dataStyleStore.setModelComponentTypeColorMode(modelId, "Surface", colorMode);
    hybridViewerStore.remoteRender();
  },
});

const surfaceColorMode = computed({
  get: () => dataStyleStore.modelSurfaceColorMode(modelId, surfaceId),
  set: async (colorMode) => {
    if (surfaceId) {
      await dataStyleStore.setModelComponentColorMode(modelId, surfaceId, colorMode);
      hybridViewerStore.remoteRender();
    }
  },
});

// Group Attributes
const surfacesVertexAttributeName = computed({
  get: () => dataStyleStore.modelSurfacesVertexAttributeName(modelId, targetSurfaceIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeName(modelId, targetSurfaceIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const surfacesVertexAttributeRange = computed({
  get: () => dataStyleStore.modelSurfacesVertexAttributeRange(modelId, targetSurfaceIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeRange(
      modelId,
      targetSurfaceIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const surfacesVertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelSurfacesVertexAttributeColorMap(modelId, targetSurfaceIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeColorMap(
      modelId,
      targetSurfaceIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const surfacesPolygonAttributeName = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeName(modelId, targetSurfaceIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeName(modelId, targetSurfaceIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const surfacesPolygonAttributeRange = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeRange(modelId, targetSurfaceIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeRange(
      modelId,
      targetSurfaceIds,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const surfacesPolygonAttributeColorMap = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeColorMap(modelId, targetSurfaceIds[0]),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeColorMap(
      modelId,
      targetSurfaceIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed({
  get: () => dataStyleStore.modelSurfacesVertexAttributeName(modelId, surfaceId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeName(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed({
  get: () => dataStyleStore.modelSurfacesVertexAttributeRange(modelId, surfaceId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeRange(
      modelId,
      [surfaceId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelSurfacesVertexAttributeColorMap(modelId, surfaceId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeColorMap(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polygonAttributeName = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeName(modelId, surfaceId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeName(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polygonAttributeRange = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeRange(modelId, surfaceId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeRange(
      modelId,
      [surfaceId],
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});

const polygonAttributeColorMap = computed({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeColorMap(modelId, surfaceId),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeColorMap(modelId, [surfaceId], newValue);
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
      <VisibilitySwitch v-model="surfacesVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="targetSurfaceIds[0]"
            v-model:coloring_style_key="surfacesColorMode"
            v-model:color="surfacesColor"
            v-model:vertex_attribute_name="surfacesVertexAttributeName"
            v-model:vertex_attribute_range="surfacesVertexAttributeRange"
            v-model:vertex_attribute_color_map="surfacesVertexAttributeColorMap"
            v-model:polygon_attribute_name="surfacesPolygonAttributeName"
            v-model:polygon_attribute_range="surfacesPolygonAttributeRange"
            v-model:polygon_attribute_color_map="surfacesPolygonAttributeColorMap"
            :capabilities="capabilities"
            :schemas="{ vertex: vertexSchema, polygon: polygonSchema }"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>

    <OptionsSection v-if="surfaceId" title="Component Options" class="mt-6">
      <VisibilitySwitch v-model="surfaceVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="surfaceId"
            v-model:coloring_style_key="surfaceColorMode"
            v-model:color="surfaceColor"
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

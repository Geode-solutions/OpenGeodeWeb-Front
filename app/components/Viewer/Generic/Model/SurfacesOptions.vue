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
  get: () => selection.includes("Surface"),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(modelId, "Surface", newValue);
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
  get: () => dataStyleStore.getModelComponentTypeColor(modelId, "Surface"),
  set: async (color) => {
    await dataStyleStore.setModelComponentTypeColor(modelId, "Surface", color);
    hybridViewerStore.remoteRender();
  },
});

const componentColor = computed({
  get: () =>
    componentId
      ? dataStyleStore.getModelComponentEffectiveColor(modelId, componentId, "Surface")
      : undefined,
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
const typeVertexAttrName = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelSurfacesVertexAttributeName(modelId, targetComponentIds[0])
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeName(modelId, targetComponentIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const typeVertexAttrRange = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelSurfacesVertexAttributeRange(modelId, targetComponentIds[0])
      : [undefined, undefined],
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

const typeVertexAttrColorMap = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelSurfacesVertexAttributeColorMap(modelId, targetComponentIds[0])
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeColorMap(
      modelId,
      targetComponentIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const typePolygonAttrName = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelSurfacesPolygonAttributeName(modelId, targetComponentIds[0])
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeName(
      modelId,
      targetComponentIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const typePolygonAttrRange = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelSurfacesPolygonAttributeRange(modelId, targetComponentIds[0])
      : [undefined, undefined],
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

const typePolygonAttrColorMap = computed({
  get: () =>
    targetComponentIds.length > 0
      ? dataStyleStore.modelSurfacesPolygonAttributeColorMap(modelId, targetComponentIds[0])
      : undefined,
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
const compVertexAttrName = computed({
  get: () =>
    componentId ? dataStyleStore.modelSurfacesVertexAttributeName(modelId, componentId) : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeName(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const compVertexAttrRange = computed({
  get: () =>
    componentId
      ? dataStyleStore.modelSurfacesVertexAttributeRange(modelId, componentId)
      : [undefined, undefined],
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

const compVertexAttrColorMap = computed({
  get: () =>
    componentId
      ? dataStyleStore.modelSurfacesVertexAttributeColorMap(modelId, componentId)
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeColorMap(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const compPolygonAttrName = computed({
  get: () =>
    componentId
      ? dataStyleStore.modelSurfacesPolygonAttributeName(modelId, componentId)
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeName(modelId, [componentId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const compPolygonAttrRange = computed({
  get: () =>
    componentId
      ? dataStyleStore.modelSurfacesPolygonAttributeRange(modelId, componentId)
      : [undefined, undefined],
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

const compPolygonAttrColorMap = computed({
  get: () =>
    componentId
      ? dataStyleStore.modelSurfacesPolygonAttributeColorMap(modelId, componentId)
      : undefined,
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

const vertexSchema = computed(
  () => back_schemas.opengeodeweb_back.model_component_vertex_attribute_names,
);

const polygonSchema = computed(
  () => back_schemas.opengeodeweb_back.model_component_polygon_attribute_names,
);
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
            v-model:vertex_attribute_name="typeVertexAttrName"
            v-model:vertex_attribute_range="typeVertexAttrRange"
            v-model:vertex_attribute_color_map="typeVertexAttrColorMap"
            v-model:polygon_attribute_name="typePolygonAttrName"
            v-model:polygon_attribute_range="typePolygonAttrRange"
            v-model:polygon_attribute_color_map="typePolygonAttrColorMap"
            :capabilities="capabilities"
            :vertexSchema="vertexSchema"
            :polygonSchema="polygonSchema"
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
            v-model:polygon_attribute_name="compPolygonAttrName"
            v-model:polygon_attribute_range="compPolygonAttrRange"
            v-model:polygon_attribute_color_map="compPolygonAttrColorMap"
            :capabilities="capabilities"
            :vertexSchema="vertexSchema"
            :polygonSchema="polygonSchema"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>
  </div>
</template>

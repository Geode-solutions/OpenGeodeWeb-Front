<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const dataStore = useDataStore();

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});

const modelId = computed(() => itemProps.meta_data.modelId || itemProps.id);
const componentId = computed(() => itemProps.meta_data.pickedComponentId);
const selection = dataStyleStore.visibleMeshComponents(modelId.value);
const componentType = ref(undefined);

watchEffect(async () => {
  if (itemProps.meta_data.viewer_type === "model_component_type") {
    componentType.value = itemProps.meta_data.modelComponentType;
  } else if (componentId.value && modelId.value) {
    componentType.value = await dataStore.meshComponentType(modelId.value, componentId.value);
  } else {
    componentType.value = undefined;
  }
});

const modelVisibility = computed({
  get: () => dataStyleStore.modelVisibility(modelId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelVisibility(modelId.value, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVisibility = computed({
  get: () => selection.value.includes(componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(
      modelId.value,
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const componentVisibility = computed({
  get: () => selection.value.includes(componentId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsVisibility(modelId.value, [componentId.value], newValue);
    hybridViewerStore.remoteRender();
  },
});

function getCapabilities(type) {
  if (type === "Block") {
    return {
      vertex: { available: true, hasColorMap: true },
      polyhedron: { available: true, hasColorMap: true },
    };
  } else if (type === "Surface") {
    return {
      vertex: { available: true, hasColorMap: true },
      polygon: { available: true, hasColorMap: true },
    };
  } else if (type === "Line") {
    return {
      vertex: { available: true, hasColorMap: true },
      edge: { available: true, hasColorMap: true },
    };
  } else if (type === "Corner") {
    return {
      vertex: { available: true, hasColorMap: true },
    };
  }
  return {
    vertex: { available: true, hasColorMap: true },
    cell: { available: true, hasColorMap: true },
    edge: { available: true, hasColorMap: true },
    polygon: { available: true, hasColorMap: true },
    polyhedron: { available: true, hasColorMap: true },
  };
}

const modelColorMode = computed({
  get: () => {
    if (selection.value.length > 0) {
      return dataStyleStore.getModelComponentColorMode(modelId.value, selection.value[0]);
    }
    return "constant";
  },
  set: async (newValue) => {
    if (selection.value.length > 0) {
      if (newValue === "random") {
        await dataStyleStore.setModelComponentsColor(
          modelId.value,
          selection.value,
          undefined,
          newValue,
        );
      } else {
        await dataStyleStore.setModelComponentsColor(
          modelId.value,
          selection.value,
          modelColor.value,
          newValue,
        );
      }
      hybridViewerStore.remoteRender();
    }
  },
});

const typeColorMode = computed({
  get: () =>
    componentType.value
      ? dataStyleStore.getModelComponentTypeColorMode(modelId.value, componentType.value)
      : "constant",
  set: async (newValue) => {
    if (componentType.value) {
      await dataStyleStore.setModelComponentTypeColorMode(
        modelId.value,
        componentType.value,
        newValue,
      );
      hybridViewerStore.remoteRender();
    }
  },
});

const compColorMode = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.getModelComponentColorMode(modelId.value, componentId.value)
      : "constant",
  set: async (newValue) => {
    if (componentId.value) {
      await dataStyleStore.setModelComponentColorMode(
        modelId.value,
        componentId.value,
        newValue,
      );
      hybridViewerStore.remoteRender();
    }
  },
});

const modelColoringStyleKey = computed({
  get: () => dataStyleStore.modelComponentColoringStyleKey(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentColoringStyleKey(
      modelId.value,
      undefined,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const modelColor = computed({
  get: () => dataStyleStore.modelComponentColor(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentColor(modelId.value, undefined, undefined, newValue);
    hybridViewerStore.remoteRender();
  },
});
const modelVertexAttributeName = computed({
  get: () => dataStyleStore.modelComponentAttributeName(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      undefined,
      undefined,
      newValue,
      "vertex",
    );
    hybridViewerStore.remoteRender();
  },
});
const modelVertexAttributeRange = computed({
  get: () => dataStyleStore.modelComponentAttributeRange(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      undefined,
      undefined,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const modelVertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelComponentAttributeColorMap(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      undefined,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const modelCellAttributeName = computed({
  get: () => dataStyleStore.modelComponentAttributeName(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      undefined,
      undefined,
      newValue,
      "cells",
    );
    hybridViewerStore.remoteRender();
  },
});
const modelCellAttributeRange = computed({
  get: () => dataStyleStore.modelComponentAttributeRange(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      undefined,
      undefined,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const modelCellAttributeColorMap = computed({
  get: () => dataStyleStore.modelComponentAttributeColorMap(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      undefined,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const modelEdgeAttributeName = computed({
  get: () => dataStyleStore.modelComponentAttributeName(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      undefined,
      undefined,
      newValue,
      "edges",
    );
    hybridViewerStore.remoteRender();
  },
});
const modelEdgeAttributeRange = computed({
  get: () => dataStyleStore.modelComponentAttributeRange(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      undefined,
      undefined,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const modelEdgeAttributeColorMap = computed({
  get: () => dataStyleStore.modelComponentAttributeColorMap(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      undefined,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const modelPolygonAttributeName = computed({
  get: () => dataStyleStore.modelComponentAttributeName(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      undefined,
      undefined,
      newValue,
      "polygons",
    );
    hybridViewerStore.remoteRender();
  },
});
const modelPolygonAttributeRange = computed({
  get: () => dataStyleStore.modelComponentAttributeRange(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      undefined,
      undefined,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const modelPolygonAttributeColorMap = computed({
  get: () => dataStyleStore.modelComponentAttributeColorMap(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      undefined,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const modelPolyhedronAttributeName = computed({
  get: () => dataStyleStore.modelComponentAttributeName(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      undefined,
      undefined,
      newValue,
      "polyhedra",
    );
    hybridViewerStore.remoteRender();
  },
});
const modelPolyhedronAttributeRange = computed({
  get: () => dataStyleStore.modelComponentAttributeRange(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      undefined,
      undefined,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const modelPolyhedronAttributeColorMap = computed({
  get: () => dataStyleStore.modelComponentAttributeColorMap(modelId.value, undefined, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      undefined,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const typeColoringStyleKey = computed({
  get: () =>
    dataStyleStore.modelComponentColoringStyleKey(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentColoringStyleKey(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const typeColor = computed({
  get: () => dataStyleStore.modelComponentColor(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentColor(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const typeVertexAttributeName = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeName(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
      "vertex",
    );
    hybridViewerStore.remoteRender();
  },
});
const typeVertexAttributeRange = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeRange(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      undefined,
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const typeVertexAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeColorMap(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const typeCellAttributeName = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeName(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
      "cells",
    );
    hybridViewerStore.remoteRender();
  },
});
const typeCellAttributeRange = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeRange(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      undefined,
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const typeCellAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeColorMap(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const typeEdgeAttributeName = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeName(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
      "edges",
    );
    hybridViewerStore.remoteRender();
  },
});
const typeEdgeAttributeRange = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeRange(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      undefined,
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const typeEdgeAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeColorMap(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const typePolygonAttributeName = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeName(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
      "polygons",
    );
    hybridViewerStore.remoteRender();
  },
});
const typePolygonAttributeRange = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeRange(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      undefined,
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const typePolygonAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeColorMap(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const typePolyhedronAttributeName = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeName(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
      "polyhedra",
    );
    hybridViewerStore.remoteRender();
  },
});
const typePolyhedronAttributeRange = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeRange(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      undefined,
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const typePolyhedronAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeColorMap(modelId.value, undefined, componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      undefined,
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const compColoringStyleKey = computed({
  get: () =>
    dataStyleStore.modelComponentColoringStyleKey(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentColoringStyleKey(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const compColor = computed({
  get: () => dataStyleStore.modelComponentColor(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentColor(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const compVertexAttributeName = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeName(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
      "vertex",
    );
    hybridViewerStore.remoteRender();
  },
});
const compVertexAttributeRange = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeRange(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      componentId.value,
      undefined,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const compVertexAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeColorMap(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const compCellAttributeName = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeName(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
      "cells",
    );
    hybridViewerStore.remoteRender();
  },
});
const compCellAttributeRange = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeRange(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      componentId.value,
      undefined,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const compCellAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeColorMap(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const compEdgeAttributeName = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeName(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
      "edges",
    );
    hybridViewerStore.remoteRender();
  },
});
const compEdgeAttributeRange = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeRange(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      componentId.value,
      undefined,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const compEdgeAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeColorMap(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const compPolygonAttributeName = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeName(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
      "polygons",
    );
    hybridViewerStore.remoteRender();
  },
});
const compPolygonAttributeRange = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeRange(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      componentId.value,
      undefined,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const compPolygonAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeColorMap(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const compPolyhedronAttributeName = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeName(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeName(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
      "polyhedra",
    );
    hybridViewerStore.remoteRender();
  },
});
const compPolyhedronAttributeRange = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeRange(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeRange(
      modelId.value,
      componentId.value,
      undefined,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const compPolyhedronAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelComponentAttributeColorMap(modelId.value, componentId.value, undefined),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentAttributeColorMap(
      modelId.value,
      componentId.value,
      undefined,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeLabel = computed(() =>
  componentType.value ? `${componentType.value}s Options` : "",
);
</script>

<template>
  <v-sheet class="model-style-card" color="transparent">
    <OptionsSection title="Model Options">
      <VisibilitySwitch v-model="modelVisibility" />
    </OptionsSection>

    <OptionsSection v-if="!componentType && !componentId" title="Components Options" class="mt-6">
      <ViewerOptionsColoringTypeSelector
        :id="modelId"
        :isModel="true"
        v-model:coloring_style_key="modelColoringStyleKey"
        v-model:color="modelColor"
        v-model:color_mode="modelColorMode"
        v-model:vertex_attribute_name="modelVertexAttributeName"
        v-model:vertex_attribute_range="modelVertexAttributeRange"
        v-model:vertex_attribute_color_map="modelVertexAttributeColorMap"
        v-model:cell_attribute_name="modelCellAttributeName"
        v-model:cell_attribute_range="modelCellAttributeRange"
        v-model:cell_attribute_color_map="modelCellAttributeColorMap"
        v-model:edge_attribute_name="modelEdgeAttributeName"
        v-model:edge_attribute_range="modelEdgeAttributeRange"
        v-model:edge_attribute_color_map="modelEdgeAttributeColorMap"
        v-model:polygon_attribute_name="modelPolygonAttributeName"
        v-model:polygon_attribute_range="modelPolygonAttributeRange"
        v-model:polygon_attribute_color_map="modelPolygonAttributeColorMap"
        v-model:polyhedron_attribute_name="modelPolyhedronAttributeName"
        v-model:polyhedron_attribute_range="modelPolyhedronAttributeRange"
        v-model:polyhedron_attribute_color_map="modelPolyhedronAttributeColorMap"
        :capabilities="getCapabilities(undefined)"
      />
    </OptionsSection>
 
    <OptionsSection v-if="componentType" :title="modelComponentTypeLabel" class="mt-6">
      <VisibilitySwitch v-model="modelComponentTypeVisibility" />
      <div v-if="modelComponentTypeVisibility" class="mt-4">
        <ViewerOptionsColoringTypeSelector
          :id="modelId"
          :isModel="true"
          v-model:coloring_style_key="typeColoringStyleKey"
          v-model:color="typeColor"
          v-model:color_mode="typeColorMode"
          v-model:vertex_attribute_name="typeVertexAttributeName"
          v-model:vertex_attribute_range="typeVertexAttributeRange"
          v-model:vertex_attribute_color_map="typeVertexAttributeColorMap"
          v-model:cell_attribute_name="typeCellAttributeName"
          v-model:cell_attribute_range="typeCellAttributeRange"
          v-model:cell_attribute_color_map="typeCellAttributeColorMap"
          v-model:edge_attribute_name="typeEdgeAttributeName"
          v-model:edge_attribute_range="typeEdgeAttributeRange"
          v-model:edge_attribute_color_map="typeEdgeAttributeColorMap"
          v-model:polygon_attribute_name="typePolygonAttributeName"
          v-model:polygon_attribute_range="typePolygonAttributeRange"
          v-model:polygon_attribute_color_map="typePolygonAttributeColorMap"
          v-model:polyhedron_attribute_name="typePolyhedronAttributeName"
          v-model:polyhedron_attribute_range="typePolyhedronAttributeRange"
          v-model:polyhedron_attribute_color_map="typePolyhedronAttributeColorMap"
          :capabilities="getCapabilities(componentType)"
          :componentType="componentType"
        />
      </div>
    </OptionsSection>
 
    <OptionsSection v-if="componentId" title="Component Options" class="mt-6">
      <VisibilitySwitch v-model="componentVisibility" />
      <div v-if="componentVisibility" class="mt-4">
        <ViewerOptionsColoringTypeSelector
          :id="modelId"
          :isModel="true"
          v-model:coloring_style_key="compColoringStyleKey"
          v-model:color="compColor"
          v-model:color_mode="compColorMode"
          v-model:vertex_attribute_name="compVertexAttributeName"
          v-model:vertex_attribute_range="compVertexAttributeRange"
          v-model:vertex_attribute_color_map="compVertexAttributeColorMap"
          v-model:cell_attribute_name="compCellAttributeName"
          v-model:cell_attribute_range="compCellAttributeRange"
          v-model:cell_attribute_color_map="compCellAttributeColorMap"
          v-model:edge_attribute_name="compEdgeAttributeName"
          v-model:edge_attribute_range="compEdgeAttributeRange"
          v-model:edge_attribute_color_map="compEdgeAttributeColorMap"
          v-model:polygon_attribute_name="compPolygonAttributeName"
          v-model:polygon_attribute_range="compPolygonAttributeRange"
          v-model:polygon_attribute_color_map="compPolygonAttributeColorMap"
          v-model:polyhedron_attribute_name="compPolyhedronAttributeName"
          v-model:polyhedron_attribute_range="compPolyhedronAttributeRange"
          v-model:polyhedron_attribute_color_map="compPolyhedronAttributeColorMap"
          :capabilities="getCapabilities(componentType)"
          :componentId="componentId"
          :componentType="componentType"
        />
      </div>
    </OptionsSection>
  </v-sheet>
</template>

<style scoped>
.model-style-card {
  padding-top: 20px;
  overflow-x: hidden;
}
</style>

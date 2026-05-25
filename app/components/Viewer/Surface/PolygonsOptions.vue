<script setup>
import PolygonalSurfacePolygons from "@ogw_front/assets/viewer_svgs/surface_triangles.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch";

import { useBatchStyle } from "@ogw_front/composables/use_batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
  tooltip: { type: String, required: false, default: "Polygons options" },
});

const id = toRef(() => itemProps.id);

const visibility = computed({
  get: () => dataStyleStore.meshPolygonsVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) => dataStyleStore.setMeshPolygonsVisibility(targetId, newValue));
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed({
  get: () => dataStyleStore.meshPolygonsActiveColoring(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) => dataStyleStore.setMeshPolygonsActiveColoring(targetId, newValue));
    hybridViewerStore.remoteRender();
  },
});
const color = computed({
  get: () => dataStyleStore.meshPolygonsColor(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) => dataStyleStore.setMeshPolygonsColor(targetId, newValue));
    hybridViewerStore.remoteRender();
  },
});
const textures = computed({
  get: () => dataStyleStore.meshPolygonsTextures(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) => dataStyleStore.setMeshPolygonsTextures(targetId, newValue));
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed({
  get: () => dataStyleStore.meshPolygonsVertexAttributeName(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) => dataStyleStore.setMeshPolygonsVertexAttributeName(targetId, newValue));
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed({
  get: () => dataStyleStore.meshPolygonsVertexAttributeRange(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) => dataStyleStore.setMeshPolygonsVertexAttributeRange(targetId, newValue[0], newValue[1]));
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed({
  get: () => dataStyleStore.meshPolygonsVertexAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) => dataStyleStore.setMeshPolygonsVertexAttributeColorMap(targetId, newValue));
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_name = computed({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeName(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) => dataStyleStore.setMeshPolygonsPolygonAttributeName(targetId, newValue));
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_range = computed({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeRange(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) => dataStyleStore.setMeshPolygonsPolygonAttributeRange(targetId, newValue[0], newValue[1]));
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_color_map = computed({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) => dataStyleStore.setMeshPolygonsPolygonAttributeColorMap(targetId, newValue));
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btn_image="PolygonalSurfacePolygons"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch v-model="visibility" />
      <template v-if="visibility">
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:textures="textures"
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_range="vertex_attribute_range"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:polygon_attribute_name="polygon_attribute_name"
          v-model:polygon_attribute_range="polygon_attribute_range"
          v-model:polygon_attribute_color_map="polygon_attribute_color_map"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

<script setup>
import EdgedCurveEdges from "@ogw_front/assets/viewer_svgs/edged_curve_edges.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch";
import ViewerOptionsWidthSlider from "@ogw_front/components/Viewer/Options/Sliders/Width";

import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});

const id = toRef(() => itemProps.id);

const visibility = computed({
  get: () => dataStyleStore.meshEdgesVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const width = computed({
  get: () => dataStyleStore.meshEdgesWidth(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesWidth(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed({
  get: () => dataStyleStore.meshEdgesActiveColoring(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed({
  get: () => dataStyleStore.meshEdgesColor(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed({
  get: () => dataStyleStore.meshEdgesVertexAttributeName(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesVertexAttributeName(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed({
  get: () => dataStyleStore.meshEdgesVertexAttributeRange(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesVertexAttributeRange(targetId, newValue[0], newValue[1]),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed({
  get: () => dataStyleStore.meshEdgesVertexAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesVertexAttributeColorMap(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_name = computed({
  get: () => dataStyleStore.meshEdgesEdgeAttributeName(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesEdgeAttributeName(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_range = computed({
  get: () => dataStyleStore.meshEdgesEdgeAttributeRange(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesEdgeAttributeRange(targetId, newValue[0], newValue[1]),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_color_map = computed({
  get: () => dataStyleStore.meshEdgesEdgeAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesEdgeAttributeColorMap(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>
<template>
  <ViewerContextMenuItem
    data-testid="meshEdgesMenu"
    :itemProps="itemProps"
    :btnImage="EdgedCurveEdges"
    tooltip="Edges options"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch data-testid="meshEdgesVisibilitySwitch" v-model="visibility" />
      <template v-if="visibility">
        <v-divider class="my-2" />
        <ViewerOptionsWidthSlider v-model="width" />
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_range="vertex_attribute_range"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:edge_attribute_name="edge_attribute_name"
          v-model:edge_attribute_range="edge_attribute_range"
          v-model:edge_attribute_color_map="edge_attribute_color_map"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

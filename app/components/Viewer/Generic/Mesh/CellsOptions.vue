<script setup>
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch";

import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

const { itemProps, btnImage, tooltip } = defineProps({
  itemProps: { type: Object, required: true },
  btnImage: { type: String, required: true },
  tooltip: { type: String, required: false, default: "Cells options" },
});

const id = toRef(() => itemProps.id);

const visibility = computed({
  get: () => dataStyleStore.meshCellsVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshCellsVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed({
  get: () => dataStyleStore.meshCellsActiveColoring(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshCellsActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed({
  get: () => dataStyleStore.meshCellsColor(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshCellsColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const textures = computed({
  get: () => dataStyleStore.meshCellsTextures(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshCellsTextures(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed({
  get: () => dataStyleStore.meshCellsVertexAttributeName(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshCellsVertexAttributeName(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed({
  get: () => dataStyleStore.meshCellsVertexAttributeRange(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshCellsVertexAttributeRange(targetId, newValue[0], newValue[1]),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed({
  get: () => dataStyleStore.meshCellsVertexAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshCellsVertexAttributeColorMap(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_name = computed({
  get: () => dataStyleStore.meshCellsCellAttributeName(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshCellsCellAttributeName(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_range = computed({
  get: () => dataStyleStore.meshCellsCellAttributeRange(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshCellsCellAttributeRange(targetId, newValue[0], newValue[1]),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_color_map = computed({
  get: () => dataStyleStore.meshCellsCellAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshCellsCellAttributeColorMap(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshCellsMenu"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btnImage="btnImage"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch data-testid="meshCellsVisibilitySwitch" v-model="visibility" />
      <template v-if="visibility">
        <v-divider />
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:textures="textures"
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_range="vertex_attribute_range"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:cell_attribute_name="cell_attribute_name"
          v-model:cell_attribute_range="cell_attribute_range"
          v-model:cell_attribute_color_map="cell_attribute_color_map"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

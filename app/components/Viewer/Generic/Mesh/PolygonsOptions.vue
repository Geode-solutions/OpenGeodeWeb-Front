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

const { itemProps, btn_image, tooltip } = defineProps({
  itemProps: { type: Object, required: true },
  btn_image: { type: String, required: true },
  tooltip: { type: String, required: false, default: "Polygons options" },
});

const id = toRef(() => itemProps.id);

const visibility = computed({
  get: () => dataStyleStore.meshPolygonsVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshPolygonsVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed({
  get: () => dataStyleStore.meshPolygonsActiveColoring(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshPolygonsActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed({
  get: () => dataStyleStore.meshPolygonsColor(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshPolygonsColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const textures = computed({
  get: () => dataStyleStore.meshPolygonsTextures(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshPolygonsTextures(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshPolygonsMenu"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btn_image="btn_image"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPolygonsVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <v-divider />
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:textures="textures"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

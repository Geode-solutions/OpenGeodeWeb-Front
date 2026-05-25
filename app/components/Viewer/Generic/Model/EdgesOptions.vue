<script setup>
import SurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch";

import { useBatchStyle } from "@ogw_front/composables/use_batch_style";
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
  get: () => dataStyleStore.modelEdgesVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setModelEdgesVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="modelEdgesMenu"
    :itemProps="itemProps"
    tooltip="Edges options"
    :btn_image="SurfaceEdges"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="modelEdgesVisibilitySwitch"
        v-model="visibility"
      />
    </template>
  </ViewerContextMenuItem>
</template>

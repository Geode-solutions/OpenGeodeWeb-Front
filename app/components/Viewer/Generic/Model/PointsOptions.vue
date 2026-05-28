<script setup>
import SurfacePoints from "@ogw_front/assets/viewer_svgs/surface_points.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import ViewerOptionsSizeSlider from "@ogw_front/components/Viewer/Options/Sliders/Size";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch";

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
  get: () => dataStyleStore.modelPointsVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setModelPointsVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const size = computed({
  get: () => dataStyleStore.modelPointsSize(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setModelPointsSize(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="modelPointsMenu"
    :itemProps="itemProps"
    tooltip="Points options"
    :btn_image="SurfacePoints"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="modelPointsVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <v-divider />
        <ViewerOptionsSizeSlider data-testid="modelPointsSizeSlider" v-model="size" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

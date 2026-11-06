<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import EdgedCurveEdges from "@ogw_front/assets/viewer_svgs/edged_curve_edges.svg";
import type { MeshId } from "@ogw_front/types/identifiers";
import ViewerEdgedCurveSpecificEdgesColoring from "@ogw_front/components/Viewer/EdgedCurve/SpecificEdgesColoring.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import ViewerOptionsWidthSlider from "@ogw_front/components/Viewer/Options/Sliders/Width.vue";
import type { Visibility } from "@ogw_front/types/style";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();

const dataId = toRef(() => itemProps.id);

const visibility = computed<Visibility>({
  get: () => dataStyleStore.meshEdgesVisibility(dataId.value),
  set: async (newValue) => {
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      dataStyleStore.setMeshEdgesVisibility(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const width = computed<number>({
  get: () => dataStyleStore.meshEdgesWidth(dataId.value),
  set: async (newValue) => {
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      dataStyleStore.setMeshEdgesWidth(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshEdgesMenu"
    :index="itemProps.index!"
    :itemProps="itemProps"
    :btnImage="EdgedCurveEdges"
    tooltip="Edges options"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch data-testid="meshEdgesVisibilitySwitch" v-model="visibility" />
      <template v-if="visibility">
        <v-divider class="my-2" />
        <ViewerOptionsWidthSlider data-testid="meshEdgesWidthSlider" v-model="width" />
        <ViewerEdgedCurveSpecificEdgesColoring :data-id="dataId" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

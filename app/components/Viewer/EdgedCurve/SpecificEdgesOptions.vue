<script setup lang="ts">
import type { EdgeWidth, Visibility } from "@geode/opengeodeweb-viewer/schema_types";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import EdgedCurveEdges from "@ogw_front/assets/viewer_svgs/edged_curve_edges.svg";
import type { MenuItemIndex } from "@ogw_front/types/ui";
import type { MeshId } from "@ogw_front/types/identifiers";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerEdgedCurveSpecificEdgesColoring from "@ogw_front/components/Viewer/EdgedCurve/SpecificEdgesColoring.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import ViewerOptionsWidthSlider from "@ogw_front/components/Viewer/Options/Sliders/Width.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  dataId: DataId;
  index: MenuItemIndex;
}

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

const { dataId, index } = defineProps<Props>();

const visibility = computed<Visibility>({
  get: () => dataStyleStore.meshEdgesVisibility(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshEdgesVisibility(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const width = computed<EdgeWidth>({
  get: () => dataStyleStore.meshEdgesWidth(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshEdgesWidth(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshEdgesMenu"
    :index="index"
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

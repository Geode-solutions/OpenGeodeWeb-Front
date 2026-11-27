<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshCellsColoring from "@ogw_front/components/Viewer/Generic/Mesh/CellsColoring.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import type { Visibility } from "@geode/opengeodeweb-viewer/schema_types";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  dataId: DataId;
  index: number;
  btnImage: string;
  tooltip?: string;
}

const { dataId, index, btnImage, tooltip = "Cells options" } = defineProps<Props>();

const visibility = computed<Visibility>({
  get: () => dataStyleStore.meshCellsVisibility(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshCellsVisibility(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshCellsMenu"
    :index="index"
    :tooltip="tooltip"
    :btnImage="btnImage"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch data-testid="meshCellsVisibilitySwitch" v-model="visibility" />
      <template v-if="visibility">
        <v-divider />
        <ViewerGenericMeshCellsColoring :data-id="dataId" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshPolyhedraColoring from "@ogw_front/components/Viewer/Generic/Mesh/PolyhedraColoring.vue";
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

const { dataId, index, btnImage, tooltip = "Polyhedra options" } = defineProps<Props>();

const visibility = computed<Visibility>({
  get: () => dataStyleStore.meshPolyhedraVisibility(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshPolyhedraVisibility(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshPolyhedraMenu"
    :index="index"
    :tooltip="tooltip"
    :btnImage="btnImage"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPolyhedraVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <v-divider />
        <ViewerGenericMeshPolyhedraColoring :data-id="dataId" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

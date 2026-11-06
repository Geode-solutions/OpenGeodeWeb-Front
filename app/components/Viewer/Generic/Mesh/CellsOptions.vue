<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshCellsColoring from "@ogw_front/components/Viewer/Generic/Mesh/CellsColoring.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ItemProps & { index?: number };
  btnImage: string;
  tooltip?: string;
}

const { itemProps, btnImage, tooltip = "Cells options" } = defineProps<Props>();

const dataId = toRef(() => itemProps.id);

const visibility = computed<boolean>({
  get: () => dataStyleStore.meshCellsVisibility(dataId.value),
  set: async (newValue) => {
    await applyBatchStyle(dataId.value, (targetId: string) =>
      dataStyleStore.setMeshCellsVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshCellsMenu"
    :index="itemProps.index!"
    :itemProps="itemProps"
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

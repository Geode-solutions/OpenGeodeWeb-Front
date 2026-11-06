<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshPolyhedraColoring from "@ogw_front/components/Viewer/Generic/Mesh/PolyhedraColoring.vue";
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

const { itemProps, btnImage, tooltip = "Polyhedra options" } = defineProps<Props>();

const id = toRef(() => itemProps.id);

const visibility = computed<boolean>({
  get: () => dataStyleStore.meshPolyhedraVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshPolyhedraMenu"
    :index="itemProps.index!"
    :itemProps="itemProps"
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
        <ViewerGenericMeshPolyhedraColoring :data-id="id" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

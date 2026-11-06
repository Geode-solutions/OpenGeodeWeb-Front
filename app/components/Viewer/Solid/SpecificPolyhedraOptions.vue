<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import SolidPolyhedra from "@ogw_front/assets/viewer_svgs/solid_polyhedra.svg";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import ViewerSolidSpecificPolyhedraColoring from "@ogw_front/components/Viewer/Solid/SpecificPolyhedraColoring.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ItemProps & { index: number };
  tooltip?: string;
}

const { itemProps, tooltip = "Polyhedra options" } = defineProps<Props>();

const dataId = toRef(() => itemProps.id);

const visibility = computed<boolean>({
  get: () => dataStyleStore.meshPolyhedraVisibility(dataId.value),
  set: async (newValue) => {
    await applyBatchStyle(dataId.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshPolyhedraMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btnImage="SolidPolyhedra"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPolyhedraVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <ViewerSolidSpecificPolyhedraColoring :data-id="dataId" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

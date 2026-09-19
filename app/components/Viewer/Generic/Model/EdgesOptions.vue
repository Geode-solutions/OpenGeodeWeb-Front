<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import SurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();

const id = computed(() => (itemProps.meta_data.modelId as string | undefined) || itemProps.id);

const visibility = computed({
  get: () => dataStyleStore.modelEdgesVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setModelEdgesVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="modelEdgesMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    tooltip="Edges options"
    :btnImage="SurfaceEdges"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="modelEdgesVisibilitySwitch"
        v-model="visibility"
      />
    </template>
  </ViewerContextMenuItem>
</template>

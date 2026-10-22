<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ModelEdgesCard from "./ModelEdgesCard.vue";
import SurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg";

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();
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
      <ModelEdgesCard :itemProps="itemProps" />
    </template>
  </ViewerContextMenuItem>
</template>
